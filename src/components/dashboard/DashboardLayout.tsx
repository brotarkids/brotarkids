import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BrotarLogo from "@/components/BrotarLogo";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Bell } from "lucide-react";

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
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" asChild>
            <Link to="/">
              <LogOut size={16} />
              Sair
            </Link>
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
