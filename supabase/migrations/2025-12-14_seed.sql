-- Seed data for initial setup
BEGIN;

-- ===========================================
-- ADMIN USERS (Create these in Supabase Auth first!)
-- ===========================================
-- IMPORTANT: These UUIDs must match the UUIDs generated when you create 
-- users in Supabase Authentication Dashboard:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" for each admin
-- 3. Copy the UUID and update the values below

-- Super Admin (full access to everything)
INSERT INTO public.profiles (id, email, full_name, phone, role)
VALUES 
  ('97951af7-c423-4a5a-8096-cc148684c917', 'superadmin@gmail.com', 'Super Admin', '9999999999', 'super_admin')
ON CONFLICT (id) DO UPDATE SET role='super_admin', full_name=EXCLUDED.full_name;

-- Admin Users (can manage CMS content and citizen requests)
-- Replace these UUIDs with actual UUIDs from Supabase Auth after creating users
INSERT INTO public.profiles (id, email, full_name, phone, role)
VALUES 
  ('335cd6ce-1e73-40f8-b80f-b17cd4ab2a17', 'admin1@gmail.com', 'Admin One', '9888888881', 'admin'),
  ('3123c9c4-e049-4d4a-a763-b74429021f42', 'admin2@gmail.com', 'Admin Two', '9888888882', 'admin')
ON CONFLICT (id) DO UPDATE SET role='admin', full_name=EXCLUDED.full_name;

-- ===========================================
-- CMS WEBSITE SETTINGS (All keys used in ContentManagement.tsx)
-- ===========================================
INSERT INTO public.cms_website_settings (setting_type, setting_key, setting_value)
VALUES
  -- Basic Info (English)
  ('BASIC_INFO', 'village_name', 'Hallali(A)'),
  ('BASIC_INFO', 'taluka', 'Sample Taluka'),
  ('BASIC_INFO', 'district', 'Maharashtra'),
  ('BASIC_INFO', 'state', 'Maharashtra'),
  ('BASIC_INFO', 'pincode', '00005'),
  ('BASIC_INFO', 'population', '5000'),
  ('BASIC_INFO', 'area_sqkm', '10.5'),
  -- Basic Info (Marathi)
  ('BASIC_INFO', 'village_name_mr', 'हल्लाळी (A)'),
  ('BASIC_INFO', 'taluka_mr', 'नमुना तालुका'),
  ('BASIC_INFO', 'district_mr', 'महाराष्ट्र'),
  ('BASIC_INFO', 'state_mr', 'महाराष्ट्र'),
  -- Location (for Google Maps)
  ('LOCATION', 'latitude', ''),
  ('LOCATION', 'longitude', ''),
  -- Contact (English)
  ('CONTACT', 'helpline', '0000000000'),
  ('CONTACT', 'email', 'grampanchayat@example.com'),
  ('CONTACT', 'address', 'Gram Panchayat Office, Hallali(A)'),
  ('CONTACT', 'office_address', 'Gram Panchayat Office, Main Road, Hallali(A)'),
  ('CONTACT', 'phone_number', '0000000000'),
  ('CONTACT', 'office_hours', 'Mon-Sat: 10:00 AM - 5:00 PM'),
  -- Contact (Marathi)
  ('CONTACT', 'office_address_mr', 'ग्रामपंचायत कार्यालय, मुख्य रस्ता, हल्लाळी (A)'),
  ('CONTACT', 'office_hours_mr', 'सोम-शनि: सकाळी १०:०० ते संध्या ५:००'),
  -- Social Media
  ('SOCIAL', 'facebook', ''),
  ('SOCIAL', 'twitter', ''),
  ('SOCIAL_MEDIA', 'facebook_url', ''),
  ('SOCIAL_MEDIA', 'twitter_url', ''),
  ('SOCIAL_MEDIA', 'youtube_url', ''),
  ('SOCIAL_MEDIA', 'instagram_url', ''),
  -- Appearance (English)
  ('APPEARANCE', 'hero_title', 'Welcome to Digital Hallali(A)'),
  ('APPEARANCE', 'hero_subtitle', 'Your Gateway to Village Services'),
  ('APPEARANCE', 'primary_color', '#16a34a'),
  -- Appearance (Marathi)
  ('APPEARANCE', 'hero_title_mr', 'डिजिटल हल्लाळी (A) मध्ये आपले स्वागत'),
  ('APPEARANCE', 'hero_subtitle_mr', 'गाव सेवांचे प्रवेशद्वार'),
  -- About Us (English)
  ('ABOUT_US', 'about_history', ''),
  ('ABOUT_US', 'about_geography', ''),
  ('ABOUT_US', 'about_culture', ''),
  ('ABOUT_US', 'about_economy', ''),
  ('ABOUT_US', 'sarpanch_name', ''),
  ('ABOUT_US', 'sarpanch_message', ''),
  ('ABOUT_US', 'sarpanch_photo_url', ''),
  -- About Us (Marathi)
  ('ABOUT_US', 'about_history_mr', ''),
  ('ABOUT_US', 'about_geography_mr', ''),
  ('ABOUT_US', 'about_culture_mr', ''),
  ('ABOUT_US', 'about_economy_mr', ''),
  ('ABOUT_US', 'sarpanch_name_mr', ''),
  ('ABOUT_US', 'sarpanch_message_mr', '')
