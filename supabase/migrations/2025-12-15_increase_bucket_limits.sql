-- Update storage bucket size limits to support larger files
-- This migration increases the limit for the 'uploads' bucket to 50MB

-- Update the 'uploads' bucket configuration
UPDATE storage.buckets
SET file_size_limit = 52428800 -- 50MB in bytes
WHERE id = 'uploads';

-- Also update 'official_docs' if it exists (for signed certificates)
UPDATE storage.buckets
SET file_size_limit = 20971520 -- 20MB in bytes
WHERE id = 'official_docs';

-- Also update 'citizen_uploads' if it exists
UPDATE storage.buckets
SET file_size_limit = 10485760 -- 10MB in bytes
WHERE id = 'citizen_uploads';
