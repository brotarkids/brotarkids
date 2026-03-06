-- Update function to include class_id
CREATE OR REPLACE FUNCTION public.get_student_public_info(student_id_input UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    photo_url TEXT,
    class_name TEXT,
    class_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.photo_url,
        c.name as class_name,
        s.class_id
    FROM 
        public.students s
    LEFT JOIN 
        public.classes c ON s.class_id = c.id
    WHERE 
        s.id = student_id_input AND s.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public/anon (redundant if already granted, but safe)
GRANT EXECUTE ON FUNCTION public.get_student_public_info(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_student_public_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_public_info(UUID) TO service_role;
