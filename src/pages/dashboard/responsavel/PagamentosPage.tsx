import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Calendar, CreditCard, MessageSquare, User, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Feed do Dia", href: "/responsavel", icon: <LayoutDashboard size={18} /> },
  { label: "Calendário", href: "/responsavel/calendario", icon: <Calendar size={18} /> },
  { label: "Pagamentos", href: "/responsavel/pagamentos", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/responsavel/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Perfil da Criança", href: "/responsavel/perfil", icon: <User size={18} /> },
];

const statusLabel: Record<string, string> = { paid: "Pago", pending: "Pendente", overdue: "Atrasado" };

const PagamentosPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("financial_records")
        .select("*")
        .eq("payer_id", user.id)
        .order("due_date", { ascending: false });
      setRecords(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const pending = records.filter(r => r.status === "pending" || r.status === "overdue");
  const nextDue = pending.length > 0 ? pending.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0] : null;

  if (loading) {
    return (
      <DashboardLayout title="Pagamentos" navItems={navItems} roleBadge="Responsável">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pagamentos" navItems={navItems} roleBadge="Responsável">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard icon={<Clock size={18} />} label="Próx. vencimento" value={nextDue ? new Date(nextDue.due_date).toLocaleDateString("pt-BR") : "-"} sub={nextDue ? `R$ ${Number(nextDue.amount).toFixed(2)}` : ""} color="bg-warning/30" />
        <StatCard icon={<CheckCircle size={18} />} label="Situação" value={pending.length === 0 ? "Em dia ✓" : `${pending.length} pendente(s)`} color={pending.length === 0 ? "bg-success/40" : "bg-warning/30"} />
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-bold text-foreground">Histórico de faturas</h3>
        </div>
        <div className="divide-y divide-border">
          {records.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma fatura encontrada.</p>
          ) : records.map((f) => (
            <div key={f.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{f.description}</p>
                <span className="text-xs text-muted-foreground">Venc.: {new Date(f.due_date).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">R$ {Number(f.amount).toFixed(2)}</span>
                {f.status === "pending" || f.status === "overdue" ? (
                  <Button variant="default" size="sm">Pagar</Button>
                ) : (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/40 text-success-foreground">
                    {statusLabel[f.status] || f.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PagamentosPage;
