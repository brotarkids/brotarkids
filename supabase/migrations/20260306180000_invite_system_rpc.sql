
-- Function to get invite details by token (accessible by public)
CREATE OR REPLACE FUNCTION public.get_invite_by_token(token_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invite_record RECORD;
    school_name TEXT;
BEGIN
    SELECT i.*, s.name as school_name
    INTO invite_record
    FROM public.invites i
    JOIN public.schools s ON i.school_id = s.id
    WHERE i.token = token_input AND i.status = 'pending';

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    RETURN jsonb_build_object(
        'id', invite_record.id,
        'email', invite_record.email,
        'role', invite_record.role,
        'school_id', invite_record.school_id,
        'school_name', invite_record.school_name,
        'student_id', invite_record.student_id,
        'token', invite_record.token
    );
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(TEXT) TO anon, authenticated;


-- Function to accept invite (accessible by authenticated users only)
CREATE OR REPLACE FUNCTION public.accept_invite(token_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invite_record RECORD;
    current_user_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get invite
    SELECT * INTO invite_record
    FROM public.invites
    WHERE token = token_input AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invite';
    END IF;

    -- Update invite status
    UPDATE public.invites
    SET status = 'accepted', updated_at = now()
    WHERE id = invite_record.id;

    -- Update profile
    UPDATE public.profiles
    SET 
        school_id = invite_record.school_id,
        role = invite_record.role::text, -- Cast if needed, assuming role column matches
        updated_at = now()
    WHERE user_id = current_user_id;

    -- Link student if parent invite
    IF invite_record.student_id IS NOT NULL THEN
        UPDATE public.students
        SET parent_id = current_user_id, updated_at = now()
        WHERE id = invite_record.student_id;
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execute to authenticated only
GRANT EXECUTE ON FUNCTION public.accept_invite(TEXT) TO authenticated;
