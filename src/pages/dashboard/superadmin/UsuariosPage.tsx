import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, Search, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "Visão Geral", href: "/superadmin", icon: <LayoutDashboard size={18} /> },
  { label: "Creches", href: "/superadmin/creches", icon: <Building2 size={18} /> },
  { label: "Usuários", href: "/superadmin/usuarios", icon: <Users size={18} /> },
  { label: "Financeiro", href: "/superadmin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Analytics", href: "/superadmin/analytics", icon: <BarChart3 size={18} /> },
  { label: "Configurações", href: "/superadmin/config", icon: <Settings size={18} /> },
];

const users = [
  { name: "Maria Silva", email: "maria@raidesol.com", role: "Admin", creche: "Raio de Sol" },
  { name: "João Santos", email: "joao@raidesol.com", role: "Professor", creche: "Raio de Sol" },
  { name: "Ana Oliveira", email: "ana@pequenomundo.com", role: "Admin", creche: "Pequeno Mundo" },
  { name: "Carlos Lima", email: "carlos@broto.com", role: "Professor", creche: "Centro Infantil Broto" },
  { name: "Fernanda Costa", email: "fernanda@gmail.com", role: "Responsável", creche: "Raio de Sol" },
];

const roleBadgeColor: Record<string, string> = {
  Admin: "bg-primary/20 text-primary-foreground",
  Professor: "bg-secondary/50 text-secondary-foreground",
  Responsável: "bg-accent/60 text-accent-foreground",
};

const UsuariosPage = () => (
  <DashboardLayout title="Usuários" navItems={navItems} roleBadge="Superadmin">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input placeholder="Buscar usuário..." className="pl-10" />
      </div>
      <Button variant="default" size="sm"><Plus size={16} /> Novo Usuário</Button>
    </div>

    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Papel</th>
              <th className="px-5 py-3 font-medium">Creche</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleBadgeColor[u.role] ?? "bg-muted"}`}>{u.role}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{u.creche}</td>
                <td className="px-5 py-3"><button className="text-muted-foreground hover:text-foreground"><MoreVertical size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default UsuariosPage;
