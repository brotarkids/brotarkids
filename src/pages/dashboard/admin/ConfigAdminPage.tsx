import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, Building2, Bell, Clock, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

const sections = [
  { icon: <Building2 size={20} />, title: "Dados da Creche", desc: "Nome, endereço, CNPJ, contato", color: "bg-primary/15" },
  { icon: <Clock size={20} />, title: "Horários", desc: "Horário de funcionamento e turnos", color: "bg-secondary/50" },
  { icon: <Bell size={20} />, title: "Notificações", desc: "Comunicados e alertas para pais", color: "bg-accent/60" },
  { icon: <Palette size={20} />, title: "Personalização", desc: "Logo e cores da creche", color: "bg-success/40" },
];

const ConfigAdminPage = () => (
  <DashboardLayout title="Configurações" navItems={navItems} roleBadge="Diretor(a)">
    <div className="grid sm:grid-cols-2 gap-4">
      {sections.map((s) => (
        <div key={s.title} className="bg-card rounded-2xl p-5 shadow-card border border-border flex items-start gap-4">
          <div className={`p-3 rounded-xl ${s.color}`}>{s.icon}</div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            <Button variant="ghost" size="sm" className="mt-3 text-primary">Editar</Button>
          </div>
        </div>
      ))}
    </div>
  </DashboardLayout>
);

export default ConfigAdminPage;
