
-- Allow superadmin to update any profile (for linking users to schools)
CREATE POLICY "Superadmin can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));
