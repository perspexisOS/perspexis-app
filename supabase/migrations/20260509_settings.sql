-- ─── Settings & Persistence Fixes ──────────────────────────────────────────────
-- Run in Supabase SQL Editor (Project → SQL Editor → New Query)

-- 1. Unique constraints so upsert works correctly on all data tables
ALTER TABLE public.identity ADD CONSTRAINT IF NOT EXISTS identity_user_id_key UNIQUE (user_id);
ALTER TABLE public.people   ADD CONSTRAINT IF NOT EXISTS people_user_id_key   UNIQUE (user_id);
ALTER TABLE public.rhythm   ADD CONSTRAINT IF NOT EXISTS rhythm_user_id_key   UNIQUE (user_id);

-- 2. Phone number on profiles (for 2FA and user directory)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Permissions + phone + status tracking on organization_members
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS phone       TEXT;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ;

-- 4. Richer activity_logs: org-scoped, user email for display, created_at
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS org_id     UUID;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Index for fast org-level log queries
CREATE INDEX IF NOT EXISTS activity_logs_org_id_idx ON public.activity_logs (org_id, created_at DESC);

-- 6. RLS: org owner and members can read org activity logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "owner_read_logs" ON public.activity_logs
  FOR SELECT USING (org_id = auth.uid() OR user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "member_read_org_logs" ON public.activity_logs
  FOR SELECT USING (
    org_id IN (
      SELECT org_owner_id FROM public.organization_members
      WHERE member_user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY IF NOT EXISTS "insert_own_logs" ON public.activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 7. Allow org owner to update member permissions and phone
CREATE POLICY IF NOT EXISTS "owner_update_members" ON public.organization_members
  FOR UPDATE USING (org_owner_id = auth.uid());
