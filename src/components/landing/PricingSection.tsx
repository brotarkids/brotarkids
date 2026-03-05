import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Crown } from "lucide-react";
import { PLANS, PlanKey } from "@/lib/plans";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const planKeys: PlanKey[] = ["semente", "broto", "floresta"];

const PricingSection = () => {
  const { user, subscribed, plan: currentPlan } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planKey: PlanKey) => {
    const plan = PLANS[planKey];

    if (!plan.price_id) {
      // Free plan — just go to signup or dashboard
      if (user) {
        navigate("/admin");
      } else {
        navigate("/signup");
      }
      return;
    }

    if (!user) {
      navigate("/signup");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: plan.price_id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="precos" className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Planos que crescem com você
          </h2>
          <p className="text-muted-foreground text-lg">
            Comece grátis e escale conforme sua creche cresce.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {planKeys.map((key) => {
            const plan = PLANS[key];
            const isCurrentPlan = subscribed && currentPlan === key;
            const isFreeAndNoPlan = key === "semente" && !subscribed;

            return (
              <div
                key={key}
                className={`rounded-2xl p-6 border-2 transition-shadow duration-300 relative ${
                  plan.highlighted
                    ? "border-primary bg-card shadow-elevated scale-[1.02]"
                    : "border-border bg-card shadow-card"
                } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
              >
                {plan.highlighted && (
                  <div className="gradient-sprout text-primary-foreground text-xs font-bold rounded-full px-3 py-1 inline-block mb-3">
                    Mais popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 rounded-full px-2 py-1">
                    <Crown size={12} /> Seu plano
                  </div>
                )}
                <h3 className="font-display font-bold text-xl text-foreground">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.sub}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check size={16} className="text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "hero" : "outline"}
                  className="w-full"
                  disabled={isCurrentPlan || loadingPlan === key}
                  onClick={() => handleSubscribe(key)}
                >
                  {loadingPlan === key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCurrentPlan ? "Plano atual" : isFreeAndNoPlan && user ? "Plano atual" : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
