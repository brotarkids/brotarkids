
-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to notify parents via edge function when daily log is created
CREATE OR REPLACE FUNCTION public.notify_parent_on_daily_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  student_name TEXT;
  parent_user_id UUID;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Get student info
  SELECT s.name, s.parent_id INTO student_name, parent_user_id
  FROM public.students s
  WHERE s.id = NEW.student_id;

  -- Only notify if parent exists
  IF parent_user_id IS NOT NULL THEN
    SELECT decrypted_secret INTO supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
    SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;

    PERFORM extensions.http_post(
      url := supabase_url || '/functions/v1/send-push-notification',
      body := json_build_object(
        'user_id', parent_user_id,
        'title', 'Registro de ' || COALESCE(student_name, 'seu filho(a)'),
        'body', 'Um novo registro diário foi adicionado. Confira agora! 📋',
        'url', '/responsavel'
      )::text,
      headers := json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      )::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on daily_logs
CREATE TRIGGER on_daily_log_insert
  AFTER INSERT ON public.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_parent_on_daily_log();
