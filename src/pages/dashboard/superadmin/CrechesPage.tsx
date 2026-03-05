import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, Plus, Search, MoreVertical } from "lucide-react";
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

const creches = [
  { name: "Creche Raio de Sol", city: "São Paulo – SP", students: 60, occupancy: "95%", status: "Ativa" },
  { name: "Escola Pequeno Mundo", city: "Rio de Janeiro – RJ", students: 45, occupancy: "90%", status: "Ativa" },
  { name: "Centro Infantil Broto", city: "Belo Horizonte – MG", students: 38, occupancy: "76%", status: "Ativa" },
  { name: "Creche Estrela Guia", city: "Curitiba – PR", students: 52, occupancy: "87%", status: "Ativa" },
  { name: "Jardim Encantado", city: "Salvador – BA", students: 30, occupancy: "60%", status: "Trial" },
];

const CrechesPage = () => (
  <DashboardLayout title="Creches" navItems={navItems} roleBadge="Superadmin">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input placeholder="Buscar creche..." className="pl-10" />
      </div>
      <Button variant="default" size="sm"><Plus size={16} /> Nova Creche</Button>
    </div>

    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Cidade</th>
              <th className="px-5 py-3 font-medium">Alunos</th>
              <th className="px-5 py-3 font-medium">Ocupação</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {creches.map((c) => (
              <tr key={c.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{c.city}</td>
                <td className="px-5 py-3 text-foreground">{c.students}</td>
                <td className="px-5 py-3 text-foreground">{c.occupancy}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.status === "Ativa" ? "bg-success/40 text-success-foreground" : "bg-accent/60 text-accent-foreground"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button className="text-muted-foreground hover:text-foreground"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default CrechesPage;
