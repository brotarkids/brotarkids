
CREATE OR REPLACE FUNCTION public.get_all_users_with_email()
RETURNS TABLE(user_id uuid, email text, full_name text, school_id uuid, role app_role)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.user_id,
    u.email::text,
    p.full_name,
    p.school_id,
    COALESCE(ur.role, 'responsavel'::app_role) as role
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  WHERE has_role(auth.uid(), 'superadmin'::app_role)
  ORDER BY p.created_at DESC
$$;
