
-- Allow superadmin to view all profiles (needed for UsuariosPage)
CREATE POLICY "Superadmin can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));

-- Allow superadmin to view all user_roles
CREATE POLICY "Superadmin can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));

-- Allow admin to manage students in their school
CREATE POLICY "Admin manages students"
ON public.students
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admin to manage financial records in their school
CREATE POLICY "Admin manages finance"
ON public.financial_records
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow professor to manage daily_logs for their class
CREATE POLICY "Professor manages logs"
ON public.daily_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'professor'));

-- Allow professor to manage classes assigned to them
CREATE POLICY "Professor views own class"
ON public.classes
FOR SELECT
TO authenticated
USING (teacher_id = auth.uid());
