
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
  wants_daily_logs BOOLEAN;
BEGIN
  SELECT s.name, s.parent_id INTO student_name, parent_user_id
  FROM public.students s
  WHERE s.id = NEW.student_id;

  IF parent_user_id IS NOT NULL THEN
    -- Check if parent wants daily_logs notifications (default true)
    SELECT COALESCE(np.daily_logs, true) INTO wants_daily_logs
    FROM public.notification_preferences np
    WHERE np.user_id = parent_user_id;

    -- If no preferences row exists, default to true
    IF NOT FOUND THEN
      wants_daily_logs := true;
    END IF;

    IF wants_daily_logs THEN
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
  END IF;

  RETURN NEW;
END;
$$;
