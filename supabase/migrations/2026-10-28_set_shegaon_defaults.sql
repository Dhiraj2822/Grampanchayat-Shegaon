-- Configure the fresh installation for Gram Panchayat Shegaon.
-- Run this after the other migrations and after creating the new Supabase project.
BEGIN;

INSERT INTO public.cms_website_settings (setting_type, setting_key, setting_value)
VALUES
  ('BASIC_INFO', 'village_name', 'Shegaon'),
  ('BASIC_INFO', 'village_name_mr', 'शेगाव'),
  ('BASIC_INFO', 'village_name_hi', 'शेगांव'),
  ('BASIC_INFO', 'population', '2241'),
  ('BASIC_INFO', 'general_population', '1541'),
  ('BASIC_INFO', 'sc_population', '301'),
  ('BASIC_INFO', 'st_population', '399'),
  ('BASIC_INFO', 'voter_count', '1603'),
  ('BASIC_INFO', 'male_voters', '866'),
  ('BASIC_INFO', 'female_voters', '737'),
  ('CONTACT', 'phone_number', '8999939667'),
  ('CONTACT', 'email', 'grampanchayatshegaon908@gmail.com'),
  ('CONTACT', 'office_address', 'Gram Panchayat Office, Shegaon'),
  ('CONTACT', 'office_address_mr', 'ग्रामपंचायत कार्यालय, शेगाव'),
  ('CONTACT', 'gram_panchayat_officer_name', 'Mrs. Jadhav S. K.'),
  ('CONTACT', 'gram_panchayat_officer_name_mr', 'श्रीमती जाधव एस. के.'),
  ('CONTACT', 'officer_email', 'saritarathod028@gmail.com'),
  ('APPEARANCE', 'hero_title', 'Welcome to Digital Shegaon'),
  ('APPEARANCE', 'hero_title_mr', 'डिजिटल शेगावमध्ये आपले स्वागत')
ON CONFLICT (setting_type, setting_key)
DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = now();

COMMIT;
