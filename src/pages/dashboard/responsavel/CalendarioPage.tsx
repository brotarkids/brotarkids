import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Calendar, CreditCard, MessageSquare, User } from "lucide-react";

const navItems = [
  { label: "Feed do Dia", href: "/responsavel", icon: <LayoutDashboard size={18} /> },
  { label: "Calendário", href: "/responsavel/calendario", icon: <Calendar size={18} /> },
  { label: "Pagamentos", href: "/responsavel/pagamentos", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/responsavel/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Perfil da Criança", href: "/responsavel/perfil", icon: <User size={18} /> },
];

const events = [
  { date: "05/03", title: "Atividade artística: pintura", type: "Atividade", color: "bg-accent/60" },
  { date: "07/03", title: "Reunião de pais", type: "Reunião", color: "bg-primary/15" },
  { date: "10/03", title: "Vencimento mensalidade", type: "Financeiro", color: "bg-warning/30" },
  { date: "12/03", title: "Dia do pijama", type: "Evento", color: "bg-secondary/50" },
  { date: "15/03", title: "Festa de aniversários do mês", type: "Evento", color: "bg-success/40" },
  { date: "20/03", title: "Passeio ao parque", type: "Atividade", color: "bg-accent/60" },
];

const CalendarioPage = () => (
  <DashboardLayout title="Calendário" navItems={navItems} roleBadge="Responsável">
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
      <h3 className="font-display font-bold text-foreground mb-4">Março 2026</h3>
      <div className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
            <div className="text-center min-w-[48px]">
              <span className="block text-sm font-bold text-foreground">{e.date}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{e.title}</p>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${e.color}`}>{e.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default CalendarioPage;
