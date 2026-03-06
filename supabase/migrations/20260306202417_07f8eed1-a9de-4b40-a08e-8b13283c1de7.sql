
-- Add missing columns to schools table
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS director_name text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'trial';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS teacher_student_ratio integer DEFAULT 10;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS menu_url text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS lgpd_accepted_at timestamp with time zone;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS photo_policy_accepted_at timestamp with time zone;

-- Create invites table
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'responsavel',
  token text NOT NULL UNIQUE,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- RLS: Admins and superadmins can manage invites for their school
CREATE POLICY "Admin manages invites" ON public.invites FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- RLS: Anyone can read invites by token (for signup flow)
CREATE POLICY "Public read invite by token" ON public.invites FOR SELECT
  USING (true);

-- Create RPC to get invite by token
CREATE OR REPLACE FUNCTION public.get_invite_by_token(token_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'id', i.id,
    'email', i.email,
    'role', i.role,
    'school_id', i.school_id,
    'school_name', s.name,
    'student_id', i.student_id,
    'token', i.token
  ) INTO result
  FROM public.invites i
  JOIN public.schools s ON s.id = i.school_id
  WHERE i.token = token_input AND i.status = 'pending';
  
  RETURN result;
END;
$$;

-- Create RPC to accept invite
CREATE OR REPLACE FUNCTION public.accept_invite(token_input text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record FROM public.invites WHERE token = token_input AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado ou já utilizado.';
  END IF;

  -- Update user role
  DELETE FROM public.user_roles WHERE user_id = auth.uid();
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), invite_record.role::app_role);
  
  -- Update profile with school_id
  UPDATE public.profiles SET school_id = invite_record.school_id WHERE user_id = auth.uid();

  -- If student_id exists, link parent
  IF invite_record.student_id IS NOT NULL THEN
    UPDATE public.students SET parent_id = auth.uid() WHERE id = invite_record.student_id;
  END IF;

  -- Mark invite as accepted
  UPDATE public.invites SET status = 'accepted', updated_at = now() WHERE id = invite_record.id;
END;
$$;
