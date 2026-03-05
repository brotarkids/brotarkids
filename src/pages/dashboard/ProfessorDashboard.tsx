import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, Camera, ClipboardList, Smile, Moon, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Minha Turma", href: "/professor", icon: <LayoutDashboard size={18} /> },
  { label: "Registro Diário", href: "/professor/registro", icon: <ClipboardList size={18} /> },
  { label: "Planejamento", href: "/professor/planejamento", icon: <BookOpen size={18} /> },
  { label: "Frequência", href: "/professor/frequencia", icon: <CalendarCheck size={18} /> },
  { label: "Mensagens", href: "/professor/mensagens", icon: <MessageSquare size={18} /> },
];

const children = [
  { name: "Sofia", emoji: "😊", meal: true, nap: true, photo: false },
  { name: "Miguel", emoji: "😴", meal: true, nap: false, photo: false },
  { name: "Helena", emoji: "😄", meal: false, nap: false, photo: false },
  { name: "Arthur", emoji: "😢", meal: true, nap: true, photo: true },
  { name: "Laura", emoji: "😊", meal: true, nap: false, photo: false },
];

const ProfessorDashboard = () => {
  return (
    <DashboardLayout title="Maternal I" navItems={navItems} roleBadge="Professor(a)">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={<CalendarCheck size={18} />} label="Presentes" value="12/14" color="bg-success/40" />
        <StatCard icon={<ClipboardList size={18} />} label="Registros hoje" value="8" sub="de 14" color="bg-primary/15" />
        <StatCard icon={<MessageSquare size={18} />} label="Msgs pendentes" value="3" color="bg-accent/60" />
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-foreground">Registro do dia</h3>
          <Button variant="default" size="sm">
            <Camera size={14} />
            Foto da turma
          </Button>
        </div>

        <div className="space-y-3">
          {children.map((child) => (
            <div key={child.name} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/50 transition-colors border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">{child.emoji}</span>
                <span className="text-sm font-medium text-foreground">{child.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-1.5 rounded-lg text-xs ${child.meal ? "bg-success/40" : "bg-muted"}`}>
                  <Utensils size={14} />
                </button>
                <button className={`p-1.5 rounded-lg text-xs ${child.nap ? "bg-secondary/60" : "bg-muted"}`}>
                  <Moon size={14} />
                </button>
                <button className={`p-1.5 rounded-lg text-xs ${child.photo ? "bg-accent/60" : "bg-muted"}`}>
                  <Camera size={14} />
                </button>
                <button className="p-1.5 rounded-lg text-xs bg-muted">
                  <Smile size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-accent/30 rounded-2xl p-4 border border-accent/50">
        <div className="flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div>
            <h4 className="font-display font-bold text-sm text-foreground">Sugestão da IA</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Miguel e Arthur tiveram sono curto ontem. Considere uma atividade calma após o almoço, como leitura ou massinha.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfessorDashboard;
