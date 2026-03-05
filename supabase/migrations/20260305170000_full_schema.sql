
-- 0. Ensure schools table exists (from previous migration)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT,
    state TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for schools if not already enabled
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger for schools if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_schools_updated_at') THEN
        CREATE TRIGGER update_schools_updated_at
        BEFORE UPDATE ON public.schools
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;


-- Add school_id to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'school_id') THEN
        ALTER TABLE public.profiles ADD COLUMN school_id UUID REFERENCES public.schools(id);
    END IF;
END $$;

-- 1. Classes (Turmas)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    teacher_id UUID REFERENCES auth.users(id), -- Professor responsável
    age_range TEXT, -- Ex: "2-3 anos"
    period TEXT, -- Ex: "Integral", "Manhã"
    capacity INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Students (Crianças/Alunos)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    birth_date DATE,
    photo_url TEXT,
    parent_id UUID REFERENCES auth.users(id), -- Responsável principal (pode ser expandido para tabela N:N depois)
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'graduated'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Daily Logs (Registro Diário / Agenda)
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood TEXT, -- 'happy', 'sad', 'neutral', etc
    meals JSONB DEFAULT '{}', -- { "lunch": "ate_all", "snack": "ate_some" }
    nap JSONB DEFAULT '{}', -- { "start": "13:00", "end": "14:30" }
    diaper JSONB DEFAULT '[]', -- [{ "time": "10:00", "type": "wet" }]
    notes TEXT,
    photos TEXT[], -- Array de URLs
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Financial Records (Financeiro)
CREATE TABLE IF NOT EXISTS public.financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id),
    payer_id UUID REFERENCES auth.users(id),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
    payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Messages (Mensagens)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    receiver_id UUID REFERENCES auth.users(id), -- Se NULL, pode ser mensagem para turma/escola (dependendo do contexto)
    class_id UUID REFERENCES public.classes(id), -- Opcional, para mensagens de turma
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_classes_updated_at') THEN
        CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_students_updated_at') THEN
        CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_financial_records_updated_at') THEN
        CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON public.financial_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- RLS Policies (Simplificadas para MVP)
-- Drop existing policies to avoid conflicts if re-running
DROP POLICY IF EXISTS "Superadmin manages schools" ON public.schools;
DROP POLICY IF EXISTS "Public view active schools" ON public.schools;

DROP POLICY IF EXISTS "Superadmin manages classes" ON public.classes;
DROP POLICY IF EXISTS "Superadmin manages students" ON public.students;
DROP POLICY IF EXISTS "Superadmin manages logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Superadmin manages finance" ON public.financial_records;
DROP POLICY IF EXISTS "Superadmin manages messages" ON public.messages;

DROP POLICY IF EXISTS "Auth users view classes" ON public.classes;
DROP POLICY IF EXISTS "Auth users view students" ON public.students;
DROP POLICY IF EXISTS "Auth users view logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users view own financial" ON public.financial_records;
DROP POLICY IF EXISTS "Users manage own messages" ON public.messages;

-- -- Superadmin sees all
CREATE POLICY "Superadmin manages schools" ON public.schools FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin manages classes" ON public.classes FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin manages students" ON public.students FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin manages logs" ON public.daily_logs FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin manages finance" ON public.financial_records FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin manages messages" ON public.messages FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- -- Users can view data from their school (General simplified policy - needs refinement for production)
-- For now, let's assume if you are authenticated, you can read basics (we filter in frontend/backend query mostly)
-- Ideally: check if profile.school_id matches record.school_id

-- Schools:
CREATE POLICY "Public view active schools" ON public.schools FOR SELECT TO authenticated USING (true);

-- Classes: Public read for auth users (simplified)
CREATE POLICY "Auth users view classes" ON public.classes FOR SELECT TO authenticated USING (true);

-- Students: Public read for auth users (simplified - in real app, only teachers/parents of that school)
CREATE POLICY "Auth users view students" ON public.students FOR SELECT TO authenticated USING (true);

-- Daily Logs: Parents see their kids, Teachers see their classes
-- Simplified: Auth users can view
CREATE POLICY "Auth users view logs" ON public.daily_logs FOR SELECT TO authenticated USING (true);

-- Financial: Users see their own records
CREATE POLICY "Users view own financial" ON public.financial_records FOR SELECT TO authenticated 
USING (payer_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Messages: Sender or Receiver
CREATE POLICY "Users manage own messages" ON public.messages FOR ALL TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());
