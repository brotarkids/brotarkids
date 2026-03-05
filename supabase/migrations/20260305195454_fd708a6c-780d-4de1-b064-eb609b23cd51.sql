
-- Drop all restrictive policies and recreate as permissive for schools
DROP POLICY IF EXISTS "Public view active schools" ON public.schools;
DROP POLICY IF EXISTS "Superadmin manages schools" ON public.schools;

CREATE POLICY "Public view active schools" ON public.schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin manages schools" ON public.schools FOR ALL TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role)) WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Fix classes too
DROP POLICY IF EXISTS "Auth users view classes" ON public.classes;
DROP POLICY IF EXISTS "Professor views own class" ON public.classes;
DROP POLICY IF EXISTS "Superadmin manages classes" ON public.classes;

CREATE POLICY "Auth users view classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Professor views own class" ON public.classes FOR SELECT TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Superadmin manages classes" ON public.classes FOR ALL TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role)) WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Fix daily_logs
DROP POLICY IF EXISTS "Auth users view logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Professor manages logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Superadmin manages logs" ON public.daily_logs;

CREATE POLICY "Auth users view logs" ON public.daily_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Professor manages logs" ON public.daily_logs FOR ALL TO authenticated USING (has_role(auth.uid(), 'professor'::app_role)) WITH CHECK (has_role(auth.uid(), 'professor'::app_role));
CREATE POLICY "Superadmin manages logs" ON public.daily_logs FOR ALL TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role)) WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Fix financial_records
DROP POLICY IF EXISTS "Admin manages finance" ON public.financial_records;
DROP POLICY IF EXISTS "Superadmin manages finance" ON public.financial_records;
DROP POLICY IF EXISTS "Users view own financial" ON public.financial_records;

CREATE POLICY "Admin manages finance" ON public.financial_records FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Superadmin manages finance" ON public.financial_records FOR ALL TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role)) WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));
CREATE POLICY "Users view own financial" ON public.financial_records FOR SELECT TO authenticated USING (payer_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Fix messages
DROP POLICY IF EXISTS "Superadmin manages messages" ON public.messages;
DROP POLICY IF EXISTS "Users manage own messages" ON public.messages;

CREATE POLICY "Superadmin manages messages" ON public.messages FOR ALL TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role)) WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));
CREATE POLICY "Users manage own messages" ON public.messages FOR ALL TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

-- Fix profiles
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Superadmin can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role));
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix students
DROP POLICY IF EXISTS "Admin manages students" ON public.students;
DROP POLICY IF EXISTS "Auth users view students" ON public.students;
DROP POLICY IF EXISTS "Superadmin manages students" ON public.students;

CREATE POLICY "Auth users view students" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages students" ON public.students FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Superadmin manages students" ON public.students FOR ALL TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role)) WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Fix user_roles
DROP POLICY IF EXISTS "Superadmin can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Superadmin can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role));
CREATE POLICY "Superadmins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role)) WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));
