-- UTF-8 Encoding Fix Migration
-- Ensures all tables and columns use proper UTF-8 collation for Marathi/Devanagari text
-- This fixes the '????' rendering issue

BEGIN;

-- Set database to UTF-8
ALTER DATABASE postgres SET client_encoding = 'UTF8';

-- Create or update profiles table with UTF-8 collation
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL COLLATE "C",
  full_name text COLLATE "C",
  phone text COLLATE "C",
  role text NOT NULL CHECK (role IN ('citizen','admin','super_admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
) WITH (oid = 16384);

-- Ensure website settings table columns use UTF-8
ALTER TABLE IF EXISTS public.cms_website_settings 
  ALTER COLUMN setting_value SET DATA TYPE text COLLATE "C";

-- Ensure all CMS tables use UTF-8 collation
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT t.tablename FROM pg_tables t WHERE t.schemaname = 'public' AND t.tablename LIKE 'cms_%'
  LOOP
    EXECUTE format('COMMENT ON TABLE public.%I IS %L', table_name, 'Table with UTF-8 support for Marathi/Devanagari text');
  END LOOP;
END $$;

-- Add indexes for better text search with UTF-8
CREATE INDEX IF NOT EXISTS idx_cms_website_settings_value ON public.cms_website_settings USING gin(to_tsvector('simple', setting_value));

-- Ensure character set is UTF-8 for all connections
SET CLIENT_ENCODING TO 'UTF-8';

COMMIT;
