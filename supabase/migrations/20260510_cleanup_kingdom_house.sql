-- ─── Kingdom House Account Data Cleanup ────────────────────────────────────────
-- Run this in Supabase SQL Editor to reset the Kingdom House account data
-- so the owner can re-enter their information cleanly.
-- This DELETES all layer data (identity, people, rhythm) for the account.

DO $$
DECLARE
  kh_user_id UUID;
BEGIN
  -- Get the user ID for the Kingdom House owner account
  SELECT id INTO kh_user_id
  FROM auth.users
  WHERE email = 'info@kingdomhousechurch.org'
  LIMIT 1;

  IF kh_user_id IS NULL THEN
    RAISE NOTICE 'User info@kingdomhousechurch.org not found — nothing to clean up.';
    RETURN;
  END IF;

  RAISE NOTICE 'Cleaning up data for user: %', kh_user_id;

  -- Delete ALL rows for this user (there may be duplicates from the old upsert bug)
  DELETE FROM public.identity WHERE user_id = kh_user_id;
  DELETE FROM public.people   WHERE user_id = kh_user_id;
  DELETE FROM public.rhythm   WHERE user_id = kh_user_id;

  -- Reset profile org info so onboarding runs again
  UPDATE public.profiles
  SET org_name = NULL, org_type = NULL
  WHERE id = kh_user_id;

  RAISE NOTICE 'Cleanup complete. The account will show onboarding on next login.';
END $$;
