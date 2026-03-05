import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, Search, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

const criancas = [
  { name: "Sofia Oliveira", age: "3 anos", turma: "Maternal I", responsavel: "Fernanda Costa", status: "Ativa" },
  { name: "Miguel Santos", age: "2 anos", turma: "Berçário A", responsavel: "João Santos", status: "Ativa" },
  { name: "Helena Lima", age: "4 anos", turma: "Pré I", responsavel: "Ana Lima", status: "Ativa" },
  { name: "Arthur Souza", age: "3 anos", turma: "Maternal I", responsavel: "Carlos Souza", status: "Ativa" },
  { name: "Laura Pereira", age: "1 ano", turma: "Berçário A", responsavel: "Maria Pereira", status: "Trancada" },
];

const CriancasPage = () => (
  <DashboardLayout title="Crianças" navItems={navItems} roleBadge="Diretor(a)">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input placeholder="Buscar criança..." className="pl-10" />
      </div>
      <Button variant="default" size="sm"><Plus size={16} /> Nova Matrícula</Button>
    </div>

    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Idade</th>
              <th className="px-5 py-3 font-medium">Turma</th>
              <th className="px-5 py-3 font-medium">Responsável</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {criancas.map((c) => (
              <tr key={c.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{c.age}</td>
                <td className="px-5 py-3 text-foreground">{c.turma}</td>
                <td className="px-5 py-3 text-muted-foreground">{c.responsavel}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.status === "Ativa" ? "bg-success/40 text-success-foreground" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
                </td>
                <td className="px-5 py-3"><button className="text-muted-foreground hover:text-foreground"><MoreVertical size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default CriancasPage;
