import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, TrendingUp, Eye, UserCheck, Clock } from "lucide-react";

const navItems = [
  { label: "Visão Geral", href: "/superadmin", icon: <LayoutDashboard size={18} /> },
  { label: "Creches", href: "/superadmin/creches", icon: <Building2 size={18} /> },
  { label: "Usuários", href: "/superadmin/usuarios", icon: <Users size={18} /> },
  { label: "Financeiro", href: "/superadmin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Analytics", href: "/superadmin/analytics", icon: <BarChart3 size={18} /> },
  { label: "Configurações", href: "/superadmin/config", icon: <Settings size={18} /> },
];

const AnalyticsPage = () => (
  <DashboardLayout title="Analytics" navItems={navItems} roleBadge="Superadmin">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={<Eye size={18} />} label="Sessões mês" value="3.2k" sub="+18% vs anterior" color="bg-primary/15" />
      <StatCard icon={<UserCheck size={18} />} label="Engajamento pais" value="84%" sub="Média geral" color="bg-success/40" />
      <StatCard icon={<Clock size={18} />} label="Tempo médio" value="4m 12s" sub="Por sessão" color="bg-secondary/50" />
      <StatCard icon={<TrendingUp size={18} />} label="NPS" value="72" sub="Ótimo" color="bg-accent/60" />
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <h3 className="font-display font-bold text-foreground mb-4">Top creches por engajamento</h3>
        <div className="space-y-3">
          {[
            { name: "Raio de Sol", value: "94%" },
            { name: "Estrela Guia", value: "89%" },
            { name: "Pequeno Mundo", value: "82%" },
            { name: "Centro Infantil Broto", value: "78%" },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">{c.name}</span>
              <span className="text-sm font-medium text-foreground">{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <h3 className="font-display font-bold text-foreground mb-4">Funcionalidades mais usadas</h3>
        <div className="space-y-3">
          {[
            { name: "Feed do dia (pais)", value: "1.8k acessos" },
            { name: "Registro diário (prof.)", value: "980 registros" },
            { name: "Mensagens", value: "620 mensagens" },
            { name: "Financeiro", value: "340 acessos" },
          ].map((f) => (
            <div key={f.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">{f.name}</span>
              <span className="text-sm text-muted-foreground">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default AnalyticsPage;
