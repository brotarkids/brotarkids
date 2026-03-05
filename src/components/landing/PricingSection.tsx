import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Semente",
    price: "Grátis",
    sub: "até 20 crianças",
    features: [
      "Registro diário completo",
      "Chat com pais",
      "Check-in/out com QR",
      "Relatórios básicos",
      "1 creche",
    ],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    name: "Broto",
    price: "R$ 7",
    sub: "por criança/mês",
    features: [
      "Tudo do Semente",
      "IA preditiva de relatórios",
      "Cobranças Pix/boleto automáticas",
      "Cardápio com alertas de alergia",
      "Multi-turmas ilimitadas",
      "Suporte prioritário",
    ],
    cta: "Teste 14 dias grátis",
    highlighted: true,
  },
  {
    name: "Floresta",
    price: "Sob consulta",
    sub: "multi-creches",
    features: [
      "Tudo do Broto",
      "Dashboard multi-unidades",
      "Analytics avançado",
      "API integrações (wearables)",
      "Onboarding dedicado",
      "SLA garantido",
    ],
    cta: "Falar com vendas",
    highlighted: false,
  },
];

const PricingSection = () => {
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
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border-2 transition-shadow duration-300 ${
                plan.highlighted
                  ? "border-primary bg-card shadow-elevated scale-[1.02]"
                  : "border-border bg-card shadow-card"
              }`}
            >
              {plan.highlighted && (
                <div className="gradient-sprout text-primary-foreground text-xs font-bold rounded-full px-3 py-1 inline-block mb-3">
                  Mais popular
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
                asChild
              >
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
