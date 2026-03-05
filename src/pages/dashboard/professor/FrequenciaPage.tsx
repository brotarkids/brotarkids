import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Minha Turma", href: "/professor", icon: <LayoutDashboard size={18} /> },
  { label: "Registro Diário", href: "/professor/registro", icon: <ClipboardList size={18} /> },
  { label: "Planejamento", href: "/professor/planejamento", icon: <BookOpen size={18} /> },
  { label: "Frequência", href: "/professor/frequencia", icon: <CalendarCheck size={18} /> },
  { label: "Mensagens", href: "/professor/mensagens", icon: <MessageSquare size={18} /> },
];

const FrequenciaPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [myClass, setMyClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Track attendance locally (would need an attendance table for real persistence)
  const [attendance, setAttendance] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: classData } = await supabase.from("classes").select("*").eq("teacher_id", user.id).limit(1).maybeSingle();
      setMyClass(classData);

      if (classData) {
        const { data } = await supabase.from("students").select("*").eq("class_id", classData.id).eq("status", "active").order("name");
        const studentList = data || [];
        setStudents(studentList);
        // Default all present
        const map = new Map<string, boolean>();
        studentList.forEach(s => map.set(s.id, true));
        setAttendance(map);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleAttendance = (id: string) => {
    setAttendance(prev => {
      const next = new Map(prev);
      next.set(id, !next.get(id));
      return next;
    });
  };

  const presentCount = Array.from(attendance.values()).filter(Boolean).length;

  if (loading) {
    return (
      <DashboardLayout title="Frequência" navItems={navItems} roleBadge="Professor(a)">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!myClass) {
    return (
      <DashboardLayout title="Frequência" navItems={navItems} roleBadge="Professor(a)">
        <p className="text-center py-12 text-muted-foreground">Nenhuma turma atribuída.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Frequência" navItems={navItems} roleBadge="Professor(a)">
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-foreground">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </h3>
          <span className="text-sm text-muted-foreground">{presentCount}/{students.length} presentes</span>
        </div>

        <div className="space-y-2">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum aluno nesta turma.</p>
          ) : students.map((child) => {
            const present = attendance.get(child.id) ?? true;
            return (
              <div key={child.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium text-foreground">{child.name}</span>
                <button onClick={() => toggleAttendance(child.id)} className={`p-2 rounded-xl transition-colors ${present ? "bg-success/40" : "bg-destructive/20"}`}>
                  {present ? <Check size={16} className="text-success-foreground" /> : <X size={16} className="text-destructive" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FrequenciaPage;
