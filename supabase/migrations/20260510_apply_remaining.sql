-- Idempotent: organization_members table + columns
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_owner_id UUID NOT NULL,
  member_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  agreed_to_terms_at TIMESTAMPTZ,
  UNIQUE(org_owner_id, email)
);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ;

-- Profiles phone column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Activity logs columns
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS activity_logs_org_id_idx ON public.activity_logs (org_id, created_at DESC);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Unique constraints (safe via DO blocks)
DO $$ BEGIN
  ALTER TABLE public.identity ADD CONSTRAINT identity_user_id_key UNIQUE (user_id);
EXCEPTION WHEN duplicate_table OR duplicate_object OR unique_violation THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.people ADD CONSTRAINT people_user_id_key UNIQUE (user_id);
EXCEPTION WHEN duplicate_table OR duplicate_object OR unique_violation THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.rhythm ADD CONSTRAINT rhythm_user_id_key UNIQUE (user_id);
EXCEPTION WHEN duplicate_table OR duplicate_object OR unique_violation THEN NULL; END $$;

-- Policies
DO $$ BEGIN CREATE POLICY "owner_full_access" ON public.organization_members FOR ALL USING (org_owner_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "member_read_own" ON public.organization_members FOR SELECT USING (member_user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "accept_invite_by_email" ON public.organization_members FOR UPDATE USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND status = 'pending'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "owner_update_members" ON public.organization_members FOR UPDATE USING (org_owner_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "member_read_identity" ON public.identity FOR SELECT USING (user_id = auth.uid() OR user_id IN (SELECT org_owner_id FROM public.organization_members WHERE member_user_id = auth.uid() AND status = 'active')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "member_read_people" ON public.people FOR SELECT USING (user_id = auth.uid() OR user_id IN (SELECT org_owner_id FROM public.organization_members WHERE member_user_id = auth.uid() AND status = 'active')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "member_read_rhythm" ON public.rhythm FOR SELECT USING (user_id = auth.uid() OR user_id IN (SELECT org_owner_id FROM public.organization_members WHERE member_user_id = auth.uid() AND status = 'active')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "member_read_profiles" ON public.profiles FOR SELECT USING (id = auth.uid() OR id IN (SELECT org_owner_id FROM public.organization_members WHERE member_user_id = auth.uid() AND status = 'active')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "owner_read_logs" ON public.activity_logs FOR SELECT USING (org_id = auth.uid() OR user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "member_read_org_logs" ON public.activity_logs FOR SELECT USING (org_id IN (SELECT org_owner_id FROM public.organization_members WHERE member_user_id = auth.uid() AND status = 'active')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "insert_own_logs" ON public.activity_logs FOR INSERT WITH CHECK (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
