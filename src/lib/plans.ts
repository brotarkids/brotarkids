// Stripe product and price IDs for Brotar plans
export const PLANS = {
  semente: {
    name: "Semente",
    price: "Grátis",
    sub: "até 20 crianças",
    product_id: null,
    price_id: null,
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
  broto: {
    name: "Broto",
    price: "R$ 249",
    sub: "/mês • até 50 crianças",
    product_id: "prod_U5vtVxzvHeQhj4",
    price_id: "price_1T7k1H1OncDjeAF0wY97O1B6",
    features: [
      "Tudo do Semente",
      "IA preditiva de relatórios",
      "Cobranças Pix/boleto automáticas",
      "Cardápio com alertas de alergia",
      "Multi-turmas ilimitadas",
      "Suporte prioritário",
    ],
    cta: "Assinar Broto",
    highlighted: true,
  },
  floresta: {
    name: "Floresta",
    price: "R$ 999",
    sub: "/mês • até 200 crianças",
    product_id: "prod_U5wVt3heAhn26a",
    price_id: "price_1T7kc01OncDjeAF0DxaGDvju",
    features: [
      "Tudo do Broto",
      "Dashboard multi-unidades",
      "Analytics avançado",
      "API integrações (wearables)",
      "Onboarding dedicado",
      "SLA garantido",
    ],
    cta: "Assinar Floresta",
    highlighted: false,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanByProductId(productId: string | null): PlanKey | null {
  if (!productId) return null;
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.product_id === productId) return key as PlanKey;
  }
  return null;
}
