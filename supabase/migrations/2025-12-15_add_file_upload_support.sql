-- Migration to add file upload support to CMS tables
-- This migration adds file_path columns to support direct file uploads
-- while maintaining backward compatibility with URL fields

BEGIN;

-- 1. ALTER TENDERS TABLE - add file_path support
ALTER TABLE public.cms_tenders 
ADD COLUMN IF NOT EXISTS file_path text,
ADD COLUMN IF NOT EXISTS file_name text;

-- 2. ALTER DOWNLOADS TABLE - replace file_url with file_path
ALTER TABLE public.cms_downloads 
ADD COLUMN IF NOT EXISTS file_path text,
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_size integer,
ADD COLUMN IF NOT EXISTS file_type text;

-- Keep file_url for backward compatibility but it's now optional
ALTER TABLE public.cms_downloads 
ALTER COLUMN file_url DROP NOT NULL;

-- 3. ALTER VIDEO GALLERY - add support for uploaded videos
ALTER TABLE public.cms_video_gallery 
ADD COLUMN IF NOT EXISTS video_file_path text,
ADD COLUMN IF NOT EXISTS video_file_name text,
ADD COLUMN IF NOT EXISTS upload_type text DEFAULT 'YouTube' CHECK (upload_type IN ('YouTube', 'Upload'));

-- 4. ALTER GALLERY - add file_path support
ALTER TABLE public.cms_gallery 
ADD COLUMN IF NOT EXISTS file_path text,
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_size integer;

-- Keep image_url for backward compatibility
ALTER TABLE public.cms_gallery 
ALTER COLUMN image_url DROP NOT NULL;

-- Create index for faster lookups by file_path
CREATE INDEX IF NOT EXISTS idx_tenders_file_path ON public.cms_tenders(file_path);
CREATE INDEX IF NOT EXISTS idx_downloads_file_path ON public.cms_downloads(file_path);
CREATE INDEX IF NOT EXISTS idx_gallery_file_path ON public.cms_gallery(file_path);
CREATE INDEX IF NOT EXISTS idx_video_gallery_file_path ON public.cms_video_gallery(video_file_path);

-- Add audit trail columns to downloads (most commonly viewed)
ALTER TABLE public.cms_downloads 
ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_at timestamptz;

-- Add status column for file processing
ALTER TABLE public.cms_downloads 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending'));

-- Similar for tenders
ALTER TABLE public.cms_tenders 
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at timestamptz;

COMMIT;
