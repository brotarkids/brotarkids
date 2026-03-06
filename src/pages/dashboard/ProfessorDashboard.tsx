import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, Camera, ClipboardList, Smile, Moon, Utensils, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { professorNavItems } from "@/config/navigation";

const ProfessorDashboard = () => {
  const { user } = useAuth();
  const [myClass, setMyClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [pendingMsgs, setPendingMsgs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Find the professor's class
      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", user.id)
        .limit(1)
        .maybeSingle();

      setMyClass(classData);

      if (classData) {
        const today = new Date().toISOString().split("T")[0];

        const [studentsRes, logsRes, msgsRes] = await Promise.all([
          supabase.from("students").select("*").eq("class_id", classData.id).eq("status", "active").order("name"),
          supabase.from("daily_logs").select("*").eq("class_id", classData.id).eq("date", today),
          supabase.from("messages").select("id", { count: "exact", head: true }).eq("receiver_id", user.id).is("read_at", null),
        ]);

        setStudents(studentsRes.data || []);
        setLogs(logsRes.data || []);
        setPendingMsgs(msgsRes.count || 0);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const logsMap = new Map<string, any>();
  logs.forEach(l => logsMap.set(l.student_id, l));

  const moodEmojis: Record<string, string> = { happy: "😊", sleepy: "😴", sad: "😢", excited: "😄" };

  if (loading) {
    return (
      <DashboardLayout title="Minha Turma" navItems={professorNavItems} roleBadge="Professor(a)">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!myClass) {
    return (
      <DashboardLayout title="Minha Turma" navItems={professorNavItems} roleBadge="Professor(a)">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma turma atribuída a você ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">Peça ao administrador para vincular uma turma ao seu perfil.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={myClass.name || "Minha Turma"} navItems={professorNavItems} roleBadge="Professor(a)">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={<CalendarCheck size={18} />} label="Alunos" value={String(students.length)} sub={`Capacidade: ${myClass.capacity || "?"}`} color="bg-success/40" />
        <StatCard icon={<ClipboardList size={18} />} label="Registros hoje" value={String(logs.length)} sub={`de ${students.length}`} color="bg-primary/15" />
        <StatCard icon={<MessageSquare size={18} />} label="Msgs pendentes" value={String(pendingMsgs)} color="bg-accent/60" />
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-foreground">Registro do dia</h3>
          <Button variant="default" size="sm">
            <Camera size={14} />
            Foto da turma
          </Button>
        </div>

        <div className="space-y-3">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum aluno nesta turma.</p>
          ) : students.map((child) => {
            const log = logsMap.get(child.id);
            const hasMeal = log?.meals && Object.keys(log.meals).length > 0;
            const hasNap = log?.nap && Object.keys(log.nap).length > 0;
            const hasPhoto = log?.photos && log.photos.length > 0;
            const mood = log?.mood;

            return (
              <div key={child.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{mood ? (moodEmojis[mood] || "😊") : "👤"}</span>
                  <span className="text-sm font-medium text-foreground">{child.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg text-xs ${hasMeal ? "bg-success/40" : "bg-muted"}`}><Utensils size={14} /></span>
                  <span className={`p-1.5 rounded-lg text-xs ${hasNap ? "bg-secondary/60" : "bg-muted"}`}><Moon size={14} /></span>
                  <span className={`p-1.5 rounded-lg text-xs ${hasPhoto ? "bg-accent/60" : "bg-muted"}`}><Camera size={14} /></span>
                  <span className={`p-1.5 rounded-lg text-xs ${mood ? "bg-primary/15" : "bg-muted"}`}><Smile size={14} /></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfessorDashboard;
