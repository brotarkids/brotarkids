import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";
import heroImage from "@/assets/hero-children.jpg";

const HeroSection = () => {
  return (
    <section className="gradient-hero overflow-hidden">
      <div className="container py-12 md:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-success/50 px-4 py-1.5 text-sm font-medium text-success-foreground">
              <Zap size={14} />
              Novo: Relatórios com IA preditiva
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-display leading-tight text-foreground">
              Acompanhe o crescimento dos seus{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #98E5A1, #B9FBC0)' }}>
                pequenos
              </span>{" "}
              em tempo real
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              A plataforma completa para creches e escolas de educação infantil.
              Registro diário, comunicação com pais, financeiro e muito mais — tudo em um só lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Experimente grátis
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="#beneficios">Ver funcionalidades</Link>
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-primary" />
                LGPD Compliant
              </div>
              <span>•</span>
              <span>Grátis até 20 crianças</span>
              <span>•</span>
              <span>Setup em 5 min</span>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="rounded-2xl overflow-hidden shadow-elevated border border-border">
              <img
                src={heroImage}
                alt="Crianças brincando e aprendendo juntas em ambiente natural"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-elevated p-3 border border-border animate-float">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center text-success-foreground font-bold text-xs">✓</div>
                <div>
                  <div className="font-semibold text-foreground text-xs">Check-in realizado</div>
                  <div className="text-muted-foreground text-xs">Maria chegou às 7:45</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
