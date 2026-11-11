-- Update the public Panchayat name for existing installations.
UPDATE public.cms_website_settings
SET setting_value = 'Hallali(A)'
WHERE setting_type = 'BASIC_INFO'
  AND setting_key = 'village_name';

UPDATE public.cms_website_settings
SET setting_value = 'हल्लाळी (A)'
WHERE setting_type = 'BASIC_INFO'
  AND setting_key = 'village_name_mr';

UPDATE public.cms_website_settings
SET setting_value = 'Gram Panchayat Office, Hallali(A)'
WHERE setting_type = 'CONTACT'
  AND setting_key = 'address';

UPDATE public.cms_website_settings
SET setting_value = 'Gram Panchayat Office, Main Road, Hallali(A)'
WHERE setting_type = 'CONTACT'
  AND setting_key = 'office_address';

UPDATE public.cms_website_settings
SET setting_value = 'ग्रामपंचायत कार्यालय, मुख्य रस्ता, हल्लाळी (A)'
WHERE setting_type = 'CONTACT'
  AND setting_key = 'office_address_mr';

UPDATE public.cms_website_settings
SET setting_value = 'Welcome to Digital Hallali(A)'
WHERE setting_type = 'APPEARANCE'
  AND setting_key = 'hero_title';

UPDATE public.cms_website_settings
SET setting_value = 'डिजिटल हल्लाळी (A) मध्ये आपले स्वागत'
WHERE setting_type = 'APPEARANCE'
  AND setting_key = 'hero_title_mr';
