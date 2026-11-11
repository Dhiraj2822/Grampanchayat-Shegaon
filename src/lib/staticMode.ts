// Static mode configuration
export const STATIC_MODE = false; // Set to false when Supabase is working

// Demo user for static mode
export const DEMO_USER = {
  id: 'demo-user-123',
  email: 'admin@shegaon.gov.in',
  full_name: 'Super Admin',
  role: 'super_admin',
  mobile: '9876543210'
};

// Mock Supabase responses for static mode
export class StaticSupabase {
  auth = {
    getUser: async () => ({ 
      data: { user: { id: DEMO_USER.id, email: DEMO_USER.email } }, 
      error: null 
    }),
    getSession: async () => ({ 
      data: { session: { user: { id: DEMO_USER.id, email: DEMO_USER.email } } }, 
      error: null 
    }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ 
      data: { user: { id: DEMO_USER.id, email: DEMO_USER.email } }, 
      error: null 
    }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  };

  from = (table: string) => ({
    select: () => ({ 
      eq: () => ({ 
        data: table === 'profiles' ? [DEMO_USER] : [], 
        error: null 
      }),
      data: table === 'profiles' ? [DEMO_USER] : [], 
      error: null 
    }),
    update: () => ({ 
      eq: () => ({ data: null, error: null }),
      data: null, 
      error: null 
    }),
    insert: () => ({ data: null, error: null })
  });
}

export const staticSupabase = new StaticSupabase();