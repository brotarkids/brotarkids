import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrotarLogo from "@/components/BrotarLogo";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Bell, Shield, Users, User, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = user?.email === 'brotarkids@gmail.com';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <BrotarLogo size="sm" />
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
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
              onClick={() => setSidebarOpen(false)}
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
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <h1 className="font-display font-bold text-lg text-foreground truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Trocar Painel
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acessar como:</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { console.log('Navigating to superadmin'); navigate("/superadmin"); }}>
                    <Shield className="mr-2 h-4 w-4" /> Super Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { console.log('Navigating to admin'); navigate("/admin"); }}>
                    <Users className="mr-2 h-4 w-4" /> Admin da Escola
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { console.log('Navigating to professor'); navigate("/professor"); }}>
                    <GraduationCap className="mr-2 h-4 w-4" /> Professor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { console.log('Navigating to responsavel'); navigate("/responsavel"); }}>
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
