import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Calendar, CreditCard, MessageSquare, User, Camera, Utensils, Moon, Smile, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Feed do Dia", href: "/responsavel", icon: <LayoutDashboard size={18} /> },
  { label: "Calendário", href: "/responsavel/calendario", icon: <Calendar size={18} /> },
  { label: "Pagamentos", href: "/responsavel/pagamentos", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/responsavel/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Perfil da Criança", href: "/responsavel/perfil", icon: <User size={18} /> },
];

const moodLabels: Record<string, string> = { happy: "Alegre", sleepy: "Sonolento", sad: "Triste", excited: "Animado" };

const ResponsavelDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: studentsData } = await supabase
        .from("students")
        .select("*, classes(name)")
        .eq("parent_id", user.id)
        .eq("status", "active");

      const studentList = studentsData || [];
      setChildren(studentList);

      if (studentList.length > 0) {
        const today = new Date().toISOString().split("T")[0];
        const { data: logsData } = await supabase
          .from("daily_logs")
          .select("*")
          .in("student_id", studentList.map(s => s.id))
          .eq("date", today)
          .order("created_at", { ascending: true });
        setLogs(logsData || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout title="Acompanhamento" navItems={navItems} roleBadge="Responsável">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (children.length === 0) {
    return (
      <DashboardLayout title="Acompanhamento" navItems={navItems} roleBadge="Responsável">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma criança vinculada ao seu perfil.</p>
          <p className="text-sm text-muted-foreground mt-2">Entre em contato com a escola para vincular seus filhos.</p>
        </div>
      </DashboardLayout>
    );
  }

  const child = children[0]; // Show first child
  const childLogs = logs.filter(l => l.student_id === child.id);
  const latestLog = childLogs[childLogs.length - 1];
  const hasMeal = latestLog?.meals && Object.keys(latestLog.meals).length > 0;
  const hasNap = latestLog?.nap && Object.keys(latestLog.nap).length > 0;
  const mood = latestLog?.mood;
  const photoCount = latestLog?.photos?.length || 0;

  // Build timeline from logs
  const timeline = childLogs.map(log => {
    const items = [];
    const time = new Date(log.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    
    if (log.meals && Object.keys(log.meals).length > 0) {
      items.push({ time, icon: "🍎", text: "Refeição registrada" });
    }
    if (log.nap && Object.keys(log.nap).length > 0) {
      items.push({ time, icon: "😴", text: `Soneca: ${log.nap.duration || "registrada"}` });
    }
    if (log.mood) {
      items.push({ time, icon: log.mood === "happy" ? "😊" : log.mood === "sad" ? "😢" : "😄", text: `Humor: ${moodLabels[log.mood] || log.mood}` });
    }
    if (log.notes) {
      items.push({ time, icon: "📝", text: log.notes });
    }
    return items;
  }).flat();

  return (
    <DashboardLayout title="Acompanhamento" navItems={navItems} roleBadge="Responsável">
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-sprout flex items-center justify-center text-2xl">
            {child.photo_url ? <img src={child.photo_url} alt={child.name} className="w-full h-full rounded-full object-cover" /> : "👧"}
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">{child.name}</h2>
            <p className="text-sm text-muted-foreground">{child.classes?.name || "Sem turma"}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className={`text-center p-2 rounded-xl ${hasMeal ? "bg-success/20" : "bg-muted"}`}>
            <Utensils size={16} className="mx-auto mb-1" />
            <span className="text-xs text-foreground font-medium">{hasMeal ? "Comeu" : "Sem reg."}</span>
          </div>
          <div className={`text-center p-2 rounded-xl ${hasNap ? "bg-secondary/40" : "bg-muted"}`}>
            <Moon size={16} className="mx-auto mb-1" />
            <span className="text-xs text-foreground font-medium">{hasNap ? "Dormiu" : "Sem reg."}</span>
          </div>
          <div className={`text-center p-2 rounded-xl ${mood ? "bg-accent/50" : "bg-muted"}`}>
            <Smile size={16} className="mx-auto mb-1" />
            <span className="text-xs text-foreground font-medium">{mood ? moodLabels[mood] || mood : "Sem reg."}</span>
          </div>
          <div className={`text-center p-2 rounded-xl ${photoCount > 0 ? "bg-primary/15" : "bg-muted"}`}>
            <Camera size={16} className="mx-auto mb-1" />
            <span className="text-xs text-foreground font-medium">{photoCount > 0 ? `${photoCount} foto${photoCount > 1 ? "s" : ""}` : "Sem foto"}</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <h3 className="font-display font-bold text-foreground mb-4">
          Hoje, {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
        </h3>
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum registro ainda hoje.</p>
        ) : (
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-4 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="text-lg">{item.icon}</div>
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="flex-1 pb-4 last:pb-0">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResponsavelDashboard;
