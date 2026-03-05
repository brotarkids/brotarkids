
-- Run this script in your Supabase SQL Editor to promote the user to Super Admin
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'brotarkids@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Insert superadmin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'superadmin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Remove other roles to ensure get_user_role returns superadmin
    DELETE FROM public.user_roles WHERE user_id = target_user_id AND role != 'superadmin';
    
    RAISE NOTICE 'User promoted to Super Admin successfully';
  ELSE
    RAISE NOTICE 'User not found. Please sign up first.';
  END IF;
END $$;
