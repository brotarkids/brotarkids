
-- 1. Attendance (Frequência)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    present BOOLEAN DEFAULT true,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, date)
);

-- 2. Lesson Plans (Planejamento)
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    bncc_code TEXT,
    planned_date DATE NOT NULL,
    status TEXT DEFAULT 'planned', -- 'planned', 'done', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_attendance_updated_at') THEN
        CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_lesson_plans_updated_at') THEN
        CREATE TRIGGER update_lesson_plans_updated_at BEFORE UPDATE ON public.lesson_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- RLS Policies

-- Drop existing policies if any
DROP POLICY IF EXISTS "Superadmin manages attendance" ON public.attendance;
DROP POLICY IF EXISTS "Auth users view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers manage attendance" ON public.attendance;

DROP POLICY IF EXISTS "Superadmin manages plans" ON public.lesson_plans;
DROP POLICY IF EXISTS "Auth users view plans" ON public.lesson_plans;
DROP POLICY IF EXISTS "Teachers manage plans" ON public.lesson_plans;

-- Superadmin
CREATE POLICY "Superadmin manages attendance" ON public.attendance FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin manages plans" ON public.lesson_plans FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- Attendance: Teachers can manage, Parents can view (simplified: auth users view)
CREATE POLICY "Auth users view attendance" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage attendance" ON public.attendance FOR ALL TO authenticated USING (true); -- Simplified for MVP, ideally check if teacher of class

-- Lesson Plans: Teachers can manage, Parents can view (simplified)
CREATE POLICY "Auth users view plans" ON public.lesson_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage plans" ON public.lesson_plans FOR ALL TO authenticated USING (true); -- Simplified for MVP
