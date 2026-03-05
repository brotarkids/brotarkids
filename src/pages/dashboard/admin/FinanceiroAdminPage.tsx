import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const navItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

const boletos = [
  { responsavel: "Fernanda Costa", crianca: "Sofia", valor: "R$ 1.200", vencimento: "10/03", status: "Pago" },
  { responsavel: "João Santos", crianca: "Miguel", valor: "R$ 1.200", vencimento: "10/03", status: "Pendente" },
  { responsavel: "Ana Lima", crianca: "Helena", valor: "R$ 1.500", vencimento: "10/03", status: "Pago" },
  { responsavel: "Carlos Souza", crianca: "Arthur", valor: "R$ 1.200", vencimento: "10/03", status: "Atrasado" },
];

const FinanceiroAdminPage = () => (
  <DashboardLayout title="Financeiro" navItems={navItems} roleBadge="Diretor(a)">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={<DollarSign size={18} />} label="Receita mês" value="R$ 18.4k" sub="Março 2026" color="bg-success/40" />
      <StatCard icon={<CheckCircle size={18} />} label="Pagos" value="42" sub="de 52 boletos" color="bg-primary/15" />
      <StatCard icon={<Clock size={18} />} label="Pendentes" value="7" sub="R$ 8.400" color="bg-accent/60" />
      <StatCard icon={<AlertTriangle size={18} />} label="Atrasados" value="3" sub="R$ 3.600" color="bg-warning/30" />
    </div>

    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display font-bold text-foreground">Boletos do mês</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Responsável</th>
              <th className="px-5 py-3 font-medium">Criança</th>
              <th className="px-5 py-3 font-medium">Valor</th>
              <th className="px-5 py-3 font-medium">Vencimento</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {boletos.map((b, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3 font-medium text-foreground">{b.responsavel}</td>
                <td className="px-5 py-3 text-muted-foreground">{b.crianca}</td>
                <td className="px-5 py-3 text-foreground">{b.valor}</td>
                <td className="px-5 py-3 text-muted-foreground">{b.vencimento}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    b.status === "Pago" ? "bg-success/40 text-success-foreground" :
                    b.status === "Atrasado" ? "bg-destructive/20 text-destructive" :
                    "bg-warning/30 text-warning-foreground"
                  }`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default FinanceiroAdminPage;
