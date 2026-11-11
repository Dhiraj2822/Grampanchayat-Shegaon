-- Repairs Auth user rows created with NULL legacy token fields.
-- Run this migration before retrying password login.
BEGIN;

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

COMMIT;
