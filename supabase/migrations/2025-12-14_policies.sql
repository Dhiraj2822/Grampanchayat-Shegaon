-- RLS Policies for roles and tables
BEGIN;

-- Enable RLS
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND (tablename LIKE 'cms_%' OR tablename LIKE 'cit_%') LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
  EXECUTE 'ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
END$$;

-- Current role view
CREATE OR REPLACE VIEW public._current_role AS
  SELECT p.id, p.role FROM public.profiles p WHERE p.id = auth.uid();

-- Profiles
DROP POLICY IF EXISTS profiles_super_admin_all ON public.profiles;
CREATE POLICY profiles_super_admin_all ON public.profiles
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role='super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role='super_admin'));

DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Allow users to insert their own profile (needed for signup)
DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
CREATE POLICY profiles_insert_self ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- CMS content: public read, admin/super_admin write
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'cms_%' LOOP
    EXECUTE format('DROP POLICY IF EXISTS cms_public_select_%I ON public.%I', t, t);
    EXECUTE format('CREATE POLICY cms_public_select_%I ON public.%I FOR SELECT USING (true)', t, t);

    EXECUTE format('DROP POLICY IF EXISTS cms_admin_write_%I ON public.%I', t, t);
    EXECUTE format($sql$
      CREATE POLICY cms_admin_write_%I ON public.%I FOR ALL
      USING (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role IN ('admin','super_admin')))
      WITH CHECK (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role IN ('admin','super_admin')))
    $sql$, t, t);
  END LOOP;
END$$;

-- Citizen tables: own records; admin/super_admin manage
-- INSERT requires authenticated user (login required)
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'cit_%' LOOP
    EXECUTE format('DROP POLICY IF EXISTS cit_select_self_%I ON public.%I', t, t);
    EXECUTE format($sql$
      CREATE POLICY cit_select_self_%I ON public.%I FOR SELECT
      USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role IN ('admin','super_admin')))
    $sql$, t, t);

    -- INSERT requires authentication (user must be logged in)
    EXECUTE format('DROP POLICY IF EXISTS cit_insert_self_%I ON public.%I', t, t);
    EXECUTE format($sql$
      CREATE POLICY cit_insert_self_%I ON public.%I FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid())
    $sql$, t, t);

    EXECUTE format('DROP POLICY IF EXISTS cit_update_%I ON public.%I', t, t);
    EXECUTE format($sql$
      CREATE POLICY cit_update_%I ON public.%I FOR UPDATE
      USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role IN ('admin','super_admin')))
      WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role IN ('admin','super_admin')))
    $sql$, t, t);

    EXECUTE format('DROP POLICY IF EXISTS cit_delete_admin_%I ON public.%I', t, t);
    EXECUTE format($sql$
      CREATE POLICY cit_delete_admin_%I ON public.%I FOR DELETE
      USING (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role IN ('admin','super_admin')))
    $sql$, t, t);
  END LOOP;
END$$;

-- Logs + settings: super_admin write; admin read
DROP POLICY IF EXISTS logs_super_admin_write ON public.activity_logs;
CREATE POLICY logs_super_admin_write ON public.activity_logs
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role='super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role='super_admin'));

DROP POLICY IF EXISTS logs_admin_select ON public.activity_logs;
CREATE POLICY logs_admin_select ON public.activity_logs
  FOR SELECT USING (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role IN ('admin','super_admin')));

DROP POLICY IF EXISTS settings_super_admin_write ON public.system_settings;
CREATE POLICY settings_super_admin_write ON public.system_settings
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role='super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role='super_admin'));

DROP POLICY IF EXISTS settings_admin_select ON public.system_settings;
CREATE POLICY settings_admin_select ON public.system_settings
  FOR SELECT USING (EXISTS (SELECT 1 FROM public._current_role r WHERE r.id = auth.uid() AND r.role IN ('admin','super_admin')));

COMMIT;
