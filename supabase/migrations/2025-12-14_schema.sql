-- Fresh CMS + Citizen Schema
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  phone text,
  role text NOT NULL CHECK (role IN ('citizen','admin','super_admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_website_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_type text NOT NULL,
  setting_key text NOT NULL,
  setting_value text,
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (setting_type, setting_key)
);

CREATE TABLE IF NOT EXISTS public.cms_elected_officials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  position text NOT NULL,
  ward int,
  photo_url text,
  term_start date,
  term_end date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_staff (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  designation text,
  contact text,
  photo_url text,
  joining_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_development_works (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name text NOT NULL,
  work_type text CHECK (work_type IN ('Road Construction', 'Water Supply', 'Drainage', 'Building', 'Electrification', 'Other')),
  budget numeric,
  status text CHECK (status IN ('Planned', 'In Progress', 'Completed', 'On Hold')),
  progress_percent int CHECK (progress_percent BETWEEN 0 AND 100),
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_schemes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_name text NOT NULL,
  scheme_type text CHECK (scheme_type IN ('Central Government', 'State Government', 'Local/Panchayat')),
  beneficiary_count int,
  status text CHECK (status IN ('Active', 'Upcoming', 'Closed')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_tenders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_no text NOT NULL,
  title text NOT NULL,
  value numeric,
  status text,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_flash_news (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  priority int DEFAULT 0,
  date date,
  status text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_downloads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_name text NOT NULL,
  category text,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_video_gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  video_source text CHECK (video_source IN ('YouTube','Upload')),
  video_url text NOT NULL,
  thumbnail_url text,
  publish_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  image_source text CHECK (image_source IN ('Upload', 'URL')),
  image_url text NOT NULL,
  category text,
  event_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Hero Carousel Slides (editable by admin)
CREATE TABLE IF NOT EXISTS public.cms_carousel (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slide_order int NOT NULL DEFAULT 1,
  title text NOT NULL,
  title_mr text,
  subtitle text,
  subtitle_mr text,
  image_url text NOT NULL,
  button_text text,
  button_text_mr text,
  button_link text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact Information (multiple contacts for office, emergency, etc.)
CREATE TABLE IF NOT EXISTS public.cms_contact_info (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  label_mr text,
  contact_type text CHECK (contact_type IN ('office', 'emergency', 'helpline', 'department')),
  contact_person text,
  contact_person_mr text,
  phone text,
  email text,
  address text,
  address_mr text,
  timings text,
  timings_mr text,
  order_index int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Village Information Sections
CREATE TABLE IF NOT EXISTS public.cms_village_info (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  info_type text CHECK (info_type IN ('history', 'geography', 'culture', 'economy', 'facilities', 'other')),
  title text NOT NULL,
  title_mr text,
  content text,
  content_mr text,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Committees
CREATE TABLE IF NOT EXISTS public.cms_committees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_mr text,
  description text,
  description_mr text,
  committee_type text CHECK (committee_type IN ('Standing', 'Special', 'Subject', 'Other')),
  formation_date date,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Budget Items
CREATE TABLE IF NOT EXISTS public.cms_budget_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_year text NOT NULL,
  category text CHECK (category IN ('Income', 'Expenditure', 'Development', 'Administrative', 'Other')),
  head_name text NOT NULL,
  head_name_mr text,
  budgeted_amount numeric DEFAULT 0,
  spent_amount numeric DEFAULT 0,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE DOMAIN mobile_10 AS text CHECK (VALUE ~ '^[0-9]{10}$');
CREATE DOMAIN gmail_email AS text CHECK (LOWER(VALUE) ~ '^[a-z0-9._%+-]+@gmail\.com$');

-- Updated Certificate Tables with Maharashtra Legal Requirements

CREATE TABLE IF NOT EXISTS public.cit_birth_certificate (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  application_number text UNIQUE,
  -- Child Details
  child_name_en text NOT NULL,
  child_name_mr text NOT NULL,
  date_of_birth date NOT NULL,
  place_of_birth text NOT NULL,
  gender text NOT NULL,
  -- Parents Details
  father_name_en text NOT NULL,
  father_name_mr text NOT NULL,
  mother_name_en text NOT NULL,
  mother_name_mr text NOT NULL,
  parent_aadhaar text,
  -- Contact
  applicant_name text NOT NULL,
  mobile text NOT NULL,
  -- Document Uploads
  proof_of_birth_url text,
  -- Status & Admin
  status text DEFAULT 'Submitted',
  admin_remark text,
  signed_document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cit_death_certificate (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  application_number text UNIQUE,
  -- Deceased Details
  deceased_name_en text NOT NULL,
  deceased_name_mr text NOT NULL,
  date_of_death date NOT NULL,
  place_of_death text NOT NULL,
  age_at_death integer NOT NULL,
  cause_of_death text NOT NULL,
  deceased_aadhaar text NOT NULL,
  -- Contact
  applicant_name text NOT NULL,
  mobile text NOT NULL,
  -- Document Uploads
  proof_of_death_url text,
  -- Status & Admin
  status text DEFAULT 'Submitted',
  admin_remark text,
  signed_document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cit_marriage_certificate (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  application_number text UNIQUE,
  -- Husband Details
  husband_name_en text NOT NULL,
  husband_name_mr text NOT NULL,
  husband_aadhaar text NOT NULL,
  -- Wife Details
  wife_name_before_en text NOT NULL,
  wife_name_before_mr text NOT NULL,
  wife_name_after_en text NOT NULL,
  wife_name_after_mr text NOT NULL,
  wife_aadhaar text NOT NULL,
  -- Marriage Details
  date_of_marriage date NOT NULL,
  place_of_marriage text NOT NULL,
  priest_name text,
  -- Contact
  applicant_name text NOT NULL,
  mobile text NOT NULL,
  -- Document Uploads
  joint_photo_url text,
  invitation_card_url text,
  aadhaar_cards_url text,
  -- Status & Admin
  status text DEFAULT 'Submitted',
  admin_remark text,
  signed_document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cit_destitute_certificate (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  application_number text UNIQUE,
  -- Beneficiary Details
  beneficiary_name_en text NOT NULL,
  beneficiary_name_mr text NOT NULL,
  date_of_birth date,
  age integer,
  aadhaar_number text NOT NULL,
  ration_card_number text,
  occupation text,
  annual_income numeric,
  -- Contact
  applicant_name text NOT NULL,
  mobile text NOT NULL,
  -- Document Uploads
  age_proof_url text,
  income_certificate_url text,
  disability_certificate_url text,
  -- Status & Admin
  status text DEFAULT 'Submitted',
  admin_remark text,
  signed_document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cit_bpl_certificate (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  application_number text UNIQUE,
  -- Family Head Details
  head_name_en text NOT NULL,
  head_name_mr text NOT NULL,
  bpl_list_number text NOT NULL,
  ration_card_number text NOT NULL,
  aadhaar_number text,
  -- Contact
  applicant_name text NOT NULL,
  mobile text NOT NULL,
  -- Document Uploads
  ration_card_url text,
  -- Status & Admin
  status text DEFAULT 'Submitted',
  admin_remark text,
  signed_document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cit_property_tax_extract (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  application_number text UNIQUE,
  -- Property Details
  property_number text NOT NULL,
  owner_name_en text NOT NULL,
  owner_name_mr text NOT NULL,
  ward_number text,
  -- Contact
  applicant_name text NOT NULL,
  mobile text NOT NULL,
  -- Document Uploads
  identity_proof_url text,
  -- Status & Admin
  status text DEFAULT 'Submitted',
  admin_remark text,
  signed_document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Remove old no_dues table as it's now merged with property_tax_extract
DROP TABLE IF EXISTS public.cit_no_dues_certificate CASCADE;

CREATE TABLE IF NOT EXISTS public.cit_complaints (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  subject text NOT NULL,
  description text,
  attachment_url text,
  status text DEFAULT 'Submitted',
  assigned_admin_id uuid REFERENCES public.profiles(id),
  resolution_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cit_service_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  request_type text NOT NULL,
  details text,
  attachment_url text,
  status text DEFAULT 'Submitted',
  assigned_admin_id uuid REFERENCES public.profiles(id),
  resolution_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid REFERENCES public.profiles(id),
  actor_role text,
  action_type text,
  target_table text,
  target_id uuid,
  diff_json jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  setting_key text PRIMARY KEY,
  setting_value text,
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz DEFAULT now()
);

-- ===========================================
-- VIEWS: Admin views for pending items
-- ===========================================

-- View for all pending certificate applications with updated field structure
CREATE OR REPLACE VIEW public.admin_pending_certificates AS
SELECT 
  c.id,
  c.application_number,
  'BIRTH' as certificate_type,
  jsonb_build_object(
    'child_name_en', c.child_name_en,
    'child_name_mr', c.child_name_mr,
    'date_of_birth', c.date_of_birth,
    'place_of_birth', c.place_of_birth,
    'gender', c.gender,
    'father_name_en', c.father_name_en,
    'father_name_mr', c.father_name_mr,
    'mother_name_en', c.mother_name_en,
    'mother_name_mr', c.mother_name_mr,
    'parent_aadhaar', c.parent_aadhaar,
    'proof_of_birth_url', c.proof_of_birth_url
  ) as form_data,
  c.created_at,
  c.applicant_name as full_name,
  c.mobile
FROM public.cit_birth_certificate c
WHERE c.status = 'Submitted'

UNION ALL

SELECT 
  c.id,
  c.application_number,
  'DEATH' as certificate_type,
  jsonb_build_object(
    'deceased_name_en', c.deceased_name_en,
    'deceased_name_mr', c.deceased_name_mr,
    'date_of_death', c.date_of_death,
    'place_of_death', c.place_of_death,
    'age_at_death', c.age_at_death,
    'cause_of_death', c.cause_of_death,
    'deceased_aadhaar', c.deceased_aadhaar,
    'proof_of_death_url', c.proof_of_death_url
  ) as form_data,
  c.created_at,
  c.applicant_name as full_name,
  c.mobile
FROM public.cit_death_certificate c
WHERE c.status = 'Submitted'

UNION ALL

SELECT 
  c.id,
  c.application_number,
  'MARRIAGE' as certificate_type,
  jsonb_build_object(
    'husband_name_en', c.husband_name_en,
    'husband_name_mr', c.husband_name_mr,
    'husband_aadhaar', c.husband_aadhaar,
    'wife_name_before_en', c.wife_name_before_en,
    'wife_name_before_mr', c.wife_name_before_mr,
    'wife_name_after_en', c.wife_name_after_en,
    'wife_name_after_mr', c.wife_name_after_mr,
    'wife_aadhaar', c.wife_aadhaar,
    'date_of_marriage', c.date_of_marriage,
    'place_of_marriage', c.place_of_marriage,
    'priest_name', c.priest_name,
    'joint_photo_url', c.joint_photo_url,
    'invitation_card_url', c.invitation_card_url,
    'aadhaar_cards_url', c.aadhaar_cards_url
  ) as form_data,
  c.created_at,
  c.applicant_name as full_name,
  c.mobile
FROM public.cit_marriage_certificate c
WHERE c.status = 'Submitted'

UNION ALL

SELECT 
  c.id,
  c.application_number,
  'BPL' as certificate_type,
  jsonb_build_object(
    'head_name_en', c.head_name_en,
    'head_name_mr', c.head_name_mr,
    'bpl_list_number', c.bpl_list_number,
    'ration_card_number', c.ration_card_number,
    'aadhaar_number', c.aadhaar_number,
    'ration_card_url', c.ration_card_url
  ) as form_data,
  c.created_at,
  c.applicant_name as full_name,
  c.mobile
FROM public.cit_bpl_certificate c
WHERE c.status = 'Submitted'

UNION ALL

SELECT 
  c.id,
  c.application_number,
  'PROPERTY_TAX' as certificate_type,
  jsonb_build_object(
    'property_number', c.property_number,
    'owner_name_en', c.owner_name_en,
    'owner_name_mr', c.owner_name_mr,
    'ward_number', c.ward_number,
    'identity_proof_url', c.identity_proof_url
  ) as form_data,
  c.created_at,
  c.applicant_name as full_name,
  c.mobile
FROM public.cit_property_tax_extract c
WHERE c.status = 'Submitted'

UNION ALL

SELECT 
  c.id,
  c.application_number,
  'DESTITUTE' as certificate_type,
  jsonb_build_object(
    'beneficiary_name_en', c.beneficiary_name_en,
    'beneficiary_name_mr', c.beneficiary_name_mr,
    'date_of_birth', c.date_of_birth,
    'age', c.age,
    'aadhaar_number', c.aadhaar_number,
    'ration_card_number', c.ration_card_number,
    'occupation', c.occupation,
    'annual_income', c.annual_income,
    'age_proof_url', c.age_proof_url,
    'income_certificate_url', c.income_certificate_url,
    'disability_certificate_url', c.disability_certificate_url
  ) as form_data,
  c.created_at,
  c.applicant_name as full_name,
  c.mobile
FROM public.cit_destitute_certificate c
WHERE c.status = 'Submitted';

-- View for open complaints
CREATE OR REPLACE VIEW public.admin_open_complaints AS
SELECT 
  c.id,
  c.id::text as complaint_number,
  'General' as category,
  c.subject as title,
  c.description,
  c.attachment_url as photo_evidence_url,
  NULL as location,
  'Normal' as priority,
  c.created_at,
  p.full_name,
  p.phone as mobile
FROM public.cit_complaints c
LEFT JOIN public.profiles p ON c.user_id = p.id
WHERE c.status = 'Submitted';

-- ===========================================
-- TRIGGER: Auto-create profile on user signup
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'citizen'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
