import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrotarLogo from "@/components/BrotarLogo";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Shield, Users, User, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
  roleBadge: string;
}

const DashboardLayout = ({ children, title, navItems, roleBadge }: DashboardLayoutProps) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const isSuperAdmin = user?.email === 'brotarkids@gmail.com';

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BrotarLogo size="sm" />
            <span className="text-xs font-bold font-display px-2 py-0.5 rounded-full bg-primary/20 text-primary-foreground/80">{roleBadge}</span>
          </div>
          <div className="flex items-center gap-1">
            {isSuperAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Shield className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acessar como:</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/superadmin")}>
                    <Shield className="mr-2 h-4 w-4" /> Super Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Users className="mr-2 h-4 w-4" /> Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/professor")}>
                    <GraduationCap className="mr-2 h-4 w-4" /> Professor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/responsavel")}>
                    <User className="mr-2 h-4 w-4" /> Responsável
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut size={16} />
            </Button>
          </div>
        </header>

        {/* Page title */}
        <div className="px-4 pt-3 pb-1">
          <h1 className="font-display font-bold text-lg text-foreground">{title}</h1>
        </div>

        {/* Main content — extra bottom padding for the nav bar */}
        <main className="flex-1 p-4 overflow-auto pb-24">
          {children}
        </main>

        {/* Bottom navigation bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
          <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
            {navItems.slice(0, 5).map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 text-[10px] font-medium transition-colors relative ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                  )}
                  <span className={`transition-transform ${active ? "scale-110" : ""}`}>
                    {item.icon}
                  </span>
                  <span className="truncate max-w-[56px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <BrotarLogo size="sm" />
        </div>

        <div className="px-3 py-2">
          <span className="inline-block text-xs font-bold font-display px-2 py-1 rounded-full bg-primary/20 text-primary-foreground/80">{roleBadge}</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border h-14 flex items-center justify-between px-4">
          <h1 className="font-display font-bold text-lg text-foreground truncate">{title}</h1>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Trocar Painel
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acessar como:</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/superadmin")}>
                    <Shield className="mr-2 h-4 w-4" /> Super Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Users className="mr-2 h-4 w-4" /> Admin da Escola
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/professor")}>
                    <GraduationCap className="mr-2 h-4 w-4" /> Professor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/responsavel")}>
                    <User className="mr-2 h-4 w-4" /> Responsável
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
