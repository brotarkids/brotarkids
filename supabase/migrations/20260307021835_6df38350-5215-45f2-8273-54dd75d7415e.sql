
-- Allow admin role to manage classes (INSERT, UPDATE, DELETE)
CREATE POLICY "Admin manages classes"
ON public.classes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
