import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, DollarSign, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
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

const statusLabel: Record<string, string> = { paid: "Pago", pending: "Pendente", overdue: "Atrasado" };
const statusColor: Record<string, string> = {
  paid: "bg-success/40 text-success-foreground",
  pending: "bg-warning/30 text-warning-foreground",
  overdue: "bg-destructive/20 text-destructive",
};

const FinanceiroAdminPage = () => {
  const { data: profile } = useUserProfile();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      let query = supabase.from("financial_records").select("*, students(name)").order("due_date", { ascending: false }).limit(50);
      if (profile.school_id) query = query.eq("school_id", profile.school_id);
      const { data } = await query;
      setRecords(data || []);
      setLoading(false);
    };
    load();
  }, [profile]);

  const paid = records.filter(r => r.status === "paid");
  const pending = records.filter(r => r.status === "pending");
  const overdue = records.filter(r => r.status === "overdue");
  const totalRevenue = paid.reduce((s, r) => s + Number(r.amount), 0);
  const totalPending = pending.reduce((s, r) => s + Number(r.amount), 0);
  const totalOverdue = overdue.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <DashboardLayout title="Financeiro" navItems={navItems} roleBadge="Diretor(a)">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<DollarSign size={18} />} label="Receita" value={`R$ ${totalRevenue.toFixed(0)}`} color="bg-success/40" />
        <StatCard icon={<CheckCircle size={18} />} label="Pagos" value={String(paid.length)} sub={`de ${records.length}`} color="bg-primary/15" />
        <StatCard icon={<Clock size={18} />} label="Pendentes" value={String(pending.length)} sub={`R$ ${totalPending.toFixed(0)}`} color="bg-accent/60" />
        <StatCard icon={<AlertTriangle size={18} />} label="Atrasados" value={String(overdue.length)} sub={`R$ ${totalOverdue.toFixed(0)}`} color="bg-warning/30" />
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-bold text-foreground">Boletos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Descrição</th>
                <th className="px-5 py-3 font-medium">Criança</th>
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
              ) : records.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{b.description}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.students?.name || "-"}</td>
                  <td className="px-5 py-3 text-foreground">R$ {Number(b.amount).toFixed(2)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(b.due_date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[b.status] || "bg-muted"}`}>
                      {statusLabel[b.status] || b.status}
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

export default FinanceiroAdminPage;
