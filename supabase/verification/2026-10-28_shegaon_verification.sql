-- Read-only verification for a fresh Shegaon Supabase project.
-- Run after all required migrations. This script performs no writes.

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'cms_website_settings',
    'cms_elected_officials',
    'cms_staff',
    'cms_development_works',
    'cms_schemes',
    'cms_tenders',
    'cms_flash_news',
    'cms_downloads',
    'cms_video_gallery',
    'cms_gallery',
    'cms_carousel',
    'cms_contact_info',
    'cms_village_info',
    'cms_committees',
    'cms_budget_items',
    'cms_budget_documents',
    'cms_bpl_families',
    'cms_gpdp_projects',
    'cms_gram_sabha_meetings',
    'cit_birth_certificate',
    'cit_death_certificate',
    'cit_marriage_certificate',
    'cit_bpl_certificate',
    'cit_property_tax_extract',
    'cit_destitute_certificate',
    'cit_no_dues_certificate',
    'cit_complaints',
    'cit_service_requests',
    'rti_applications',
    'property_tax',
    'water_tax',
    'payments',
    'cms_service_charges',
    'user_management_logs',
    'activity_logs',
    'system_settings'
  )
ORDER BY table_name;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'cms_website_settings' AND column_name IN (
      'setting_type', 'setting_key', 'setting_value'
    ))
    OR (table_name = 'profiles' AND column_name IN (
      'id', 'email', 'full_name', 'phone', 'role'
    ))
    OR (table_name IN (
      'cit_birth_certificate', 'cit_death_certificate',
      'cit_marriage_certificate', 'cit_bpl_certificate',
      'cit_property_tax_extract', 'cit_destitute_certificate',
      'cit_no_dues_certificate'
    ) AND column_name IN (
      'id', 'user_id', 'application_number', 'status',
      'admin_remark', 'signed_document_url', 'created_at'
    ))
  )
ORDER BY table_name, ordinal_position;

SELECT routine_schema, routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema IN ('public', 'private')
  AND routine_name IN (
    'handle_new_user',
    'promote_user_to_admin',
    'demote_admin_to_citizen',
    'is_admin',
    'is_super_admin'
  )
ORDER BY routine_schema, routine_name;

SELECT schemaname, viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN (
    'admin_pending_certificates',
    'admin_open_complaints',
    'service_requests',
    'complaints'
  )
ORDER BY viewname;

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'cms_website_settings',
    'cms_bpl_families',
    'cit_complaints',
    'cit_service_requests',
    'rti_applications',
    'property_tax',
    'water_tax'
  )
ORDER BY tablename;

SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
  AND tablename IN (
    'profiles',
    'cms_bpl_families',
    'cit_complaints',
    'cit_service_requests',
    'rti_applications',
    'property_tax',
    'water_tax',
    'objects'
  )
ORDER BY schemaname, tablename, policyname;

SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('uploads', 'citizen_uploads', 'official_docs')
ORDER BY id;

SELECT setting_type, setting_key, setting_value
FROM public.cms_website_settings
WHERE setting_key IN (
  'village_name', 'village_name_mr', 'population',
  'voter_count', 'male_voters', 'female_voters',
  'phone_number', 'email',
  'gram_panchayat_officer_name', 'gram_panchayat_officer_name_mr'
)
ORDER BY setting_type, setting_key;
