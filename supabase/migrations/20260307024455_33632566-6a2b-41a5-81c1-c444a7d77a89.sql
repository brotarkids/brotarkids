
CREATE OR REPLACE FUNCTION public.generate_school_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from name
  base_slug := lower(
    regexp_replace(
      regexp_replace(
        translate(NEW.name, 'áàãâéèêíìîóòõôúùûçÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇ', 'aaaaeeeiiioooouuucAAAAEEEIIIOOOOUUUC'),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
  
  final_slug := base_slug;
  
  -- Handle uniqueness
  WHILE EXISTS (SELECT 1 FROM public.schools WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_school_slug
BEFORE INSERT ON public.schools
FOR EACH ROW
WHEN (NEW.slug IS NULL)
EXECUTE FUNCTION public.generate_school_slug();
