-- Fix RLS for daily_logs (Teachers need to INSERT/UPDATE)
DROP POLICY IF EXISTS "Auth users view logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Teachers manage logs" ON public.daily_logs;

-- Allow all authenticated users to SELECT (Parents need to see logs)
CREATE POLICY "Auth users view logs" ON public.daily_logs FOR SELECT TO authenticated USING (true);

-- Allow all authenticated users to INSERT/UPDATE/DELETE (Teachers need to manage logs)
-- Ideally this should be restricted to teachers of the class, but for MVP/prototype we use permissive policy
CREATE POLICY "Teachers manage logs" ON public.daily_logs FOR ALL TO authenticated USING (true);

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('children-media', 'children-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for storage (Allow public read, auth upload)
-- Note: You might need to adjust this if you have other buckets
CREATE POLICY "Public Access children-media" ON storage.objects FOR SELECT USING (bucket_id = 'children-media');
CREATE POLICY "Auth Upload children-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'children-media');
CREATE POLICY "Auth Update children-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'children-media');
CREATE POLICY "Auth Delete children-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'children-media');
