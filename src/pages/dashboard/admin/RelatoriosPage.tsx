import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

const reports = [
  { title: "Frequência mensal", desc: "Relatório de presença por turma", icon: <Calendar size={20} />, color: "bg-primary/15" },
  { title: "Financeiro mensal", desc: "Receitas, inadimplência e projeções", icon: <CreditCard size={20} />, color: "bg-success/40" },
  { title: "Desenvolvimento infantil", desc: "Marcos por criança (BNCC)", icon: <Users size={20} />, color: "bg-secondary/50" },
  { title: "Engajamento dos pais", desc: "Visualizações, mensagens e interações", icon: <FileText size={20} />, color: "bg-accent/60" },
];

const RelatoriosPage = () => (
  <DashboardLayout title="Relatórios" navItems={navItems} roleBadge="Diretor(a)">
    <div className="grid sm:grid-cols-2 gap-4">
      {reports.map((r) => (
        <div key={r.title} className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${r.color}`}>{r.icon}</div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-foreground">{r.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
              <Button variant="ghost" size="sm" className="mt-3 gap-2 text-primary">
                <Download size={14} /> Gerar relatório
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </DashboardLayout>
);

export default RelatoriosPage;
