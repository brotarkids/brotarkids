import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

const turmas = [
  { name: "Berçário A", professor: "Prof. Lúcia", faixa: "0-1 ano", alunos: "12/15", periodo: "Integral" },
  { name: "Maternal I", professor: "Prof. Ana", faixa: "2-3 anos", alunos: "14/15", periodo: "Integral" },
  { name: "Maternal II", professor: "Prof. Carlos", faixa: "3-4 anos", alunos: "16/15", periodo: "Manhã" },
  { name: "Pré I", professor: "Prof. Maria", faixa: "4-5 anos", alunos: "10/15", periodo: "Tarde" },
];

const TurmasPage = () => (
  <DashboardLayout title="Turmas" navItems={navItems} roleBadge="Diretor(a)">
    <div className="flex justify-end mb-6">
      <Button variant="default" size="sm"><Plus size={16} /> Nova Turma</Button>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      {turmas.map((t) => (
        <div key={t.name} className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-foreground">{t.name}</h3>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground">{t.periodo}</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Professor(a)</span><span className="text-foreground">{t.professor}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Faixa etária</span><span className="text-foreground">{t.faixa}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Alunos</span><span className="text-foreground font-medium">{t.alunos}</span></div>
          </div>
          <Button variant="ghost" size="sm" className="mt-4 w-full text-primary">Ver detalhes</Button>
        </div>
      ))}
    </div>
  </DashboardLayout>
);

export default TurmasPage;
