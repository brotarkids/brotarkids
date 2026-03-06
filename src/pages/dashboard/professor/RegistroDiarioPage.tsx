import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Utensils, Moon, Camera, Smile, Save, Loader2, Baby, ChevronLeft, ChevronRight, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const loadLogs = async (classId: string, date: string) => {
    const { data } = await supabase.from("daily_logs").select("*").eq("class_id", classId).eq("date", date);
    const map = new Map<string, any>();
    (data || []).forEach(l => map.set(l.student_id, l));
    setLogs(map);
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: classData } = await supabase.from("classes").select("*").eq("teacher_id", user.id).limit(1).maybeSingle();
      setMyClass(classData);
      if (classData) {
        const { data } = await supabase.from("students").select("*").eq("class_id", classData.id).eq("status", "active").order("name");
        setStudents(data || []);
        await loadLogs(classData.id, selectedDate);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (myClass) loadLogs(myClass.id, selectedDate);
  }, [selectedDate, myClass]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const toggleField = (studentId: string, field: "meals" | "nap" | "mood" | "diaper") => {
    setLogs(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(studentId) || { student_id: studentId, class_id: myClass?.id, date: selectedDate };

      if (field === "mood") {
        const idx = moods.indexOf(existing.mood as any);
        existing.mood = moods[(idx + 1) % moods.length];
      } else if (field === "meals") {
        existing.meals = existing.meals && Object.keys(existing.meals).length > 0 ? {} : { lunch: true };
      } else if (field === "nap") {
        existing.nap = existing.nap && Object.keys(existing.nap).length > 0 ? {} : { duration: "1h" };
      } else if (field === "diaper") {
        const current = Array.isArray(existing.diaper) ? existing.diaper : [];
        existing.diaper = current.length > 0 ? [] : [{ time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), type: "normal" }];
      }

      newMap.set(studentId, { ...existing, _dirty: true });
      return newMap;
    });
  };

  const updateNotes = (studentId: string, notes: string) => {
    setLogs(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(studentId) || { student_id: studentId, class_id: myClass?.id, date: selectedDate };
      newMap.set(studentId, { ...existing, notes, _dirty: true });
      return newMap;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const dirtyLogs = Array.from(logs.values()).filter(l => l._dirty);

    let errors = 0;
    for (const log of dirtyLogs) {
      const { _dirty, ...data } = log;
      const payload = {
        meals: data.meals || {},
        nap: data.nap || {},
        mood: data.mood || null,
        notes: data.notes || null,
        diaper: data.diaper || [],
      };

      if (data.id) {
        const { error } = await supabase.from("daily_logs").update(payload).eq("id", data.id);
        if (error) errors++;
      } else {
        const { error } = await supabase.from("daily_logs").insert([{
          student_id: data.student_id,
          class_id: data.class_id,
          date: data.date,
          ...payload,
        }]);
        if (error) errors++;
      }
    }

    if (errors > 0) toast.error(`${errors} registro(s) com erro`);
    else toast.success(`${dirtyLogs.length} registro(s) salvos!`);

    if (myClass) await loadLogs(myClass.id, selectedDate);
    setSaving(false);
  };

  const dirtyCount = Array.from(logs.values()).filter(l => l._dirty).length;

  const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

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
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}><ChevronLeft size={18} /></Button>
            <h3 className="font-display font-bold text-foreground capitalize text-sm sm:text-base">{dateLabel}</h3>
            <Button variant="ghost" size="icon" onClick={() => changeDate(1)}><ChevronRight size={18} /></Button>
          </div>
          <Button variant="default" size="sm" onClick={handleSaveAll} disabled={saving || dirtyCount === 0}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar tudo {dirtyCount > 0 && `(${dirtyCount})`}
          </Button>
        </div>

        <div className="space-y-4">
          {students.map((child) => {
            const log = logs.get(child.id) || {};
            const hasMeal = log.meals && Object.keys(log.meals).length > 0;
            const hasNap = log.nap && Object.keys(log.nap).length > 0;
            const hasDiaper = Array.isArray(log.diaper) && log.diaper.length > 0;
            const mood = log.mood;
            const isExpanded = expandedStudent === child.id;

            return (
              <div key={child.id} className={`p-4 rounded-xl border transition-colors ${log._dirty ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}>
                <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => setExpandedStudent(isExpanded ? null : child.id)}>
                  <span className="text-xl">{mood ? (moodEmojis[mood] || "👤") : "👤"}</span>
                  <span className="font-medium text-foreground flex-1">{child.name}</span>
                  {log._dirty && <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">Modificado</span>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button onClick={() => toggleField(child.id, "meals")} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${hasMeal ? "bg-success/30" : "bg-muted hover:bg-success/20"}`}>
                    <Utensils size={18} className={hasMeal ? "text-success-foreground" : "text-muted-foreground"} />
                    <span className="text-xs text-muted-foreground">Refeição</span>
                  </button>
                  <button onClick={() => toggleField(child.id, "nap")} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${hasNap ? "bg-secondary/50" : "bg-muted hover:bg-secondary/40"}`}>
                    <Moon size={18} className={hasNap ? "text-secondary-foreground" : "text-muted-foreground"} />
                    <span className="text-xs text-muted-foreground">Soneca</span>
                  </button>
                  <button onClick={() => toggleField(child.id, "diaper")} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${hasDiaper ? "bg-accent/60" : "bg-muted hover:bg-accent/40"}`}>
                    <Baby size={18} className={hasDiaper ? "text-accent-foreground" : "text-muted-foreground"} />
                    <span className="text-xs text-muted-foreground">Fralda</span>
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

                {/* Expanded: notes */}
                {isExpanded && (
                  <div className="mt-3">
                    <Textarea
                      placeholder="Observações sobre a criança hoje..."
                      value={log.notes || ""}
                      onChange={e => updateNotes(child.id, e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegistroDiarioPage;
