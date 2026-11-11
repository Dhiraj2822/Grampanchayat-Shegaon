-- Migration to update certificate tables for Maharashtra legal compliance
-- Run this AFTER the existing schema to update table structures safely

BEGIN;

-- FIRST: Drop the view that depends on old columns
DROP VIEW IF EXISTS public.admin_pending_certificates CASCADE;

-- 1. ALTER BIRTH CERTIFICATE TABLE
ALTER TABLE public.cit_birth_certificate 
DROP COLUMN IF EXISTS child_full_name CASCADE,
DROP COLUMN IF EXISTS dob CASCADE,
DROP COLUMN IF EXISTS father_name_marathi CASCADE,
DROP COLUMN IF EXISTS mother_name_marathi CASCADE,
DROP COLUMN IF EXISTS gender CASCADE;

ALTER TABLE public.cit_birth_certificate 
ADD COLUMN IF NOT EXISTS application_number text UNIQUE,
ADD COLUMN IF NOT EXISTS child_name_en text,
ADD COLUMN IF NOT EXISTS child_name_mr text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS place_of_birth text,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS father_name_en text,
ADD COLUMN IF NOT EXISTS father_name_mr text,
ADD COLUMN IF NOT EXISTS mother_name_en text,
ADD COLUMN IF NOT EXISTS mother_name_mr text,
ADD COLUMN IF NOT EXISTS parent_aadhaar text,
ADD COLUMN IF NOT EXISTS proof_of_birth_url text,
ADD COLUMN IF NOT EXISTS admin_remark text,
ADD COLUMN IF NOT EXISTS signed_document_url text;

-- 2. ALTER DEATH CERTIFICATE TABLE
ALTER TABLE public.cit_death_certificate 
DROP COLUMN IF EXISTS deceased_full_name CASCADE,
DROP COLUMN IF EXISTS date_of_death CASCADE,
DROP COLUMN IF EXISTS gender CASCADE;

ALTER TABLE public.cit_death_certificate 
ADD COLUMN IF NOT EXISTS application_number text UNIQUE,
ADD COLUMN IF NOT EXISTS deceased_name_en text,
ADD COLUMN IF NOT EXISTS deceased_name_mr text,
ADD COLUMN IF NOT EXISTS date_of_death date,
ADD COLUMN IF NOT EXISTS place_of_death text,
ADD COLUMN IF NOT EXISTS age_at_death integer,
ADD COLUMN IF NOT EXISTS cause_of_death text,
ADD COLUMN IF NOT EXISTS deceased_aadhaar text,
ADD COLUMN IF NOT EXISTS proof_of_death_url text,
ADD COLUMN IF NOT EXISTS admin_remark text,
ADD COLUMN IF NOT EXISTS signed_document_url text;

-- 3. ALTER MARRIAGE CERTIFICATE TABLE
ALTER TABLE public.cit_marriage_certificate 
DROP COLUMN IF EXISTS husband_name_marathi CASCADE,
DROP COLUMN IF EXISTS wife_name_marathi CASCADE,
DROP COLUMN IF EXISTS marriage_date CASCADE,
DROP COLUMN IF EXISTS marriage_place CASCADE;

ALTER TABLE public.cit_marriage_certificate 
ADD COLUMN IF NOT EXISTS application_number text UNIQUE,
ADD COLUMN IF NOT EXISTS husband_name_en text,
ADD COLUMN IF NOT EXISTS husband_name_mr text,
ADD COLUMN IF NOT EXISTS husband_aadhaar text,
ADD COLUMN IF NOT EXISTS wife_name_before_en text,
ADD COLUMN IF NOT EXISTS wife_name_before_mr text,
ADD COLUMN IF NOT EXISTS wife_name_after_en text,
ADD COLUMN IF NOT EXISTS wife_name_after_mr text,
ADD COLUMN IF NOT EXISTS wife_aadhaar text,
ADD COLUMN IF NOT EXISTS date_of_marriage date,
ADD COLUMN IF NOT EXISTS place_of_marriage text,
ADD COLUMN IF NOT EXISTS priest_name text,
ADD COLUMN IF NOT EXISTS joint_photo_url text,
ADD COLUMN IF NOT EXISTS invitation_card_url text,
ADD COLUMN IF NOT EXISTS aadhaar_cards_url text,
ADD COLUMN IF NOT EXISTS admin_remark text,
ADD COLUMN IF NOT EXISTS signed_document_url text;

-- 4. ALTER BPL CERTIFICATE TABLE
ALTER TABLE public.cit_bpl_certificate 
DROP COLUMN IF EXISTS certificate_name_marathi CASCADE,
DROP COLUMN IF EXISTS certificate_name_english CASCADE,
DROP COLUMN IF EXISTS relation_with_head CASCADE;

ALTER TABLE public.cit_bpl_certificate 
ADD COLUMN IF NOT EXISTS application_number text UNIQUE,
ADD COLUMN IF NOT EXISTS head_name_en text,
ADD COLUMN IF NOT EXISTS head_name_mr text,
ADD COLUMN IF NOT EXISTS bpl_list_number text,
ADD COLUMN IF NOT EXISTS ration_card_number text,
ADD COLUMN IF NOT EXISTS aadhaar_number text,
ADD COLUMN IF NOT EXISTS ration_card_url text,
ADD COLUMN IF NOT EXISTS admin_remark text,
ADD COLUMN IF NOT EXISTS signed_document_url text;

-- 5. ALTER PROPERTY TAX EXTRACT TABLE  
ALTER TABLE public.cit_property_tax_extract 
DROP COLUMN IF EXISTS property_number CASCADE;

ALTER TABLE public.cit_property_tax_extract 
ADD COLUMN IF NOT EXISTS application_number text UNIQUE,
ADD COLUMN IF NOT EXISTS property_number text,
ADD COLUMN IF NOT EXISTS owner_name_en text,
ADD COLUMN IF NOT EXISTS owner_name_mr text,
ADD COLUMN IF NOT EXISTS ward_number text,
ADD COLUMN IF NOT EXISTS identity_proof_url text,
ADD COLUMN IF NOT EXISTS admin_remark text,
ADD COLUMN IF NOT EXISTS signed_document_url text;

-- 6. ALTER DESTITUTE CERTIFICATE TABLE
ALTER TABLE public.cit_destitute_certificate 
DROP COLUMN IF EXISTS destitute_name_marathi CASCADE,
DROP COLUMN IF EXISTS destitute_name_english CASCADE,
DROP COLUMN IF EXISTS dob CASCADE,
DROP COLUMN IF EXISTS aadhar_number CASCADE;

ALTER TABLE public.cit_destitute_certificate 
ADD COLUMN IF NOT EXISTS application_number text UNIQUE,
ADD COLUMN IF NOT EXISTS beneficiary_name_en text,
ADD COLUMN IF NOT EXISTS beneficiary_name_mr text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS aadhaar_number text,
ADD COLUMN IF NOT EXISTS ration_card_number text,
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS annual_income numeric,
ADD COLUMN IF NOT EXISTS income_certificate_url text,
ADD COLUMN IF NOT EXISTS disability_certificate_url text,
ADD COLUMN IF NOT EXISTS admin_remark text,
ADD COLUMN IF NOT EXISTS signed_document_url text;

-- 7. DROP OLD NO DUES TABLE (if exists)
DROP TABLE IF EXISTS public.cit_no_dues_certificate CASCADE;

-- 8. RECREATE admin_pending_certificates VIEW with new structure

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

COMMIT;