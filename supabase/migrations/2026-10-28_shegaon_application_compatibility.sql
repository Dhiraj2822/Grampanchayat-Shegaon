-- Fresh-install compatibility schema for relations used by the current frontend.
-- Run after 2026-10-21_rls_hardening.sql and before 2026-10-28_set_shegaon_defaults.sql.
BEGIN;

CREATE TABLE IF NOT EXISTS public.cit_no_dues_certificate (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  application_number text UNIQUE,
  property_number text NOT NULL,
  owner_name_en text NOT NULL,
  owner_name_mr text NOT NULL,
  applicant_name text NOT NULL,
  mobile text NOT NULL,
  status text DEFAULT 'Submitted',
  admin_remark text,
  signed_document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rti_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  application_number text UNIQUE NOT NULL,
  applicant_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  subject text NOT NULL,
  information_sought text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_tax (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id text NOT NULL UNIQUE,
  owner_name text NOT NULL,
  owner_name_mr text,
  ward_number integer,
  property_address text,
  property_type text,
  annual_tax_amount numeric NOT NULL DEFAULT 0,
  arrears numeric NOT NULL DEFAULT 0,
  total_due numeric NOT NULL DEFAULT 0,
  last_paid_date date,
  mobile text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.water_tax (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id text NOT NULL UNIQUE,
  consumer_name text NOT NULL,
  annual_charges numeric NOT NULL DEFAULT 0,
  arrears numeric NOT NULL DEFAULT 0,
  total_due numeric NOT NULL DEFAULT 0,
  last_paid_date date,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.cit_no_dues_certificate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rti_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_tax ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_tax ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cit_no_dues_select_self ON public.cit_no_dues_certificate;
CREATE POLICY cit_no_dues_select_self ON public.cit_no_dues_certificate
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_admin());
DROP POLICY IF EXISTS cit_no_dues_insert_self ON public.cit_no_dues_certificate;
CREATE POLICY cit_no_dues_insert_self ON public.cit_no_dues_certificate
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS cit_no_dues_update ON public.cit_no_dues_certificate;
CREATE POLICY cit_no_dues_update ON public.cit_no_dues_certificate
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR private.is_admin())
  WITH CHECK (user_id = auth.uid() OR private.is_admin());
DROP POLICY IF EXISTS cit_no_dues_delete_admin ON public.cit_no_dues_certificate;
CREATE POLICY cit_no_dues_delete_admin ON public.cit_no_dues_certificate
  FOR DELETE TO authenticated
  USING (private.is_admin());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cit_no_dues_certificate TO authenticated;

DROP POLICY IF EXISTS rti_public_insert ON public.rti_applications;
CREATE POLICY rti_public_insert ON public.rti_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
DROP POLICY IF EXISTS rti_admin_select ON public.rti_applications;
CREATE POLICY rti_admin_select ON public.rti_applications
  FOR SELECT TO authenticated
  USING (private.is_admin());
DROP POLICY IF EXISTS rti_admin_update ON public.rti_applications;
CREATE POLICY rti_admin_update ON public.rti_applications
  FOR UPDATE TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());
GRANT INSERT ON public.rti_applications TO anon, authenticated;
GRANT SELECT, UPDATE ON public.rti_applications TO authenticated;

-- Tax lookup is intentionally public because TaxCheckPage has an anonymous lookup
-- flow. Do not store Aadhaar, bank, or other sensitive identity data in these tables.
DROP POLICY IF EXISTS property_tax_public_select ON public.property_tax;
CREATE POLICY property_tax_public_select ON public.property_tax
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS property_tax_admin_write ON public.property_tax;
CREATE POLICY property_tax_admin_write ON public.property_tax
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());
GRANT SELECT ON public.property_tax TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_tax TO authenticated;

DROP POLICY IF EXISTS water_tax_public_select ON public.water_tax;
CREATE POLICY water_tax_public_select ON public.water_tax
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS water_tax_admin_write ON public.water_tax;
CREATE POLICY water_tax_admin_write ON public.water_tax
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());
GRANT SELECT ON public.water_tax TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.water_tax TO authenticated;

-- These views are read by the super-admin statistics screen. The source citizen
-- tables retain the authoritative RLS rules.
CREATE OR REPLACE VIEW public.service_requests
WITH (security_invoker = true)
AS
SELECT id, user_id, status, created_at
FROM public.cit_service_requests;

CREATE OR REPLACE VIEW public.complaints
WITH (security_invoker = true)
AS
SELECT id, user_id, status, created_at
FROM public.cit_complaints;

GRANT SELECT ON public.service_requests, public.complaints TO authenticated;

-- Recreate storage policies with the hardened, non-recursive role helper.
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'uploads'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR private.is_admin()
    )
  );

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'uploads'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR private.is_admin()
    )
  );

DROP POLICY IF EXISTS "Admins can view all citizen uploads" ON storage.objects;
CREATE POLICY "Admins can view all citizen uploads" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'citizen_uploads' AND private.is_admin());

COMMIT;
