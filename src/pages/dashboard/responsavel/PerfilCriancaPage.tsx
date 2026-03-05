import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Calendar, CreditCard, MessageSquare, User, Heart, Ruler, Weight, AlertCircle } from "lucide-react";

const navItems = [
  { label: "Feed do Dia", href: "/responsavel", icon: <LayoutDashboard size={18} /> },
  { label: "Calendário", href: "/responsavel/calendario", icon: <Calendar size={18} /> },
  { label: "Pagamentos", href: "/responsavel/pagamentos", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/responsavel/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Perfil da Criança", href: "/responsavel/perfil", icon: <User size={18} /> },
];

const PerfilCriancaPage = () => (
  <DashboardLayout title="Perfil da Criança" navItems={navItems} roleBadge="Responsável">
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full gradient-sprout flex items-center justify-center text-3xl">👧</div>
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">Sofia Oliveira</h2>
          <p className="text-sm text-muted-foreground">3 anos e 4 meses • Maternal I</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center p-3 rounded-xl bg-primary/15">
          <Ruler size={18} className="mx-auto mb-1" />
          <span className="text-sm font-bold text-foreground">98 cm</span>
          <span className="block text-xs text-muted-foreground">Altura</span>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          <Weight size={18} className="mx-auto mb-1" />
          <span className="text-sm font-bold text-foreground">15 kg</span>
          <span className="block text-xs text-muted-foreground">Peso</span>
        </div>
        <div className="text-center p-3 rounded-xl bg-success/40">
          <Heart size={18} className="mx-auto mb-1" />
          <span className="text-sm font-bold text-foreground">O+</span>
          <span className="block text-xs text-muted-foreground">Tipo sang.</span>
        </div>
        <div className="text-center p-3 rounded-xl bg-warning/30">
          <AlertCircle size={18} className="mx-auto mb-1" />
          <span className="text-sm font-bold text-foreground">Nenhuma</span>
          <span className="block text-xs text-muted-foreground">Alergias</span>
        </div>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-6">
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <h3 className="font-display font-bold text-foreground mb-3">Informações pessoais</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Data de nascimento</span><span className="text-foreground">15/11/2022</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Turma</span><span className="text-foreground">Maternal I</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Professor(a)</span><span className="text-foreground">Prof. Ana</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Período</span><span className="text-foreground">Integral</span></div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <h3 className="font-display font-bold text-foreground mb-3">Contatos de emergência</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-foreground">Fernanda Costa (Mãe)</span>
            <p className="text-muted-foreground">(11) 99876-5432</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Ricardo Oliveira (Pai)</span>
            <p className="text-muted-foreground">(11) 99765-4321</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default PerfilCriancaPage;
