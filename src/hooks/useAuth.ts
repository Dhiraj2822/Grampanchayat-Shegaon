/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      checkAdminStatus(session?.user || null);
      fetchUserProfile(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setUser(session?.user || null);
        checkAdminStatus(session?.user || null);
        fetchUserProfile(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    // Check if user has admin role in their JWT claims
    const { data } = await supabase.auth.getUser();
    const userMetadata = data.user?.user_metadata;
    const isAdminUser = userMetadata?.role === 'admin' || userMetadata?.role === 'super_admin';
    
    setIsAdmin(isAdminUser);
  };

  const fetchUserProfile = async (user: User | null) => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUserProfile(null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || ''
          }
        }
      });

      if (error) throw error;

      // Create profile row in new schema
      if (data.user) {
        try {
          await supabase
            .from('profiles')
            .upsert([{
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              phone: phone || '',
              role: 'citizen'
            }]);
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail the signup if profile creation fails
        }
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) return { success: false, error: 'User not logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert([{
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    session,
    isAdmin,
    loading,
    userProfile,
    login,
    logout,
    signUp,
    updateProfile
  };
}