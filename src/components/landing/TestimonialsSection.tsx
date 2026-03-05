import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ana Paula S.",
    role: "Diretora, Creche Raio de Sol – SP",
    text: "O Brotar transformou nossa comunicação com os pais. Antes eram 15 grupos de WhatsApp, agora tudo está em um lugar só. A inadimplência caiu 40%!",
  },
  {
    name: "Carlos M.",
    role: "Pai de Miguel, 3 anos",
    text: "Receber fotos e atualizações em tempo real durante o dia de trabalho me deixa muito mais tranquilo. O app é intuitivo e bonito.",
  },
  {
    name: "Professora Lúcia",
    role: "Educadora, Escola Pequeno Mundo – RJ",
    text: "Registro o dia das crianças em minutos. As sugestões de atividades baseadas no humor e sono são incríveis, nunca vi nada igual.",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Quem usa, recomenda
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card rounded-2xl p-6 shadow-card border border-border">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <div className="font-display font-bold text-sm text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
