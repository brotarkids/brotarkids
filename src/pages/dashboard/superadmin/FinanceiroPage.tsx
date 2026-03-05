import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";

const navItems = [
  { label: "Visão Geral", href: "/superadmin", icon: <LayoutDashboard size={18} /> },
  { label: "Creches", href: "/superadmin/creches", icon: <Building2 size={18} /> },
  { label: "Usuários", href: "/superadmin/usuarios", icon: <Users size={18} /> },
  { label: "Financeiro", href: "/superadmin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Analytics", href: "/superadmin/analytics", icon: <BarChart3 size={18} /> },
  { label: "Configurações", href: "/superadmin/config", icon: <Settings size={18} /> },
];

const transactions = [
  { creche: "Raio de Sol", type: "Mensalidade", value: "R$ 12.500", date: "05/03", status: "Pago" },
  { creche: "Pequeno Mundo", type: "Mensalidade", value: "R$ 8.200", date: "04/03", status: "Pago" },
  { creche: "Centro Infantil Broto", type: "Mensalidade", value: "R$ 6.800", date: "03/03", status: "Pendente" },
  { creche: "Estrela Guia", type: "Mensalidade", value: "R$ 9.100", date: "02/03", status: "Pago" },
];

const FinanceiroPage = () => (
  <DashboardLayout title="Financeiro" navItems={navItems} roleBadge="Superadmin">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={<DollarSign size={18} />} label="Receita total" value="R$ 42.3k" sub="Março 2026" color="bg-success/40" />
      <StatCard icon={<TrendingUp size={18} />} label="Crescimento" value="+12%" sub="vs fev/2026" color="bg-primary/15" />
      <StatCard icon={<AlertTriangle size={18} />} label="Inadimplência" value="R$ 2.6k" sub="6.2%" color="bg-warning/30" />
      <StatCard icon={<TrendingDown size={18} />} label="Churn" value="1.2%" sub="1 creche cancelou" color="bg-destructive/20" />
    </div>

    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display font-bold text-foreground">Movimentações recentes</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Creche</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Valor</th>
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3 font-medium text-foreground">{t.creche}</td>
                <td className="px-5 py-3 text-muted-foreground">{t.type}</td>
                <td className="px-5 py-3 text-foreground">{t.value}</td>
                <td className="px-5 py-3 text-muted-foreground">{t.date}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.status === "Pago" ? "bg-success/40 text-success-foreground" : "bg-warning/30 text-warning-foreground"}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default FinanceiroPage;
