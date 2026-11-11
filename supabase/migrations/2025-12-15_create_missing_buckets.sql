-- Create missing storage buckets for better security and organization
-- Run this migration to set up dedicated buckets for citizen documents and official certificates

-- 1. Create 'citizen_uploads' bucket (Private - Authenticated users only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('citizen_uploads', 'citizen_uploads', false, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']::text[])
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 5242880;

-- Policies for citizen_uploads
CREATE POLICY "Give users access to own folder 1uh2_0" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'citizen_uploads' AND (auth.uid()::text = (storage.foldername(name))[1]));
CREATE POLICY "Give users access to own folder 1uh2_1" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'citizen_uploads' AND (auth.uid()::text = (storage.foldername(name))[1]));
CREATE POLICY "Give users access to own folder 1uh2_2" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'citizen_uploads' AND (auth.uid()::text = (storage.foldername(name))[1]));
CREATE POLICY "Give users access to own folder 1uh2_3" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'citizen_uploads' AND (auth.uid()::text = (storage.foldername(name))[1]));

-- Allow admins to view all citizen uploads
CREATE POLICY "Admins can view all citizen uploads" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'citizen_uploads' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));


-- 2. Create 'official_docs' bucket (Public - for certificates)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('official_docs', 'official_docs', true, 5242880, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880;

-- Policies for official_docs
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'official_docs');
CREATE POLICY "Admins can upload certificates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'official_docs' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can update certificates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'official_docs' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can delete certificates" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'official_docs' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
