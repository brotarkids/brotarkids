
-- Add slug column to schools
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Generate slugs for existing schools
UPDATE public.schools 
SET slug = lower(
  regexp_replace(
    regexp_replace(
      translate(name, 'áàãâéèêíìîóòõôúùûçÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇ', 'aaaaeeeiiioooouuucAAAAEEEIIIOOOOUUUC'),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;
