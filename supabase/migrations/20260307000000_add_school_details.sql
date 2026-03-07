-- Add detailed fields to schools table
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS working_hours jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{}'::jsonb;
