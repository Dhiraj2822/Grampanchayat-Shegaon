-- Harden CMS policies:
-- - avoid querying profiles through an RLS-protected view from policies
-- - keep public CMS reads limited to non-sensitive content
-- - keep BPL family records private to staff
BEGIN;

CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.id = auth.uid()
      AND profile.role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION private.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.id = auth.uid()
      AND profile.role = 'super_admin'
  );
$$;

-- These helpers must be owned by a trusted role that bypasses RLS.
ALTER FUNCTION private.is_admin() OWNER TO postgres;
ALTER FUNCTION private.is_super_admin() OWNER TO postgres;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin() FROM anon;
REVOKE ALL ON FUNCTION private.is_super_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_super_admin() FROM anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_super_admin() TO authenticated;

-- Ensure policy enforcement is active before recreating policies.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fail early if the base profiles schema has not been installed.
DO $$
DECLARE
  required_column text;
BEGIN
  FOREACH required_column IN ARRAY ARRAY[
    'id', 'email', 'full_name', 'phone', 'role', 'created_at', 'updated_at'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = required_column
    ) THEN
      RAISE EXCEPTION 'public.profiles.% is required before running RLS hardening', required_column;
    END IF;
  END LOOP;
END $$;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'citizen';

-- Remove inherited and stale broad privileges, including column-level grants.
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
DO $$
DECLARE
  column_name text;
BEGIN
  FOR column_name IN
    SELECT attname
    FROM pg_attribute
    WHERE attrelid = 'public.profiles'::regclass
      AND attnum > 0
      AND NOT attisdropped
  LOOP
    EXECUTE format(
      'REVOKE SELECT (%I) ON TABLE public.profiles FROM PUBLIC, anon, authenticated',
      column_name
    );
    EXECUTE format(
      'REVOKE INSERT (%I) ON TABLE public.profiles FROM PUBLIC, anon, authenticated',
      column_name
    );
    EXECUTE format(
      'REVOKE UPDATE (%I) ON TABLE public.profiles FROM PUBLIC, anon, authenticated',
      column_name
    );
    EXECUTE format(
      'REVOKE REFERENCES (%I) ON TABLE public.profiles FROM PUBLIC, anon, authenticated',
      column_name
    );
  END LOOP;
END $$;

-- Remove every existing policy on profiles before recreating the intended set.
DO $$
DECLARE policy_name text;
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    FOR policy_name IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_name);
    END LOOP;
  END IF;
END $$;

CREATE POLICY profiles_super_admin_all ON public.profiles
  AS permissive
  FOR ALL TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE POLICY profiles_select_self ON public.profiles
  AS permissive
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_insert_self ON public.profiles
  AS permissive
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND role = 'citizen');

CREATE POLICY profiles_update_self ON public.profiles
  AS permissive
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = 'citizen');

-- Client-created profiles are citizens. Admin roles can only be assigned by
-- a trusted SQL/service-role operation, not through the public API.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE INSERT (role), UPDATE (role) ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.profiles TO authenticated;
GRANT INSERT (id, email, full_name, phone, created_at, updated_at)
  ON TABLE public.profiles TO authenticated;
GRANT UPDATE (email, full_name, phone, updated_at)
  ON TABLE public.profiles TO authenticated;
-- RLS still blocks non-super-admins from changing role; this grant allows
-- the super-admin user-management screen to assign roles.
GRANT UPDATE (role) ON TABLE public.profiles TO authenticated;

DO $$
DECLARE
  table_name text;
  policy_name text;
  column_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
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
    'cms_gpdp_projects',
    'cms_gram_sabha_meetings'
  ] LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
    FOR column_name IN
      SELECT attname
      FROM pg_attribute
      WHERE attrelid = format('public.%I', table_name)::regclass
        AND attnum > 0
        AND NOT attisdropped
    LOOP
      EXECUTE format(
        'REVOKE SELECT (%I) ON TABLE public.%I FROM PUBLIC, anon, authenticated',
        column_name, table_name
      );
      EXECUTE format(
        'REVOKE INSERT (%I) ON TABLE public.%I FROM PUBLIC, anon, authenticated',
        column_name, table_name
      );
      EXECUTE format(
        'REVOKE UPDATE (%I) ON TABLE public.%I FROM PUBLIC, anon, authenticated',
        column_name, table_name
      );
      EXECUTE format(
        'REVOKE REFERENCES (%I) ON TABLE public.%I FROM PUBLIC, anon, authenticated',
        column_name, table_name
      );
    END LOOP;

    -- Remove every existing policy, including policies created under other names.
    FOR policy_name IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY cms_public_select_%I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      table_name, table_name
    );
    EXECUTE format(
      'CREATE POLICY cms_admin_insert_%I ON public.%I FOR INSERT TO authenticated WITH CHECK (private.is_admin())',
      table_name, table_name
    );
    EXECUTE format(
      'CREATE POLICY cms_admin_update_%I ON public.%I FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin())',
      table_name, table_name
    );
    EXECUTE format(
      'CREATE POLICY cms_admin_delete_%I ON public.%I FOR DELETE TO authenticated USING (private.is_admin())',
      table_name, table_name
    );
  END LOOP;

  -- BPL data contains names, card numbers, income, and addresses.
  IF to_regclass('public.cms_bpl_families') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.cms_bpl_families ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON TABLE public.cms_bpl_families FROM PUBLIC, anon, authenticated';
    FOR policy_name IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'cms_bpl_families'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.cms_bpl_families', policy_name);
    END LOOP;
    EXECUTE 'CREATE POLICY cms_admin_select_cms_bpl_families ON public.cms_bpl_families FOR SELECT TO authenticated USING (private.is_admin())';
    EXECUTE 'CREATE POLICY cms_admin_insert_cms_bpl_families ON public.cms_bpl_families FOR INSERT TO authenticated WITH CHECK (private.is_admin())';
    EXECUTE 'CREATE POLICY cms_admin_update_cms_bpl_families ON public.cms_bpl_families FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin())';
    EXECUTE 'CREATE POLICY cms_admin_delete_cms_bpl_families ON public.cms_bpl_families FOR DELETE TO authenticated USING (private.is_admin())';
  END IF;
