import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, Shield, Bell, Palette, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Visão Geral", href: "/superadmin", icon: <LayoutDashboard size={18} /> },
  { label: "Creches", href: "/superadmin/creches", icon: <Building2 size={18} /> },
  { label: "Usuários", href: "/superadmin/usuarios", icon: <Users size={18} /> },
  { label: "Financeiro", href: "/superadmin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Analytics", href: "/superadmin/analytics", icon: <BarChart3 size={18} /> },
  { label: "Configurações", href: "/superadmin/config", icon: <Settings size={18} /> },
];

const sections = [
  { icon: <Shield size={20} />, title: "Segurança", desc: "Políticas de senha, 2FA, logs de acesso", color: "bg-primary/15" },
  { icon: <Bell size={20} />, title: "Notificações", desc: "Alertas por email, push e SMS", color: "bg-accent/60" },
  { icon: <Palette size={20} />, title: "Personalização", desc: "Logo, cores e branding das creches", color: "bg-secondary/50" },
  { icon: <Globe size={20} />, title: "Integrações", desc: "Gateways de pagamento, APIs externas", color: "bg-success/40" },
];

const ConfigPage = () => (
  <DashboardLayout title="Configurações" navItems={navItems} roleBadge="Superadmin">
    <div className="grid sm:grid-cols-2 gap-4">
      {sections.map((s) => (
        <div key={s.title} className="bg-card rounded-2xl p-5 shadow-card border border-border flex items-start gap-4">
          <div className={`p-3 rounded-xl ${s.color}`}>{s.icon}</div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            <Button variant="ghost" size="sm" className="mt-3 text-primary">Gerenciar</Button>
          </div>
        </div>
      ))}
    </div>
  </DashboardLayout>
);

export default ConfigPage;
