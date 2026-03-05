import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Utensils, Moon, Camera, Smile, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { label: "Minha Turma", href: "/professor", icon: <LayoutDashboard size={18} /> },
  { label: "Registro Diário", href: "/professor/registro", icon: <ClipboardList size={18} /> },
  { label: "Planejamento", href: "/professor/planejamento", icon: <BookOpen size={18} /> },
  { label: "Frequência", href: "/professor/frequencia", icon: <CalendarCheck size={18} /> },
  { label: "Mensagens", href: "/professor/mensagens", icon: <MessageSquare size={18} /> },
];

const moods = ["happy", "sleepy", "sad", "excited"] as const;
const moodEmojis: Record<string, string> = { happy: "😊", sleepy: "😴", sad: "😢", excited: "😄" };

const RegistroDiarioPage = () => {
  const { user } = useAuth();
  const [myClass, setMyClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [logs, setLogs] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: classData } = await supabase.from("classes").select("*").eq("teacher_id", user.id).limit(1).maybeSingle();
      setMyClass(classData);

      if (classData) {
        const [studentsRes, logsRes] = await Promise.all([
          supabase.from("students").select("*").eq("class_id", classData.id).eq("status", "active").order("name"),
          supabase.from("daily_logs").select("*").eq("class_id", classData.id).eq("date", today),
        ]);
        setStudents(studentsRes.data || []);
        const map = new Map<string, any>();
        (logsRes.data || []).forEach(l => map.set(l.student_id, l));
        setLogs(map);
      }
      setLoading(false);
    };
    load();
  }, [user, today]);

  const toggleField = (studentId: string, field: "meals" | "nap" | "mood") => {
    setLogs(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(studentId) || { student_id: studentId, class_id: myClass?.id, date: today };
      
      if (field === "mood") {
        const currentMood = existing.mood || "";
        const idx = moods.indexOf(currentMood as any);
        existing.mood = moods[(idx + 1) % moods.length];
      } else if (field === "meals") {
        existing.meals = existing.meals && Object.keys(existing.meals).length > 0 ? {} : { lunch: true };
      } else if (field === "nap") {
        existing.nap = existing.nap && Object.keys(existing.nap).length > 0 ? {} : { duration: "1h" };
      }
      
      newMap.set(studentId, { ...existing, _dirty: true });
      return newMap;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const dirtyLogs = Array.from(logs.values()).filter(l => l._dirty);
    
    for (const log of dirtyLogs) {
      const { _dirty, ...data } = log;
      if (data.id) {
        await supabase.from("daily_logs").update({ meals: data.meals, nap: data.nap, mood: data.mood, notes: data.notes }).eq("id", data.id);
      } else {
        await supabase.from("daily_logs").insert([{ student_id: data.student_id, class_id: data.class_id, date: data.date, meals: data.meals || {}, nap: data.nap || {}, mood: data.mood || null }]);
      }
    }
    
    toast.success(`${dirtyLogs.length} registro(s) salvos!`);
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout title="Registro Diário" navItems={navItems} roleBadge="Professor(a)">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!myClass) {
    return (
      <DashboardLayout title="Registro Diário" navItems={navItems} roleBadge="Professor(a)">
        <p className="text-center py-12 text-muted-foreground">Nenhuma turma atribuída.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Registro Diário" navItems={navItems} roleBadge="Professor(a)">
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-foreground">{new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })} – {myClass.name}</h3>
          <Button variant="default" size="sm" onClick={handleSaveAll} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar tudo
          </Button>
        </div>

        <div className="space-y-4">
          {students.map((child) => {
            const log = logs.get(child.id) || {};
            const hasMeal = log.meals && Object.keys(log.meals).length > 0;
            const hasNap = log.nap && Object.keys(log.nap).length > 0;
            const mood = log.mood;

            return (
              <div key={child.id} className="p-4 rounded-xl border border-border bg-background">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{mood ? (moodEmojis[mood] || "👤") : "👤"}</span>
                  <span className="font-medium text-foreground">{child.name}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button onClick={() => toggleField(child.id, "meals")} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${hasMeal ? "bg-success/30" : "bg-muted hover:bg-success/20"}`}>
                    <Utensils size={18} className={hasMeal ? "text-success-foreground" : "text-muted-foreground"} />
                    <span className="text-xs text-muted-foreground">Refeição</span>
                  </button>
                  <button onClick={() => toggleField(child.id, "nap")} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${hasNap ? "bg-secondary/50" : "bg-muted hover:bg-secondary/40"}`}>
                    <Moon size={18} className={hasNap ? "text-secondary-foreground" : "text-muted-foreground"} />
                    <span className="text-xs text-muted-foreground">Soneca</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted hover:bg-accent/40 transition-colors">
                    <Camera size={18} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Foto</span>
                  </button>
                  <button onClick={() => toggleField(child.id, "mood")} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${mood ? "bg-primary/20" : "bg-muted hover:bg-primary/15"}`}>
                    <Smile size={18} className={mood ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-xs text-muted-foreground">{mood ? moodEmojis[mood] : "Humor"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegistroDiarioPage;
