-- Role-management RPCs used by the super-admin dashboard.
BEGIN;

CREATE TABLE IF NOT EXISTS public.user_management_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id uuid NOT NULL REFERENCES public.profiles(id),
  target_user_id uuid NOT NULL REFERENCES public.profiles(id),
  action text NOT NULL,
  previous_role text NOT NULL,
  new_role text NOT NULL,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_management_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_management_logs_super_admin_select
  ON public.user_management_logs;
CREATE POLICY user_management_logs_super_admin_select
  ON public.user_management_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE OR REPLACE FUNCTION public.promote_user_to_admin(
  target_user_id uuid,
  reason text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  actor_id uuid := auth.uid();
  previous_role text;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = actor_id AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can change user roles';
  END IF;

  SELECT role INTO previous_role
  FROM public.profiles
  WHERE id = target_user_id
  FOR UPDATE;

  IF previous_role IS NULL THEN
    RAISE EXCEPTION 'Target user profile does not exist';
  END IF;

  IF previous_role <> 'citizen' THEN
    RAISE EXCEPTION 'Only citizen users can be promoted';
  END IF;

  UPDATE public.profiles
  SET role = 'admin', updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.user_management_logs (
    super_admin_id, target_user_id, action, previous_role, new_role, reason
  )
  VALUES (
    actor_id, target_user_id, 'PROMOTE_TO_ADMIN', previous_role, 'admin',
    COALESCE(reason, '')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.demote_admin_to_citizen(
  target_user_id uuid,
  reason text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  actor_id uuid := auth.uid();
  previous_role text;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = actor_id AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can change user roles';
  END IF;

  SELECT role INTO previous_role
  FROM public.profiles
  WHERE id = target_user_id
  FOR UPDATE;

  IF previous_role IS NULL THEN
    RAISE EXCEPTION 'Target user profile does not exist';
  END IF;

  IF previous_role <> 'admin' THEN
    RAISE EXCEPTION 'Only admin users can be demoted';
  END IF;

  UPDATE public.profiles
  SET role = 'citizen', updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.user_management_logs (
    super_admin_id, target_user_id, action, previous_role, new_role, reason
  )
  VALUES (
    actor_id, target_user_id, 'DEMOTE_TO_CITIZEN', previous_role, 'citizen',
    COALESCE(reason, '')
  );
END;
$$;

ALTER FUNCTION public.promote_user_to_admin(uuid, text) OWNER TO postgres;
ALTER FUNCTION public.demote_admin_to_citizen(uuid, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.promote_user_to_admin(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.demote_admin_to_citizen(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.demote_admin_to_citizen(uuid, text) TO authenticated;

GRANT SELECT ON public.user_management_logs TO authenticated;

COMMIT;
