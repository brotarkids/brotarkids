import BrotarLogo from "@/components/BrotarLogo";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <BrotarLogo size="sm" />
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              A plataforma brasileira para gestão completa de creches e escolas de educação infantil.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground mb-3">Produto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#beneficios" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="hover:text-foreground transition-colors">Preços</a></li>
              <li><Link to="/signup" className="hover:text-foreground transition-colors">Criar conta</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground mb-3">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Sobre nós</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">LGPD</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Brotar. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
