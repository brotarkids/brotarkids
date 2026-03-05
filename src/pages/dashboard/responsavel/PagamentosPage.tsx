import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Calendar, CreditCard, MessageSquare, User, CheckCircle, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Feed do Dia", href: "/responsavel", icon: <LayoutDashboard size={18} /> },
  { label: "Calendário", href: "/responsavel/calendario", icon: <Calendar size={18} /> },
  { label: "Pagamentos", href: "/responsavel/pagamentos", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/responsavel/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Perfil da Criança", href: "/responsavel/perfil", icon: <User size={18} /> },
];

const faturas = [
  { mes: "Março 2026", valor: "R$ 1.200", vencimento: "10/03", status: "Pendente" },
  { mes: "Fevereiro 2026", valor: "R$ 1.200", vencimento: "10/02", status: "Pago" },
  { mes: "Janeiro 2026", valor: "R$ 1.200", vencimento: "10/01", status: "Pago" },
  { mes: "Dezembro 2025", valor: "R$ 1.200", vencimento: "10/12", status: "Pago" },
];

const PagamentosPage = () => (
  <DashboardLayout title="Pagamentos" navItems={navItems} roleBadge="Responsável">
    <div className="grid grid-cols-2 gap-4 mb-6">
      <StatCard icon={<Clock size={18} />} label="Próx. vencimento" value="10/03" sub="R$ 1.200" color="bg-warning/30" />
      <StatCard icon={<CheckCircle size={18} />} label="Em dia" value="✓" sub="Sem pendências" color="bg-success/40" />
    </div>

    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display font-bold text-foreground">Histórico de faturas</h3>
      </div>
      <div className="divide-y divide-border">
        {faturas.map((f, i) => (
          <div key={i} className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{f.mes}</p>
              <span className="text-xs text-muted-foreground">Venc.: {f.vencimento}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">{f.valor}</span>
              {f.status === "Pendente" ? (
                <Button variant="default" size="sm">Pagar</Button>
              ) : (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/40 text-success-foreground">Pago</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default PagamentosPage;
