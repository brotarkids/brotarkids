
-- Add new columns to schools table
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS director_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS max_capacity INTEGER;

-- Create invites table
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'parent')),
    token TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Policies for invites
DROP POLICY IF EXISTS "Superadmin manages invites" ON public.invites;
DROP POLICY IF EXISTS "School admins manage invites" ON public.invites;

CREATE POLICY "Superadmin manages invites" ON public.invites FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "School admins manage invites" ON public.invites FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.school_id = invites.school_id
        AND profiles.role = 'admin'
    )
);
