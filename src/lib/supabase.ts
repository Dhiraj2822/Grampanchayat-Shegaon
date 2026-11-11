import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key environment variables are not set.');
}

// Custom storage that safely handles localStorage with UTF-8 encoding
const customStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      const item = window.localStorage.getItem(key);
      // Ensure UTF-8 handling for special characters
      return item ? decodeURIComponent(item) : null;
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      // Ensure proper UTF-8 encoding when storing
      window.localStorage.setItem(key, encodeURIComponent(value));
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sb-auth-token',
      storage: customStorage
    },
    // Use explicit UTF-8 for database connection
    db: {
      schema: 'public'
    }
  }
);

// Types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          name_hi: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_hi?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_hi?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      content_sections: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          order_index: number;
          is_featured: boolean;
          featured_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          order_index?: number;
          is_featured?: boolean;
          featured_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          is_featured?: boolean;
          featured_order?: number;
          created_at?: string;
        };
      };
      content: {
        Row: {
          id: string;
          title: string;
          description: string;
          detailed_info: string | null;
          content_type: 'video' | 'image' | 'document' | 'youtube';
          url: string;
          category_id: string | null;
          section_id: string | null;
          is_protected: boolean;
          is_featured: boolean;
          featured_order: number;
          order_index: number;
          video_duration: number | null;
          file_size: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          detailed_info?: string | null;
          content_type: 'video' | 'image' | 'document' | 'youtube';
          url: string;
          category_id?: string | null;
          section_id?: string | null;
          is_protected?: boolean;
          is_featured?: boolean;
          featured_order?: number;
          order_index?: number;
          video_duration?: number | null;
          file_size?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          detailed_info?: string | null;
          content_type?: 'video' | 'image' | 'document' | 'youtube';
          url?: string;
          category_id?: string | null;
          section_id?: string | null;
          is_protected?: boolean;
          is_featured?: boolean;
          featured_order?: number;
          order_index?: number;
          video_duration?: number | null;
          file_size?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      access_requests: {
        Row: {
          id: string;
          content_id: string | null;
          user_name: string;
          user_email: string;
          user_phone: string;
          message: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          content_id?: string | null;
          user_name: string;
          user_email: string;
          user_phone: string;
          message?: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          content_id?: string | null;
          user_name?: string;
          user_email?: string;
          user_phone?: string;
          message?: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
      };
    };
  };
};