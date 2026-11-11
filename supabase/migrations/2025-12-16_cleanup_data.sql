-- ==========================================
-- CLEANUP SCRIPT: SAFELY REMOVE ALL TEST DATA
-- ==========================================
-- This script uses TRUNCATE which is faster and safer for clearing tables.
-- It will NOT fail if tables are already empty.
-- RESTART IDENTITY resets any auto-increment counters (if used).
-- CASCADE ensures any dependent rows in other tables are also removed.

BEGIN;

-- 1. Clear Citizen Data (Applications & Forms)
TRUNCATE TABLE public.cit_birth_certificate RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cit_death_certificate RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cit_marriage_certificate RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cit_bpl_certificate RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cit_property_tax_extract RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cit_destitute_certificate RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.rti_applications RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.grievances RESTART IDENTITY CASCADE;

-- 2. Clear CMS Content (Static Slides, Forms, News, etc.)
TRUNCATE TABLE public.cms_carousel RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_downloads RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_flash_news RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_tenders RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_development_works RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_schemes RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_elected_officials RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_staff RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_gallery RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_video_gallery RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_committees RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_contact_info RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cms_budget_items RESTART IDENTITY CASCADE;

-- 3. Clear Storage Files (Metadata only)
-- This removes file references from the storage.objects table.
-- Note: This does not delete the actual files from the disk/S3, but Supabase
-- will eventually clean up orphaned objects or they become inaccessible.
-- To be safe, we only delete objects in the 'uploads' bucket.
DELETE FROM storage.objects WHERE bucket_id = 'uploads';

COMMIT;
