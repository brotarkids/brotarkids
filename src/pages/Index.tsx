import { Helmet } from "react-helmet-async";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Brotar – Gestão inteligente para creches e educação infantil</title>
        <meta name="description" content="Plataforma completa para creches e escolas de educação infantil no Brasil. Registro diário, comunicação com pais, financeiro, relatórios com IA e muito mais." />
        <meta name="keywords" content="app creche Brasil, acompanhamento infantil, gestão creche, educação infantil, agenda digital creche" />
        <link rel="canonical" href="https://brotar.app" />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <BenefitsSection />
          <TestimonialsSection />
          <PricingSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
