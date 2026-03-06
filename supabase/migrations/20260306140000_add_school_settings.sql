
-- Add LGPD columns to schools
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS lgpd_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS photo_policy_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS teacher_student_ratio INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS menu_url TEXT;

-- Add policy for School Admin to update their own school
CREATE POLICY "School admins update own school" ON public.schools
FOR UPDATE
TO authenticated
USING (
    id IN (
        SELECT school_id FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    id IN (
        SELECT school_id FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);
