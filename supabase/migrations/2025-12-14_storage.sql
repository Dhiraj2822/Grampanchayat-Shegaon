-- Storage Buckets Setup
-- Run this in Supabase SQL Editor AFTER running the schema

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('uploads', 'uploads', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']::text[])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']::text[];

-- Storage Policies for 'uploads' bucket

-- Allow public read access to all files
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own uploads or admins to update any
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'uploads' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Allow users to delete their own uploads or admins to delete any
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Alternative: Simple policies that allow admins full access
-- If the above policies cause issues, you can use these simpler ones:

-- DROP POLICY IF EXISTS "Admin full access" ON storage.objects;
-- CREATE POLICY "Admin full access" ON storage.objects
--   FOR ALL USING (
--     bucket_id = 'uploads' 
--     AND EXISTS (
--       SELECT 1 FROM public.profiles 
--       WHERE id = auth.uid() 
--       AND role IN ('admin', 'super_admin')
--     )
--   );
