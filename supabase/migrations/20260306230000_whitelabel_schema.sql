-- Migration to support Whitelabel features
-- 1. Add color_palette to schools table
-- 2. Create school_assets bucket if not exists
-- 3. Set up RLS policies for school_assets

-- 1. Add color_palette column
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS color_palette JSONB DEFAULT NULL;

-- Ensure other whitelabel columns exist (idempotent)
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT;

-- 2. Create storage bucket for school assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school_assets', 
  'school_assets', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Storage Policies (RLS)

-- Allow public read access to all files in school_assets
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'school_assets' );

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated can upload" ON storage.objects;
CREATE POLICY "Authenticated can upload"
ON storage.objects FOR INSERT
WITH CHECK ( 
  bucket_id = 'school_assets' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING ( 
  bucket_id = 'school_assets' 
  AND auth.uid() = owner 
);

-- Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'school_assets' 
  AND auth.uid() = owner 
);

-- 4. Enable RLS on schools if not already
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read schools
-- This is permissive but allows:
-- 1. Superadmin to list all schools
-- 2. Users to fetch their school theme
DROP POLICY IF EXISTS "Authenticated can view schools" ON public.schools;
CREATE POLICY "Authenticated can view schools"
ON public.schools FOR SELECT
USING ( auth.role() = 'authenticated' );

-- Policy: Admins can update their own school
DROP POLICY IF EXISTS "Admins can update own school" ON public.schools;
CREATE POLICY "Admins can update own school"
ON public.schools FOR UPDATE
USING (
  id IN (
    SELECT school_id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Superadmin can do everything (optional, depending on how superadmin is defined)
-- Assuming Superadmin has a specific email or role, but typically RLS policies can be complex.
-- For now, relying on 'Authenticated can view schools' covers the read part.
-- Update is covered by 'Admins can update own school'.
-- Insert is not covered here, usually Superadmin creates via dashboard.
-- Let's add a policy for Insert if needed, but often Superadmin uses service role or we need a specific policy.
-- If Superadmin is just a user with a flag, we need a policy.
-- Let's assume Superadmin email check for now or skip Insert policy (default deny) if not needed by regular users.
-- But wait, CrechesPage uses client-side insert.
-- So we need an INSERT policy for schools.
-- Ideally only Superadmin can insert.
-- CREATE POLICY "Superadmin can insert schools" ON public.schools FOR INSERT WITH CHECK ( auth.email() = 'brotarkids@gmail.com' ); (Pseudo-code)

-- Adding Insert policy for Superadmin (using JWT claim for performance)
DROP POLICY IF EXISTS "Superadmin can insert schools" ON public.schools;
CREATE POLICY "Superadmin can insert schools"
ON public.schools FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'email') = 'brotarkids@gmail.com'
);

-- Adding Delete policy for Superadmin
DROP POLICY IF EXISTS "Superadmin can delete schools" ON public.schools;
CREATE POLICY "Superadmin can delete schools"
ON public.schools FOR DELETE
USING (
  (auth.jwt() ->> 'email') = 'brotarkids@gmail.com'
);

-- Adding Update policy for Superadmin
DROP POLICY IF EXISTS "Superadmin can update schools" ON public.schools;
CREATE POLICY "Superadmin can update schools"
ON public.schools FOR UPDATE
USING (
  (auth.jwt() ->> 'email') = 'brotarkids@gmail.com'
);
