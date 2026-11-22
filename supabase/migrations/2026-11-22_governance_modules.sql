BEGIN;

CREATE TABLE IF NOT EXISTS public.cms_feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  subject text NOT NULL,
  message text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'new',
  admin_response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_infrastructure_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_mr text,
  title_hi text,
  category text NOT NULL,
  description text,
  description_mr text,
  description_hi text,
  ward text,
  address text,
  latitude numeric,
  longitude numeric,
  status text NOT NULL DEFAULT 'active',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_education_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_mr text,
  title_hi text,
  category text,
  description text,
  description_mr text,
  description_hi text,
  start_date date,
  end_date date,
  document_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_employment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_mr text,
  title_hi text,
  category text,
  organization text,
  location text,
  description text,
  description_mr text,
  description_hi text,
  application_url text,
  deadline date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_environment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_mr text,
  title_hi text,
  category text,
  description text,
  description_mr text,
  description_hi text,
  metric_value numeric,
  metric_unit text,
  record_date date,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_official_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_mr text,
  name_hi text,
  designation text NOT NULL,
  designation_mr text,
  designation_hi text,
  department text,
  photo_url text,
  phone text,
  email text,
  office_address text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_ward_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_number text NOT NULL,
  population integer,
  households integer,
  literacy_percent numeric,
  water_coverage_percent numeric,
  electricity_coverage_percent numeric,
  sanitation_percent numeric,
  record_year text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_mr text,
  title_hi text,
  description text,
  description_mr text,
  description_hi text,
  event_type text,
  location text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  document_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_mr text,
  name_hi text,
  organization text,
  phone text NOT NULL,
  alternate_phone text,
  address text,
  hours text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_impact_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key text NOT NULL UNIQUE,
  metric_label text NOT NULL,
  metric_label_mr text,
  metric_label_hi text,
  metric_value numeric,
  metric_unit text,
  record_year text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_sankalp_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pledge_number integer NOT NULL CHECK (pledge_number BETWEEN 1 AND 10),
  title text NOT NULL,
  title_mr text,
  title_hi text,
  description text,
  target_value numeric,
  achieved_value numeric,
  metric_unit text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_mr text,
  name_hi text,
  partner_type text,
  description text,
  contact_name text,
  phone text,
  email text,
  website_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_beneficiary_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_mr text,
  title_hi text,
  beneficiary_name text,
  story text,
  story_mr text,
  story_hi text,
  scheme_name text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_public_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_type text NOT NULL,
  reference_number text NOT NULL,
  status text NOT NULL DEFAULT 'Submitted',
  applicant_name text,
  subject text,
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reference_type, reference_number)
);

CREATE TABLE IF NOT EXISTS public.cms_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_mr text,
  title_hi text,
  description text,
  description_mr text,
  description_hi text,
  event_type text,
  location text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  document_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_mr text,
  name_hi text,
  organization text,
  phone text NOT NULL,
  alternate_phone text,
  address text,
  hours text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_infrastructure_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_education_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_employment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_environment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_official_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_ward_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sankalp_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_beneficiary_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_public_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cms_feedback_public_insert ON public.cms_feedback_submissions;
CREATE POLICY cms_feedback_public_insert ON public.cms_feedback_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS cms_feedback_admin_select ON public.cms_feedback_submissions;
CREATE POLICY cms_feedback_admin_select ON public.cms_feedback_submissions
  FOR SELECT TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS cms_feedback_admin_update ON public.cms_feedback_submissions;
CREATE POLICY cms_feedback_admin_update ON public.cms_feedback_submissions
  FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cms_infrastructure_records'
      AND policyname = 'cms_infrastructure_public_read'
  ) THEN
    EXECUTE 'CREATE POLICY cms_infrastructure_public_read ON public.cms_infrastructure_records FOR SELECT TO anon, authenticated USING (is_active = true)';
  END IF;
END $$;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'cms_education_records',
    'cms_employment_records',
    'cms_environment_records',
    'cms_official_hierarchy',
    'cms_ward_statistics',
    'cms_events',
    'cms_emergency_contacts',
    'cms_impact_metrics',
    'cms_sankalp_pledges',
    'cms_partnerships',
    'cms_beneficiary_stories'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      tbl || '_public_read',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (is_active = true)',
      tbl || '_public_read',
      tbl
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      tbl || '_admin_manage',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin())',
      tbl || '_admin_manage',
      tbl
    );
  END LOOP;
END $$;

DROP POLICY IF EXISTS cms_infrastructure_admin_manage ON public.cms_infrastructure_records;
CREATE POLICY cms_infrastructure_admin_manage ON public.cms_infrastructure_records
  FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

GRANT INSERT ON public.cms_feedback_submissions TO anon, authenticated;
GRANT SELECT, UPDATE ON public.cms_feedback_submissions TO authenticated;
GRANT SELECT ON public.cms_infrastructure_records TO anon, authenticated;
GRANT SELECT ON public.cms_education_records TO anon, authenticated;
GRANT SELECT ON public.cms_employment_records TO anon, authenticated;
GRANT SELECT ON public.cms_environment_records TO anon, authenticated;
GRANT SELECT ON public.cms_official_hierarchy TO anon, authenticated;
GRANT SELECT ON public.cms_ward_statistics TO anon, authenticated;
GRANT ALL ON public.cms_infrastructure_records TO authenticated;
GRANT ALL ON public.cms_education_records TO authenticated;
GRANT ALL ON public.cms_employment_records TO authenticated;
GRANT ALL ON public.cms_environment_records TO authenticated;
GRANT ALL ON public.cms_official_hierarchy TO authenticated;
GRANT ALL ON public.cms_ward_statistics TO authenticated;
GRANT ALL ON public.cms_events TO authenticated;
GRANT ALL ON public.cms_emergency_contacts TO authenticated;
GRANT ALL ON public.cms_impact_metrics TO authenticated;
GRANT ALL ON public.cms_sankalp_pledges TO authenticated;
GRANT ALL ON public.cms_partnerships TO authenticated;
GRANT ALL ON public.cms_beneficiary_stories TO authenticated;
GRANT SELECT ON public.cms_events TO anon, authenticated;
GRANT SELECT ON public.cms_emergency_contacts TO anon, authenticated;
GRANT SELECT ON public.cms_impact_metrics TO anon, authenticated;
GRANT SELECT ON public.cms_sankalp_pledges TO anon, authenticated;
GRANT SELECT ON public.cms_partnerships TO anon, authenticated;
GRANT SELECT ON public.cms_beneficiary_stories TO anon, authenticated;

DROP POLICY IF EXISTS cms_public_tracking_admin_manage ON public.cms_public_tracking;
CREATE POLICY cms_public_tracking_admin_manage ON public.cms_public_tracking
  FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS cms_public_tracking_public_insert ON public.cms_public_tracking;
CREATE POLICY cms_public_tracking_public_insert ON public.cms_public_tracking
  FOR INSERT TO anon, authenticated WITH CHECK (true);

GRANT INSERT ON public.cms_public_tracking TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.lookup_public_tracking(
  p_reference_type text,
  p_reference_number text
)
RETURNS TABLE (
  reference_type text,
  reference_number text,
  status text,
  subject text,
  resolution_note text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.reference_type, t.reference_number, t.status, t.subject,
         t.resolution_note, t.created_at, t.updated_at
  FROM public.cms_public_tracking t
  WHERE t.reference_type = lower(p_reference_type)
    AND t.reference_number = upper(trim(p_reference_number))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_public_tracking(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_public_tracking(text, text) TO anon, authenticated;

COMMIT;
