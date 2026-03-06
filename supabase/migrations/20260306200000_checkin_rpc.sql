
-- Function to get limited student info for public check-in
CREATE OR REPLACE FUNCTION public.get_student_public_info(student_id_input UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    photo_url TEXT,
    class_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.photo_url,
        c.name as class_name
    FROM 
        public.students s
    LEFT JOIN 
        public.classes c ON s.class_id = c.id
    WHERE 
        s.id = student_id_input AND s.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public/anon
GRANT EXECUTE ON FUNCTION public.get_student_public_info(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_student_public_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_public_info(UUID) TO service_role;
