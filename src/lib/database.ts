/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from './supabase';
import type { Content, Category, ContentSection, AccessRequest } from '../types';

// Fetch functions
export async function fetchContent(): Promise<Content[]> {
  // Legacy content table removed; return empty until new CMS views are wired
  return [];
}

export async function fetchCategories(): Promise<Category[]> {
  // Legacy categories table removed; return empty
  return [];
}

export async function fetchSections(): Promise<ContentSection[]> {
  // Legacy content sections removed; return empty
  return [];
}

export async function fetchAccessRequests(): Promise<AccessRequest[]> {
  // Legacy access_requests removed; return empty
  return [];
}

// Insert functions
export async function addContent(_data: Omit<Content, 'id' | 'created_at' | 'updated_at'>) {
  // Legacy content insert disabled in new schema
  throw new Error('Legacy content API disabled');
}

export async function addCategory(_data: Omit<Category, 'id' | 'created_at'>) {
  throw new Error('Legacy categories API disabled');
}

export async function addSection(_data: Omit<ContentSection, 'id' | 'created_at'>) {
  throw new Error('Legacy content sections API disabled');
}

// Update functions
export async function updateContent(_id: string, _data: Partial<Content>) {
  throw new Error('Legacy content API disabled');
}

export async function updateSection(_id: string, _data: Partial<ContentSection>) {
  throw new Error('Legacy content sections API disabled');
}

export async function updateAccessRequest(_id: string, _data: Partial<AccessRequest>) {
  throw new Error('Legacy access requests API disabled');
}

// Delete functions
export async function deleteContent(_id: string) {
  throw new Error('Legacy content API disabled');
}

export async function deleteSection(_id: string) {
  throw new Error('Legacy content sections API disabled');
}

// File upload function (using Supabase Storage)
export async function uploadFile(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `uploads/${fileName}`;

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file);

  if (error) {
    console.error('File upload error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  return publicUrl;
}

// Grant user access to protected content (user_id only)
export async function grantUserAccess(
  contentId: string, 
  userId: string, 
  expiresAt?: string
) {
  const { error } = await supabase
    .rpc('grant_user_access_with_notification', {
      content_uuid: contentId,
      target_user_id: userId,
      admin_user_id: (await supabase.auth.getUser()).data.user?.id,
      expires_at_param: expiresAt || null
    });

  if (error) throw error;
  return { success: true };
}

// Check if user has access to protected content (strict user_id only)
export async function checkUserAccess(contentId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('check_strict_user_access', {
        content_uuid: contentId,
        user_id_param: userId
      });

    if (error) throw error;
    return { status: data ? 'granted' : 'denied' };
  } catch (error) {
    console.error('Error checking access:', error);
    return { status: 'denied' };
  }
}

// Get user by email (for admin to grant access)
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      auth_user:user_id (
        id,
        email
      )
    `)
    .eq('auth_user.email', email)
    .single();

  if (error) throw error;
  return data;
}

// Get all users (for admin)
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Get auth user data separately to avoid relationship issues
  const enrichedData = await Promise.all((data || []).map(async (profile) => {
    const { data: authData } = await supabase.auth.admin.getUserById(profile.user_id);
    
    return {
      ...profile,
      auth_user: authData.user ? {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed_at: authData.user.email_confirmed_at
      } : null
    };
  }));
  
  return enrichedData;
}

// Fetch email notifications (for admin)
export async function fetchEmailNotifications() {
  const { data, error } = await supabase
    .from('email_notifications')
    .select('*')
    .order('sent_at', { ascending: false });

  if (error) throw error;
  
  // Get content titles separately to avoid relationship issues
  const enrichedData = await Promise.all((data || []).map(async (notification) => {
    let content_title = null;
    
    if (notification.content_id) {
      const { data: contentData } = await supabase
        .from('content')
        .select('title')
        .eq('id', notification.content_id)
        .single();
      if (contentData) content_title = contentData.title;
    }
    
    return {
      ...notification,
      content: content_title ? { title: content_title } : null
    };
  }));
  
  return enrichedData;
}