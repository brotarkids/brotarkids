import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, TrendingUp, Eye, UserCheck, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Visão Geral", href: "/superadmin", icon: <LayoutDashboard size={18} /> },
  { label: "Creches", href: "/superadmin/creches", icon: <Building2 size={18} /> },
  { label: "Usuários", href: "/superadmin/usuarios", icon: <Users size={18} /> },
  { label: "Financeiro", href: "/superadmin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Analytics", href: "/superadmin/analytics", icon: <BarChart3 size={18} /> },
  { label: "Configurações", href: "/superadmin/config", icon: <Settings size={18} /> },
];

const AnalyticsPage = () => {
  const [stats, setStats] = useState({ schools: 0, students: 0, messages: 0, logs: 0 });
  const [topSchools, setTopSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [schoolsRes, studentsRes, msgsRes, logsRes, schoolListRes] = await Promise.all([
        supabase.from("schools").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("daily_logs").select("id", { count: "exact", head: true }),
        supabase.from("schools").select("name, id").eq("status", "active").limit(10),
      ]);

      // Count students per school for "engagement"
      const { data: studentsBySchool } = await supabase.from("students").select("school_id");
      const schoolCounts = new Map<string, number>();
      (studentsBySchool || []).forEach((s: any) => {
        schoolCounts.set(s.school_id, (schoolCounts.get(s.school_id) || 0) + 1);
      });

      const enriched = (schoolListRes.data || []).map((s: any) => ({
        name: s.name,
        count: schoolCounts.get(s.id) || 0,
      })).sort((a: any, b: any) => b.count - a.count);

      setStats({
        schools: schoolsRes.count || 0,
        students: studentsRes.count || 0,
        messages: msgsRes.count || 0,
        logs: logsRes.count || 0,
      });
      setTopSchools(enriched);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Analytics" navItems={navItems} roleBadge="Superadmin">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics" navItems={navItems} roleBadge="Superadmin">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Building2 size={18} />} label="Creches ativas" value={String(stats.schools)} color="bg-primary/15" />
        <StatCard icon={<UserCheck size={18} />} label="Total crianças" value={String(stats.students)} color="bg-success/40" />
        <StatCard icon={<Eye size={18} />} label="Mensagens" value={String(stats.messages)} color="bg-secondary/50" />
        <StatCard icon={<TrendingUp size={18} />} label="Registros diários" value={String(stats.logs)} color="bg-accent/60" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Top creches por nº de alunos</h3>
          <div className="space-y-3">
            {topSchools.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados.</p>
            ) : topSchools.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{c.name}</span>
                <span className="text-sm font-medium text-foreground">{c.count} alunos</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Resumo de atividade</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-foreground">Registros diários</span>
              <span className="text-sm text-muted-foreground">{stats.logs} registros</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-foreground">Mensagens trocadas</span>
              <span className="text-sm text-muted-foreground">{stats.messages} mensagens</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">Crianças por creche</span>
              <span className="text-sm text-muted-foreground">{stats.schools > 0 ? (stats.students / stats.schools).toFixed(1) : 0} média</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
