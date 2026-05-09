-- ─── Multi-User / Team Membership ─────────────────────────────────────────────

-- 1. Create organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_owner_id     UUID NOT NULL,
  member_user_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email            TEXT NOT NULL,
  role             TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  invited_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at        TIMESTAMPTZ,
  agreed_to_terms_at TIMESTAMPTZ,
  UNIQUE(org_owner_id, email)
);

-- 2. Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 3. Policies (idempotent via DO blocks)
DO $$ BEGIN
  CREATE POLICY "owner_full_access" ON public.organization_members
    FOR ALL USING (org_owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "member_read_own" ON public.organization_members
    FOR SELECT USING (member_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "accept_invite_by_email" ON public.organization_members
    FOR UPDATE USING (
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND status = 'pending'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Member read access to org data tables
DO $$ BEGIN
  CREATE POLICY "member_read_identity" ON public.identity
    FOR SELECT USING (
      user_id = auth.uid()
      OR user_id IN (
        SELECT org_owner_id FROM public.organization_members
        WHERE member_user_id = auth.uid() AND status = 'active'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "member_read_people" ON public.people
    FOR SELECT USING (
      user_id = auth.uid()
      OR user_id IN (
        SELECT org_owner_id FROM public.organization_members
        WHERE member_user_id = auth.uid() AND status = 'active'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "member_read_rhythm" ON public.rhythm
    FOR SELECT USING (
      user_id = auth.uid()
      OR user_id IN (
        SELECT org_owner_id FROM public.organization_members
        WHERE member_user_id = auth.uid() AND status = 'active'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "member_read_profiles" ON public.profiles
    FOR SELECT USING (
      id = auth.uid()
      OR id IN (
        SELECT org_owner_id FROM public.organization_members
        WHERE member_user_id = auth.uid() AND status = 'active'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
