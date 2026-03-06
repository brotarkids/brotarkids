
-- Create storage bucket for school assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('school_assets', 'school_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to files in school_assets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'school_assets' );

-- Policy to allow authenticated users to upload files to school_assets
CREATE POLICY "Authenticated can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'school_assets' AND auth.role() = 'authenticated' );

-- Policy to allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'school_assets' AND auth.uid() = owner );

-- Policy to allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'school_assets' AND auth.uid() = owner );
