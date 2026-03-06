-- Add missing columns to schools table for onboarding and customization
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS primary_color TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS teacher_student_ratio INTEGER,
ADD COLUMN IF NOT EXISTS menu_url TEXT,
ADD COLUMN IF NOT EXISTS lgpd_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS photo_policy_accepted_at TIMESTAMP WITH TIME ZONE;
