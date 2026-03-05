import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, TrendingUp, AlertTriangle } from "lucide-react";

const navItems = [
  { label: "Visão Geral", href: "/superadmin", icon: <LayoutDashboard size={18} /> },
  { label: "Creches", href: "/superadmin/creches", icon: <Building2 size={18} /> },
  { label: "Usuários", href: "/superadmin/usuarios", icon: <Users size={18} /> },
  { label: "Financeiro", href: "/superadmin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Analytics", href: "/superadmin/analytics", icon: <BarChart3 size={18} /> },
  { label: "Configurações", href: "/superadmin/config", icon: <Settings size={18} /> },
];

const SuperAdminDashboard = () => {
  return (
    <DashboardLayout title="Painel Geral" navItems={navItems} roleBadge="Superadmin">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Building2 size={18} />} label="Creches ativas" value="12" sub="+2 este mês" color="bg-secondary/50" />
        <StatCard icon={<Users size={18} />} label="Crianças total" value="847" sub="94% ocupação" color="bg-primary/15" />
        <StatCard icon={<TrendingUp size={18} />} label="Receita mensal" value="R$ 42.3k" sub="+12% vs mês anterior" color="bg-success/40" />
        <StatCard icon={<AlertTriangle size={18} />} label="Inadimplência" value="6.2%" sub="R$ 2.6k pendente" color="bg-warning/30" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Creches recentes</h3>
          <div className="space-y-3">
            {["Creche Raio de Sol – SP", "Escola Pequeno Mundo – RJ", "Centro Infantil Broto – MG"].map((name) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">Ativa</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Alertas</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/10">
              <AlertTriangle size={16} className="text-warning mt-0.5" />
              <div className="text-sm">
                <span className="font-medium text-foreground">3 creches</span>
                <span className="text-muted-foreground"> com inadimplência acima de 10%</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-success/10">
              <TrendingUp size={16} className="text-success-foreground mt-0.5" />
              <div className="text-sm">
                <span className="font-medium text-foreground">Creche Raio de Sol</span>
                <span className="text-muted-foreground"> atingiu 100% de ocupação</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
