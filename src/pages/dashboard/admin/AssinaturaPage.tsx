import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, Crown, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PLANS, PlanKey } from "@/lib/plans";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

const navItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Assinatura", href: "/admin/assinatura", icon: <Crown size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

const planKeys: PlanKey[] = ["semente", "broto", "floresta"];

const AssinaturaPage = () => {
  const { subscribed, plan: currentPlan, subscriptionEnd, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handlePortal = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleCheckout = async (planKey: PlanKey) => {
    const plan = PLANS[planKey];
    if (!plan.price_id) return;
    setLoadingCheckout(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: plan.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
    toast({ title: "Atualizado", description: "Status da assinatura verificado." });
  };

  const activePlan = currentPlan ? PLANS[currentPlan] : PLANS.semente;

  return (
    <DashboardLayout title="Assinatura" navItems={navItems} roleBadge="Diretor(a)">
      {/* Current plan card */}
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={20} className="text-primary" />
              <h2 className="font-display font-bold text-xl text-foreground">Plano {activePlan.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {subscribed
                ? `Ativo até ${new Date(subscriptionEnd!).toLocaleDateString("pt-BR")}`
                : "Plano gratuito — faça upgrade para desbloquear recursos avançados"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? "animate-spin mr-1" : "mr-1"} />
              Atualizar
            </Button>
            {subscribed && (
              <Button variant="outline" size="sm" onClick={handlePortal} disabled={loadingPortal}>
                {loadingPortal ? <Loader2 size={14} className="animate-spin mr-1" /> : <ExternalLink size={14} className="mr-1" />}
                Gerenciar no Stripe
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {planKeys.map((key) => {
          const plan = PLANS[key];
          const isCurrentPlan = (subscribed && currentPlan === key) || (!subscribed && key === "semente");

          return (
            <div
              key={key}
              className={`rounded-2xl p-6 border-2 transition-shadow ${
                isCurrentPlan ? "border-primary ring-2 ring-primary/20" : "border-border"
              } bg-card shadow-card`}
            >
              {isCurrentPlan && (
                <div className="text-xs font-bold text-primary bg-primary/10 rounded-full px-3 py-1 inline-flex items-center gap-1 mb-3">
                  <Crown size={12} /> Plano atual
                </div>
              )}
              <h3 className="font-display font-bold text-xl text-foreground">{plan.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{plan.sub}</p>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={14} className="text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <Button variant="outline" className="w-full" disabled>
                  Plano atual
                </Button>
              ) : plan.price_id ? (
                <Button
                  variant={plan.highlighted ? "hero" : "default"}
                  className="w-full"
                  disabled={loadingCheckout === key}
                  onClick={() => handleCheckout(key)}
                >
                  {loadingCheckout === key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {plan.cta}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Plano gratuito
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default AssinaturaPage;
