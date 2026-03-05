import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, UserCheck, AlertTriangle, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";

const navItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

const AdminDashboard = () => {
  const { data: profile } = useUserProfile();
  const [stats, setStats] = useState({ students: 0, capacity: 0, pending: 0, classes: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const schoolId = profile.school_id;
    
    const load = async () => {
      let studentsQuery = supabase.from("students").select("id, class_id", { count: "exact" }).eq("status", "active");
      let classesQuery = supabase.from("classes").select("id, name, capacity, teacher_id");
      let financeQuery = supabase.from("financial_records").select("amount, status").eq("status", "pending");

      if (schoolId) {
        studentsQuery = studentsQuery.eq("school_id", schoolId);
        classesQuery = classesQuery.eq("school_id", schoolId);
        financeQuery = financeQuery.eq("school_id", schoolId);
      }

      const [studentsRes, classesRes, financeRes] = await Promise.all([studentsQuery, classesQuery, financeQuery]);

      const totalCapacity = (classesRes.data || []).reduce((s, c) => s + (c.capacity || 0), 0);
      const pendingAmount = (financeRes.data || []).reduce((s, f) => s + Number(f.amount), 0);

      // Count students per class
      const classCounts = new Map<string, number>();
      (studentsRes.data || []).forEach((s: any) => {
        if (s.class_id) classCounts.set(s.class_id, (classCounts.get(s.class_id) || 0) + 1);
      });

      const enrichedClasses = (classesRes.data || []).map((c: any) => ({
        ...c,
        studentCount: classCounts.get(c.id) || 0,
      }));

      setStats({
        students: studentsRes.count || 0,
        capacity: totalCapacity,
        pending: pendingAmount,
        classes: enrichedClasses,
      });
      setLoading(false);
    };
    load();
  }, [profile]);

  const occupancyPct = stats.capacity > 0 ? Math.round((stats.students / stats.capacity) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout title="Minha Creche" navItems={navItems} roleBadge="Diretor(a)">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Minha Creche" navItems={navItems} roleBadge="Diretor(a)">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Users size={18} />} label="Ocupação" value={`${occupancyPct}%`} sub={`${stats.students} de ${stats.capacity} vagas`} color="bg-primary/15" />
        <StatCard icon={<CreditCard size={18} />} label="Pendente" value={`R$ ${stats.pending.toFixed(0)}`} color="bg-warning/30" />
        <StatCard icon={<UserCheck size={18} />} label="Crianças" value={String(stats.students)} color="bg-success/40" />
        <StatCard icon={<GraduationCap size={18} />} label="Turmas" value={String(stats.classes.length)} color="bg-secondary/50" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Turmas</h3>
          <div className="space-y-3">
            {stats.classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma turma cadastrada.</p>
            ) : stats.classes.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{t.age_range || ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{t.studentCount}/{t.capacity || "?"}</span>
                  {t.studentCount > (t.capacity || 0) && <AlertTriangle size={14} className="text-warning" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Ações rápidas</h3>
          <div className="space-y-2">
            {["Nova matrícula", "Gerar boletos", "Enviar comunicado", "Ver relatório semanal"].map((action) => (
              <button key={action} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
