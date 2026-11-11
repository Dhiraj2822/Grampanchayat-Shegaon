-- CMS tables required by the public pages that are not part of the original schema.
BEGIN;

CREATE TABLE IF NOT EXISTS public.cms_budget_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  year text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('budget', 'audit', 'annual_report')),
  title text NOT NULL,
  title_mr text,
  total_income numeric DEFAULT 0,
  total_expenditure numeric DEFAULT 0,
  document_url text,
  upload_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_bpl_families (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_head_name text NOT NULL,
  family_head_name_mr text,
  bpl_card_number text NOT NULL UNIQUE,
  family_members int NOT NULL DEFAULT 1,
  annual_income numeric DEFAULT 0,
  address text NOT NULL,
  address_mr text,
  category text NOT NULL CHECK (category IN ('apl', 'bpl', 'aay')),
  ration_card_type text,
  verification_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_gpdp_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  title_mr text,
  description text,
  description_mr text,
  category text NOT NULL,
  estimated_budget numeric DEFAULT 0,
  year text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status text NOT NULL CHECK (status IN ('proposed', 'approved', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_gram_sabha_meetings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_number text NOT NULL,
  meeting_date date NOT NULL,
  agenda text NOT NULL,
  agenda_mr text,
  decisions text,
  decisions_mr text,
  attendance int DEFAULT 0,
  venue text,
  minutes_document_url text,
  created_at timestamptz DEFAULT now()
);

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'cms_budget_documents',
    'cms_bpl_families',
    'cms_gpdp_projects',
    'cms_gram_sabha_meetings'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS cms_public_select_%I ON public.%I', table_name, table_name);
    EXECUTE format(
      'CREATE POLICY cms_public_select_%I ON public.%I FOR SELECT USING (true)',
      table_name, table_name
    );
    EXECUTE format('DROP POLICY IF EXISTS cms_admin_write_%I ON public.%I', table_name, table_name);
    EXECUTE format(
      'CREATE POLICY cms_admin_write_%I ON public.%I FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin'')))',
      table_name, table_name
    );
  END LOOP;
END $$;

COMMIT;
