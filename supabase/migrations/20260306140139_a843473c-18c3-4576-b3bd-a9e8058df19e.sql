
-- Create storage bucket for children media (photos/videos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('children-media', 'children-media', true);

-- Allow professors and admins to upload files
CREATE POLICY "Professors upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'children-media'
    AND (
      public.has_role(auth.uid(), 'professor'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'superadmin'::public.app_role)
    )
  );

-- Allow authenticated users to view media (parents see their children's photos)
CREATE POLICY "Authenticated users view media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'children-media');

-- Allow professors/admins to delete media
CREATE POLICY "Professors delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'children-media'
    AND (
      public.has_role(auth.uid(), 'professor'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'superadmin'::public.app_role)
    )
  );

-- Allow professors/admins to update media
CREATE POLICY "Professors update media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'children-media'
    AND (
      public.has_role(auth.uid(), 'professor'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'superadmin'::public.app_role)
    )
  );
