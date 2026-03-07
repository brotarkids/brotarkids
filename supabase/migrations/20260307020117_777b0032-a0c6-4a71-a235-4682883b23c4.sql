
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS cnpj text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS working_hours jsonb DEFAULT '{"open":"07:00","close":"18:00"}'::jsonb;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{"parents":true,"messages":true}'::jsonb;

ALTER TABLE public.financial_records ADD COLUMN IF NOT EXISTS type text DEFAULT 'tuition';
