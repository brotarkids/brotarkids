import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Visão Geral", href: "/superadmin", icon: <LayoutDashboard size={18} /> },
  { label: "Creches", href: "/superadmin/creches", icon: <Building2 size={18} /> },
  { label: "Usuários", href: "/superadmin/usuarios", icon: <Users size={18} /> },
  { label: "Financeiro", href: "/superadmin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Analytics", href: "/superadmin/analytics", icon: <BarChart3 size={18} /> },
  { label: "Configurações", href: "/superadmin/config", icon: <Settings size={18} /> },
];

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ schools: 0, students: 0, revenue: 0, pending: 0 });
  const [recentSchools, setRecentSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [schoolsRes, studentsRes, financeRes, recentRes] = await Promise.all([
        supabase.from("schools").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("financial_records").select("amount, status"),
        supabase.from("schools").select("name, city, state, status").order("created_at", { ascending: false }).limit(5),
      ]);

      const revenue = (financeRes.data || []).filter(f => f.status === "paid").reduce((s, f) => s + Number(f.amount), 0);
      const pending = (financeRes.data || []).filter(f => f.status === "pending").reduce((s, f) => s + Number(f.amount), 0);

      setStats({
        schools: schoolsRes.count || 0,
        students: studentsRes.count || 0,
        revenue,
        pending,
      });
      setRecentSchools(recentRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const formatCurrency = (v: number) => v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`;
  const inadimplencia = stats.revenue > 0 ? ((stats.pending / (stats.revenue + stats.pending)) * 100).toFixed(1) : "0";

  if (loading) {
    return (
      <DashboardLayout title="Painel Geral" navItems={navItems} roleBadge="Superadmin">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Painel Geral" navItems={navItems} roleBadge="Superadmin">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Building2 size={18} />} label="Creches ativas" value={String(stats.schools)} color="bg-secondary/50" />
        <StatCard icon={<Users size={18} />} label="Crianças total" value={String(stats.students)} color="bg-primary/15" />
        <StatCard icon={<TrendingUp size={18} />} label="Receita total" value={formatCurrency(stats.revenue)} color="bg-success/40" />
        <StatCard icon={<AlertTriangle size={18} />} label="Inadimplência" value={`${inadimplencia}%`} sub={formatCurrency(stats.pending) + " pendente"} color="bg-warning/30" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Creches recentes</h3>
          <div className="space-y-3">
            {recentSchools.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma creche cadastrada.</p>
            ) : recentSchools.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{s.name}{s.city ? ` – ${s.state || ''}` : ''}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.status === "active" ? "bg-success/40 text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                  {s.status === "active" ? "Ativa" : s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Resumo</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/10">
              <Building2 size={16} className="text-primary mt-0.5" />
              <div className="text-sm">
                <span className="font-medium text-foreground">{stats.schools} creches</span>
                <span className="text-muted-foreground"> ativas no sistema</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-success/10">
              <Users size={16} className="text-success-foreground mt-0.5" />
              <div className="text-sm">
                <span className="font-medium text-foreground">{stats.students} crianças</span>
                <span className="text-muted-foreground"> matriculadas</span>
              </div>
            </div>
            {stats.pending > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/10">
                <AlertTriangle size={16} className="text-warning mt-0.5" />
                <div className="text-sm">
                  <span className="font-medium text-foreground">{formatCurrency(stats.pending)}</span>
                  <span className="text-muted-foreground"> em pagamentos pendentes</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
