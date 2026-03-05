import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Utensils, Moon, Camera, Smile, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Minha Turma", href: "/professor", icon: <LayoutDashboard size={18} /> },
  { label: "Registro Diário", href: "/professor/registro", icon: <ClipboardList size={18} /> },
  { label: "Planejamento", href: "/professor/planejamento", icon: <BookOpen size={18} /> },
  { label: "Frequência", href: "/professor/frequencia", icon: <CalendarCheck size={18} /> },
  { label: "Mensagens", href: "/professor/mensagens", icon: <MessageSquare size={18} /> },
];

const children = [
  { name: "Sofia Oliveira", emoji: "👧" },
  { name: "Miguel Santos", emoji: "👦" },
  { name: "Helena Lima", emoji: "👧" },
  { name: "Arthur Souza", emoji: "👦" },
  { name: "Laura Pereira", emoji: "👧" },
];

const RegistroDiarioPage = () => (
  <DashboardLayout title="Registro Diário" navItems={navItems} roleBadge="Professor(a)">
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground">5 de março, 2026 – Maternal I</h3>
        <Button variant="default" size="sm"><Save size={14} /> Salvar tudo</Button>
      </div>

      <div className="space-y-4">
        {children.map((child) => (
          <div key={child.name} className="p-4 rounded-xl border border-border bg-background">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{child.emoji}</span>
              <span className="font-medium text-foreground">{child.name}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted hover:bg-success/20 transition-colors">
                <Utensils size={18} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Refeição</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted hover:bg-secondary/40 transition-colors">
                <Moon size={18} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Soneca</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted hover:bg-accent/40 transition-colors">
                <Camera size={18} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Foto</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted hover:bg-primary/15 transition-colors">
                <Smile size={18} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Humor</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default RegistroDiarioPage;
