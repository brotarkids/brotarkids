import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Check, X, Loader2, Save, ChevronLeft, ChevronRight } from "lucide-react";
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

const FrequenciaPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [myClass, setMyClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Map<string, { present: boolean; notes: string; id?: string }>>(new Map());
  const [dirty, setDirty] = useState(false);

  const loadAttendance = useCallback(async (classId: string, studentList: any[], date: string) => {
    const { data } = await supabase
      .from("attendance" as any)
      .select("*")
      .eq("class_id", classId)
      .eq("date", date);

    const map = new Map<string, { present: boolean; notes: string; id?: string }>();
    const records = data || [];
    const recordMap = new Map<string, any>();
    records.forEach((r: any) => recordMap.set(r.student_id, r));

    studentList.forEach(s => {
      const record = recordMap.get(s.id);
      map.set(s.id, {
        present: record ? record.present : true,
        notes: record?.notes || "",
        id: record?.id,
      });
    });
    setAttendance(map);
    setDirty(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: classData } = await supabase.from("classes").select("*").eq("teacher_id", user.id).limit(1).maybeSingle();
      setMyClass(classData);

      if (classData) {
        const { data } = await supabase.from("students").select("*").eq("class_id", classData.id).eq("status", "active").order("name");
        const studentList = data || [];
        setStudents(studentList);
        await loadAttendance(classData.id, studentList, selectedDate);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!myClass || students.length === 0) return;
    loadAttendance(myClass.id, students, selectedDate);
  }, [selectedDate, myClass, students, loadAttendance]);

  const toggleAttendance = (id: string) => {
    setAttendance(prev => {
      const next = new Map(prev);
      const current = next.get(id) || { present: true, notes: "" };
      next.set(id, { ...current, present: !current.present });
      return next;
    });
    setDirty(true);
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleSave = async () => {
    if (!user || !myClass) return;
    setSaving(true);

    const upserts = students.map(s => {
      const rec = attendance.get(s.id) || { present: true, notes: "" };
      return {
        ...(rec.id ? { id: rec.id } : {}),
        student_id: s.id,
        class_id: myClass.id,
        date: selectedDate,
        present: rec.present,
        notes: rec.notes || null,
        recorded_by: user.id,
      };
    });

    const { error } = await supabase.from("attendance" as any).upsert(upserts, { onConflict: "student_id,date" });
    if (error) {
      toast.error("Erro ao salvar frequência");
      console.error(error);
    } else {
      toast.success("Frequência salva!");
      setDirty(false);
      await loadAttendance(myClass.id, students, selectedDate);
    }
    setSaving(false);
  };

  const presentCount = Array.from(attendance.values()).filter(v => v.present).length;

  const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

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
        {/* Date nav + save */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}><ChevronLeft size={18} /></Button>
            <h3 className="font-display font-bold text-foreground capitalize text-sm sm:text-base">{dateLabel}</h3>
            <Button variant="ghost" size="icon" onClick={() => changeDate(1)}><ChevronRight size={18} /></Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{presentCount}/{students.length} presentes</span>
            <Button variant="default" size="sm" onClick={handleSave} disabled={saving || !dirty}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum aluno nesta turma.</p>
          ) : students.map((child) => {
            const rec = attendance.get(child.id) || { present: true, notes: "" };
            return (
              <div key={child.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{child.name}</span>
                  {!rec.present && <span className="text-xs text-destructive font-medium">Ausente</span>}
                </div>
                <button onClick={() => toggleAttendance(child.id)} className={`p-2 rounded-xl transition-colors ${rec.present ? "bg-success/40" : "bg-destructive/20"}`}>
                  {rec.present ? <Check size={16} className="text-success-foreground" /> : <X size={16} className="text-destructive" />}
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
