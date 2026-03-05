import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Calendar, CreditCard, MessageSquare, User, Heart, Ruler, Weight, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Feed do Dia", href: "/responsavel", icon: <LayoutDashboard size={18} /> },
  { label: "Calendário", href: "/responsavel/calendario", icon: <Calendar size={18} /> },
  { label: "Pagamentos", href: "/responsavel/pagamentos", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/responsavel/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Perfil da Criança", href: "/responsavel/perfil", icon: <User size={18} /> },
];

const PerfilCriancaPage = () => {
  const { user } = useAuth();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("students")
        .select("*, classes(name, period)")
        .eq("parent_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      setChild(data);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout title="Perfil da Criança" navItems={navItems} roleBadge="Responsável">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!child) {
    return (
      <DashboardLayout title="Perfil da Criança" navItems={navItems} roleBadge="Responsável">
        <p className="text-center py-12 text-muted-foreground">Nenhuma criança vinculada.</p>
      </DashboardLayout>
    );
  }

  const calcAge = (bd: string | null) => {
    if (!bd) return "-";
    const diff = Date.now() - new Date(bd).getTime();
    const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    return `${years} ano${years !== 1 ? "s" : ""} e ${months} mes${months !== 1 ? "es" : ""}`;
  };

  return (
    <DashboardLayout title="Perfil da Criança" navItems={navItems} roleBadge="Responsável">
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full gradient-sprout flex items-center justify-center text-3xl">
            {child.photo_url ? <img src={child.photo_url} alt={child.name} className="w-full h-full rounded-full object-cover" /> : "👧"}
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">{child.name}</h2>
            <p className="text-sm text-muted-foreground">{calcAge(child.birth_date)} • {child.classes?.name || "Sem turma"}</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-3">Informações pessoais</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data de nascimento</span>
              <span className="text-foreground">{child.birth_date ? new Date(child.birth_date).toLocaleDateString("pt-BR") : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Turma</span>
              <span className="text-foreground">{child.classes?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Período</span>
              <span className="text-foreground">{child.classes?.period || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-foreground">{child.status === "active" ? "Ativa" : child.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-3">Informações de saúde</h3>
          <p className="text-sm text-muted-foreground">
            Dados de saúde (alergias, tipo sanguíneo, etc.) podem ser adicionados pelo administrador da escola.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerfilCriancaPage;