END $$;

-- Keep table privileges aligned with the policy allowlist, without assuming
-- optional CMS tables exist in an older installation.
DO $$
DECLARE
  table_name text;
  column_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
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
    'cms_gpdp_projects',
    'cms_gram_sabha_meetings'
  ] LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
      FOR column_name IN
        SELECT attname
        FROM pg_attribute
        WHERE attrelid = format('public.%I', table_name)::regclass
          AND attnum > 0
          AND NOT attisdropped
      LOOP
        EXECUTE format(
          'REVOKE SELECT (%I) ON TABLE public.%I FROM PUBLIC, anon, authenticated',
          column_name, table_name
        );
        EXECUTE format(
          'REVOKE INSERT (%I) ON TABLE public.%I FROM PUBLIC, anon, authenticated',
          column_name, table_name
        );
        EXECUTE format(
          'REVOKE UPDATE (%I) ON TABLE public.%I FROM PUBLIC, anon, authenticated',
          column_name, table_name
        );
        EXECUTE format(
          'REVOKE REFERENCES (%I) ON TABLE public.%I FROM PUBLIC, anon, authenticated',
          column_name, table_name
        );
      END LOOP;
      EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', table_name);
      EXECUTE format('GRANT INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated', table_name);

      -- Support inserts into optional serial/identity columns where present.
      FOR column_name IN
        SELECT a.attname
        FROM pg_attribute AS a
        WHERE a.attrelid = format('public.%I', table_name)::regclass
          AND a.attnum > 0
          AND NOT a.attisdropped
          AND pg_get_serial_sequence(format('public.%I', table_name), a.attname) IS NOT NULL
      LOOP
        EXECUTE format(
          'GRANT USAGE, SELECT ON SEQUENCE %s TO authenticated',
          pg_get_serial_sequence(format('public.%I', table_name), column_name)
        );
      END LOOP;
    END IF;
  END LOOP;

  IF to_regclass('public.cms_bpl_families') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.cms_bpl_families ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON TABLE public.cms_bpl_families FROM PUBLIC, anon, authenticated';
    FOR column_name IN
      SELECT attname
      FROM pg_attribute
      WHERE attrelid = 'public.cms_bpl_families'::regclass
        AND attnum > 0
        AND NOT attisdropped
    LOOP
      EXECUTE format(
        'REVOKE SELECT (%I) ON TABLE public.cms_bpl_families FROM PUBLIC, anon, authenticated',
        column_name
      );
      EXECUTE format(
        'REVOKE INSERT (%I) ON TABLE public.cms_bpl_families FROM PUBLIC, anon, authenticated',
        column_name
      );
      EXECUTE format(
        'REVOKE UPDATE (%I) ON TABLE public.cms_bpl_families FROM PUBLIC, anon, authenticated',
        column_name
      );
      EXECUTE format(
        'REVOKE REFERENCES (%I) ON TABLE public.cms_bpl_families FROM PUBLIC, anon, authenticated',
        column_name
      );
    END LOOP;
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cms_bpl_families TO authenticated';
  END IF;
END $$;

-- Replace legacy citizen-table policies that query the recursive _current_role
-- view. This keeps authenticated certificate and grievance queries working.
DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOR table_name IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'cit_%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);

    FOR policy_name IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY cit_select_self_%I ON public.%I FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.is_admin())',
      table_name, table_name
    );
    EXECUTE format(
      'CREATE POLICY cit_insert_self_%I ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid())',
      table_name, table_name
    );
    EXECUTE format(
      'CREATE POLICY cit_update_%I ON public.%I FOR UPDATE TO authenticated USING (user_id = auth.uid() OR private.is_admin()) WITH CHECK (user_id = auth.uid() OR private.is_admin())',
      table_name, table_name
    );
    EXECUTE format(
      'CREATE POLICY cit_delete_admin_%I ON public.%I FOR DELETE TO authenticated USING (private.is_admin())',
      table_name, table_name
    );
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated',
      table_name
    );

    FOR policy_name IN
      SELECT sequence_name
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
        AND sequence_name LIKE table_name || '%'
    LOOP
      EXECUTE format(
        'GRANT USAGE, SELECT ON SEQUENCE public.%I TO authenticated',
        policy_name
      );
    END LOOP;
  END LOOP;
END $$;

COMMIT;
