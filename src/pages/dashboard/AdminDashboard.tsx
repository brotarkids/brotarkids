import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, UserCheck, AlertTriangle, Heart } from "lucide-react";

const navItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout title="Minha Creche" navItems={navItems} roleBadge="Diretor(a)">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Users size={18} />} label="Ocupação" value="87%" sub="52 de 60 vagas" color="bg-primary/15" />
        <StatCard icon={<CreditCard size={18} />} label="Inadimplência" value="4.3%" sub="R$ 850 pendente" color="bg-warning/30" />
        <StatCard icon={<UserCheck size={18} />} label="Presentes hoje" value="48" sub="4 ausentes" color="bg-success/40" />
        <StatCard icon={<Heart size={18} />} label="Engajamento pais" value="89%" sub="Ótimo" color="bg-secondary/50" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Turmas hoje</h3>
          <div className="space-y-3">
            {[
              { name: "Berçário A", prof: "Prof. Lúcia", kids: "12/15", status: "ok" },
              { name: "Maternal I", prof: "Prof. Ana", kids: "14/15", status: "ok" },
              { name: "Maternal II", prof: "Prof. Carlos", kids: "16/15", status: "alert" },
              { name: "Pré I", prof: "Prof. Maria", kids: "10/15", status: "ok" },
            ].map((t) => (
              <div key={t.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{t.prof}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{t.kids}</span>
                  {t.status === "alert" && <AlertTriangle size={14} className="text-warning" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Ações rápidas</h3>
          <div className="space-y-2">
            {["Nova matrícula", "Gerar boletos", "Enviar comunicado", "Ver relatório semanal"].map((action) => (
              <button key={action} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
