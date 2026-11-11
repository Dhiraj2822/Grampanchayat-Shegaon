-- Recovery migration for databases where the RLS hardening migration was
-- already applied and citizen queries are failing.
BEGIN;

-- Supabase Auth expects these legacy token fields to be non-null text.
-- Older/manual user inserts can leave them NULL, causing Auth's user scan to
-- fail before password verification with "converting NULL to string".
DO $$
DECLARE
  token_column text;
  token_columns constant text[] := ARRAY[
    'confirmation_token',
    'email_change',
    'email_change_token_new',
    'email_change_token_current',
    'recovery_token',
    'phone_change',
    'phone_change_token',
    'reauthentication_token'
  ];
BEGIN
  FOREACH token_column IN ARRAY token_columns
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'auth'
        AND table_name = 'users'
        AND column_name = token_column
    ) THEN
      EXECUTE format(
        'UPDATE auth.users SET %1$I = '''' WHERE %1$I IS NULL',
        token_column
      );
    END IF;
  END LOOP;
END $$;

-- Restore the PostgREST/Supabase API access required for authentication and
-- public-table queries. These are schema/table privileges, not row access.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE EXCEPTION 'public.profiles does not exist; run the base schema first';
  END IF;
END $$;

-- Recreate the trusted role helpers if the previous migration was incomplete.
CREATE SCHEMA IF NOT EXISTS private;

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

ALTER FUNCTION private.is_admin() OWNER TO postgres;
ALTER FUNCTION private.is_super_admin() OWNER TO postgres;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_super_admin() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_super_admin() TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'citizen';
GRANT SELECT, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT INSERT (id, email, full_name, phone, created_at, updated_at)
  ON public.profiles TO authenticated;
GRANT UPDATE (email, full_name, phone, updated_at)
  ON public.profiles TO authenticated;
GRANT UPDATE (role) ON public.profiles TO authenticated;

-- Keep the role helper callable by authenticated policy evaluation.
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_super_admin() TO authenticated;

-- Repair the auth signup trigger. Keep the function search path fixed so
-- Supabase Auth can create profiles without depending on session privileges.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Remove every existing profiles policy so an older recursive policy cannot
-- remain permissively combined with the replacement policies.
DO $$
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_name);
  END LOOP;
END $$;

CREATE POLICY profiles_super_admin_all ON public.profiles
  FOR ALL TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());
CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_insert_self ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND role = 'citizen');
CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = 'citizen');

-- Remove the recursive _current_role dependency from all citizen tables.
DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOR table_name IN
    SELECT tablename FROM pg_tables
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
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', table_name);
  END LOOP;
END $$;

COMMIT;
