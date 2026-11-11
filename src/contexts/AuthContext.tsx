/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  role: 'citizen' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, mobile: string) => Promise<{ needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => {
    // Only show loading if there's no cached session
    const cached = typeof window !== 'undefined' ? localStorage.getItem('sb-auth-token') : null;
    return !cached; // If cached token exists, don't show loading
  });

  useEffect(() => {
    let isMounted = true;
    
    // Initialize auth state
    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get session from Supabase (will check localStorage automatically)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        if (session?.user && isMounted) {
          console.log('Found existing session for:', session.user.email);
          setUser(session.user);
          
          // Try to load cached profile first
          const cachedProfile = localStorage.getItem('user_profile');
          if (cachedProfile) {
            try {
              const parsedProfile = JSON.parse(cachedProfile);
              if (parsedProfile.id === session.user.id) {
                console.log('Using cached profile:', parsedProfile);
                setProfile(parsedProfile);
              }
            } catch {
              console.log('Invalid cached profile, will fetch fresh');
            }
          }
          
          // Always fetch fresh profile data to ensure accuracy
          await fetchProfile(session.user.id);
        } else {
          console.log('No existing session');
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes AFTER initial load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        // Skip INITIAL_SESSION as we handle it in initAuth
        if (event === 'INITIAL_SESSION') {
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user && isMounted) {
            console.log('User signed in:', session.user.email);
            setUser(session.user);
            await fetchProfile(session.user.id);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    return await fetchProfileWithRetry(userId, 0);
  };

  const fetchProfileWithRetry = async (userId: string, retryCount: number = 0) => {
    try {
      console.log(`Fetching profile for user: ${userId} (attempt ${retryCount + 1})`);
      
      // Check Supabase configuration only on first attempt
      if (retryCount === 0) {
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      }
      
      // Shorter timeout - 5 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
      );
      
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('Starting query...');
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      console.log('Query completed:', { data, error });
      
      if (error) {
        console.error('Error fetching profile:', error);
        
        if (error.message?.includes('JWT expired') || error.message?.includes('Invalid JWT')) {
          console.log('JWT token issue, signing out...');
          await supabase.auth.signOut();
          return;
        }
        
        if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('401')) {
          console.log('Permission denied - database policies may be blocking access');
          console.log('Please run remove-all-restrictions.sql in Supabase SQL Editor');
        }
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') { // No rows returned
          console.log('Profile not found, creating new profile...');
          await createProfile(userId);
          return;
        }
        return;
      }

      if (data) {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        
        // Store in localStorage for persistence
        localStorage.setItem('user_profile', JSON.stringify(data));
      } else {
        console.log('No profile data returned, creating profile...');
        await createProfile(userId);
      }
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      
      // Auto-retry for timeouts
      if (error.message?.includes('timeout') && retryCount < 2) {
        console.log(`Retrying profile fetch in 2 seconds... (attempt ${retryCount + 2})`);
        setTimeout(() => fetchProfileWithRetry(userId, retryCount + 1), 2000);
        return;
      }
      
      // If still failing after retries, try creating profile
      if (retryCount >= 2) {
        console.log('Max retries reached, attempting to create profile...');
        await createProfile(userId);
      }
    }
  };

  const createProfile = async (userId: string) => {
    try {
      // Get user info from auth.users
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      console.log('Creating profile for user:', user.email);
      
      const profileData = {
        id: userId,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        phone: user.user_metadata?.phone || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      console.log('Profile created successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, mobile: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName,
            phone: mobile,
            email: email
          }
        }
      });

      if (error) throw error;
      
      // If user is created and confirmed, create profile immediately
      if (data.user && data.user.email_confirmed_at) {
        await fetchProfile(data.user.id);
      }
      
      // Return whether email confirmation is needed
      return { needsConfirmation: !data.user?.email_confirmed_at };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        }
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        throw new Error('Please confirm your email before signing in.');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('SignOut called'); // Debug log
      setLoading(true);
      
      // Clear local state immediately
      setUser(null);
      setProfile(null);
      
      // First, sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
      }
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached data
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          registration.unregister();
        }
      }
      
      // Force immediate redirect
      window.location.replace('/');
      
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Even if there's an error, clear everything and redirect
      setUser(null);
      setProfile(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  const refreshProfile = async () => {
    try {
      if (!user) {
        console.log('No user to refresh profile for');
        return;
      }
      
      console.log('Refreshing profile for user:', user.id, user.email);
      
      // Force fresh fetch without clearing current profile to avoid UI flicker
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing profile:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          await createProfile(user.id);
        }
        return;
      }

      if (data) {
        console.log('Profile refreshed successfully:', data);
        setProfile(data);
        
        // Store in localStorage for persistence across page reloads
        localStorage.setItem('user_profile', JSON.stringify(data));
      }
      
      console.log('Profile refresh completed');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error;
    }
  };
  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Keep named export `AuthProvider` only to ensure consistent HMR exports