ON CONFLICT (setting_type, setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value;

-- ===========================================
-- SAMPLE CMS DATA
-- ===========================================

-- Flash News
INSERT INTO public.cms_flash_news (title, priority, is_active) VALUES
  ('Welcome to Digital Gram Panchayat Portal', 10, true),
  ('Online certificate services now available', 8, true),
  ('Gram Sabha meeting scheduled for next month', 5, true)
ON CONFLICT DO NOTHING;

-- Sample Elected Officials
INSERT INTO public.cms_elected_officials (name, position, ward, is_active) VALUES
  ('Sarpanch Name', 'Sarpanch', NULL, true),
  ('Deputy Sarpanch Name', 'Deputy Sarpanch', NULL, true),
  ('Ward Member 1', 'Ward Member', 1, true),
  ('Ward Member 2', 'Ward Member', 2, true)
ON CONFLICT DO NOTHING;

-- Sample Staff
INSERT INTO public.cms_staff (name, designation, contact, is_active) VALUES
  ('Gram Sevak Name', 'Gram Sevak', '9876543210', true),
  ('Clerk Name', 'Clerk', '9876543211', true)
ON CONFLICT DO NOTHING;

-- Sample Downloads/Forms
INSERT INTO public.cms_downloads (document_name, category, file_url) VALUES
  ('Birth Certificate Application Form', 'Certificates', '/forms/birth-certificate.pdf'),
  ('Death Certificate Application Form', 'Certificates', '/forms/death-certificate.pdf'),
  ('Property Tax Payment Form', 'Tax', '/forms/property-tax.pdf'),
  ('Grievance Application Form', 'General', '/forms/grievance.pdf')
ON CONFLICT DO NOTHING;

-- Sample Hero Carousel Slides
INSERT INTO public.cms_carousel (slide_order, title, title_mr, subtitle, subtitle_mr, image_url, button_text, button_text_mr, button_link, is_active) VALUES
  (1, 'Welcome to Digital Village', 'डिजिटल गावात आपले स्वागत', 'Experience transparent governance and digital services', 'पारदर्शक शासन आणि डिजिटल सेवांचा अनुभव घ्या', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'Learn More', 'अधिक जाणून घ्या', '/about', true),
  (2, 'Online Services Available', 'ऑनलाइन सेवा उपलब्ध', 'Apply for certificates and services from home', 'घरबसल्या प्रमाणपत्रे आणि सेवांसाठी अर्ज करा', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'Apply Now', 'आता अर्ज करा', '/certificates', true),
  (3, 'Development Projects', 'विकास प्रकल्प', 'Track ongoing development works in real-time', 'सुरू असलेल्या विकास कामांचा वास्तविक वेळेत मागोवा घ्या', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'View Projects', 'प्रकल्प पहा', '/development-works', true)
ON CONFLICT DO NOTHING;

-- Sample Contact Info
INSERT INTO public.cms_contact_info (label, label_mr, contact_type, contact_person, contact_person_mr, phone, email, address, address_mr, timings, timings_mr, order_index, is_active) VALUES
  ('Gram Panchayat Office', 'ग्रामपंचायत कार्यालय', 'office', 'Gram Sevak', 'ग्राम सेवक', '9876543210', 'grampanchayat@example.com', 'Village Center, Main Road', 'गाव केंद्र, मुख्य रस्ता', 'Mon-Sat: 10AM - 5PM', 'सोम-शनि: सकाळी 10 - सायंकाळी 5', 1, true),
  ('Emergency Contact', 'आपत्कालीन संपर्क', 'emergency', 'Control Room', 'नियंत्रण कक्ष', '100', '', 'Police Station', 'पोलीस स्टेशन', '24/7', '24/7', 2, true),
  ('Helpline', 'हेल्पलाइन', 'helpline', 'Government Helpline', 'सरकारी हेल्पलाइन', '1800-XXX-XXXX', '', '', '', '24/7', '24/7', 3, true)
ON CONFLICT DO NOTHING;

-- Sample Committees
INSERT INTO public.cms_committees (name, name_mr, description, committee_type, formation_date, display_order, is_active) VALUES
  ('Finance Committee', 'वित्त समिती', 'Handles budget and financial matters', 'Standing', '2024-01-01', 1, true),
  ('Development Committee', 'विकास समिती', 'Oversees development projects', 'Standing', '2024-01-01', 2, true),
  ('Education Committee', 'शिक्षण समिती', 'Manages education-related activities', 'Subject', '2024-01-01', 3, true)
ON CONFLICT DO NOTHING;

-- Sample Budget Items
INSERT INTO public.cms_budget_items (financial_year, category, head_name, head_name_mr, budgeted_amount, spent_amount, display_order, is_active) VALUES
  ('2024-25', 'Income', 'Property Tax', 'मालमत्ता कर', 500000, 350000, 1, true),
  ('2024-25', 'Income', 'Government Grants', 'शासकीय अनुदान', 1000000, 800000, 2, true),
  ('2024-25', 'Expenditure', 'Road Maintenance', 'रस्ते देखभाल', 300000, 150000, 3, true),
  ('2024-25', 'Development', 'Water Supply Project', 'पाणी पुरवठा प्रकल्प', 500000, 200000, 4, true)
ON CONFLICT DO NOTHING;

COMMIT;
