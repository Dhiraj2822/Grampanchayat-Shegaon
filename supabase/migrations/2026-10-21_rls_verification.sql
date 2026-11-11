-- Run after 2026-10-21_rls_hardening.sql.
-- This is read-only and confirms the intended RLS posture.
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_select_grant,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select_grant
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'profiles',
    'cms_development_works',
    'cms_tenders',
    'cms_budget_documents',
    'cms_gpdp_projects',
    'cms_gram_sabha_meetings',
    'cms_bpl_families'
  )
ORDER BY c.relname;

SELECT policyname, tablename, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'cms_development_works',
    'cms_tenders',
    'cms_budget_documents',
    'cms_gpdp_projects',
    'cms_gram_sabha_meetings',
    'cms_bpl_families'
  )
ORDER BY tablename, policyname;
