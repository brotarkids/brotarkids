import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, TrendingUp, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Visão Geral", href: "/superadmin", icon: <LayoutDashboard size={18} /> },
  { label: "Creches", href: "/superadmin/creches", icon: <Building2 size={18} /> },
  { label: "Usuários", href: "/superadmin/usuarios", icon: <Users size={18} /> },
  { label: "Financeiro", href: "/superadmin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Analytics", href: "/superadmin/analytics", icon: <BarChart3 size={18} /> },
  { label: "Configurações", href: "/superadmin/config", icon: <Settings size={18} /> },
];

const FinanceiroPage = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("financial_records")
        .select("*, schools(name)")
        .order("due_date", { ascending: false })
        .limit(50);
      setRecords(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const paid = records.filter(r => r.status === "paid");
  const pending = records.filter(r => r.status === "pending");
  const totalRevenue = paid.reduce((s, r) => s + Number(r.amount), 0);
  const totalPending = pending.reduce((s, r) => s + Number(r.amount), 0);
  const fmt = (v: number) => v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v.toFixed(0)}`;
  const inadRate = (totalRevenue + totalPending) > 0 ? ((totalPending / (totalRevenue + totalPending)) * 100).toFixed(1) : "0";

  const statusLabel: Record<string, string> = { paid: "Pago", pending: "Pendente", overdue: "Atrasado" };
  const statusColor: Record<string, string> = {
    paid: "bg-success/40 text-success-foreground",
    pending: "bg-warning/30 text-warning-foreground",
    overdue: "bg-destructive/20 text-destructive",
  };

  return (
    <DashboardLayout title="Financeiro" navItems={navItems} roleBadge="Superadmin">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<DollarSign size={18} />} label="Receita total" value={fmt(totalRevenue)} color="bg-success/40" />
        <StatCard icon={<TrendingUp size={18} />} label="Registros" value={String(records.length)} color="bg-primary/15" />
        <StatCard icon={<AlertTriangle size={18} />} label="Inadimplência" value={`${inadRate}%`} sub={fmt(totalPending)} color="bg-warning/30" />
        <StatCard icon={<CreditCard size={18} />} label="Pagos" value={String(paid.length)} sub={`de ${records.length}`} color="bg-secondary/50" />
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
                <th className="px-5 py-3 font-medium">Descrição</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Vencimento</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />Carregando...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Nenhum registro financeiro.</td></tr>
              ) : records.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{r.schools?.name || "-"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.description}</td>
                  <td className="px-5 py-3 text-foreground">R$ {Number(r.amount).toFixed(2)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(r.due_date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[r.status] || "bg-muted"}`}>
                      {statusLabel[r.status] || r.status}
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
};

export default FinanceiroPage;
