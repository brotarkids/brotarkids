import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrotarLogo from "@/components/BrotarLogo";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/">
          <BrotarLogo size="sm" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/checkin" className="hover:text-foreground transition-colors">Check-in</Link>
          <a href="#beneficios" className="hover:text-foreground transition-colors">Benefícios</a>
          <a href="#precos" className="hover:text-foreground transition-colors">Preços</a>
          <a href="#depoimentos" className="hover:text-foreground transition-colors">Depoimentos</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button variant="hero" size="default" asChild>
            <Link to="/signup">Experimente grátis</Link>
          </Button>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3 animate-fade-up">
          <Link to="/checkin" className="block py-2 text-muted-foreground" onClick={() => setOpen(false)}>Check-in</Link>
          <a href="#beneficios" className="block py-2 text-muted-foreground" onClick={() => setOpen(false)}>Benefícios</a>
          <a href="#precos" className="block py-2 text-muted-foreground" onClick={() => setOpen(false)}>Preços</a>
          <a href="#depoimentos" className="block py-2 text-muted-foreground" onClick={() => setOpen(false)}>Depoimentos</a>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button variant="hero" className="flex-1" asChild>
              <Link to="/signup">Grátis</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
