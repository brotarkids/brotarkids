import { MessageSquare, Brain, CreditCard, Camera, CalendarCheck, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: MessageSquare,
    title: "Comunicação em tempo real",
    description: "Chat direto entre pais e educadores. Fotos, vídeos e atualizações do dia a dia da criança.",
    color: "bg-secondary",
  },
  {
    icon: Brain,
    title: "Relatórios preditivos com IA",
    description: "Análise de padrões de sono, humor e alimentação para sugestões proativas de atividades.",
    color: "bg-accent",
  },
  {
    icon: CreditCard,
    title: "Gestão financeira fácil",
    description: "Cobranças automáticas via Pix e boleto, lembretes de inadimplência e relatórios financeiros.",
    color: "bg-success",
  },
  {
    icon: Camera,
    title: "Registro diário completo",
    description: "Refeições, sonecas, atividades, humor — tudo registrado com fotos e compartilhado com os pais.",
    color: "bg-primary/30",
  },
  {
    icon: CalendarCheck,
    title: "Frequência inteligente",
    description: "Check-in e check-out com QR Code. Controle automático de presença e alertas de ausência.",
    color: "bg-warning/30",
  },
  {
    icon: ShieldCheck,
    title: "Privacidade LGPD",
    description: "Consentimentos explícitos para fotos, logs de acesso e dados protegidos conforme a lei brasileira.",
    color: "bg-secondary/60",
  },
];

const BenefitsSection = () => {
  return (
    <section id="beneficios" className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Tudo que sua creche precisa
          </h2>
          <p className="text-muted-foreground text-lg">
            Substituímos agendas de papel, planilhas e grupos de WhatsApp por uma plataforma unificada e intuitiva.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow duration-300"
            >
              <div className={`${b.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <b.icon size={22} className="text-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
