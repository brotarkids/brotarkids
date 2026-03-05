import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Check, X } from "lucide-react";

const navItems = [
  { label: "Minha Turma", href: "/professor", icon: <LayoutDashboard size={18} /> },
  { label: "Registro Diário", href: "/professor/registro", icon: <ClipboardList size={18} /> },
  { label: "Planejamento", href: "/professor/planejamento", icon: <BookOpen size={18} /> },
  { label: "Frequência", href: "/professor/frequencia", icon: <CalendarCheck size={18} /> },
  { label: "Mensagens", href: "/professor/mensagens", icon: <MessageSquare size={18} /> },
];

const children = [
  { name: "Sofia Oliveira", present: true },
  { name: "Miguel Santos", present: true },
  { name: "Helena Lima", present: false },
  { name: "Arthur Souza", present: true },
  { name: "Laura Pereira", present: true },
  { name: "Pedro Costa", present: false },
];

const FrequenciaPage = () => (
  <DashboardLayout title="Frequência" navItems={navItems} roleBadge="Professor(a)">
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground">Quarta, 5 de março</h3>
        <span className="text-sm text-muted-foreground">{children.filter(c => c.present).length}/{children.length} presentes</span>
      </div>

      <div className="space-y-2">
        {children.map((child) => (
          <div key={child.name} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/50 transition-colors">
            <span className="text-sm font-medium text-foreground">{child.name}</span>
            <button className={`p-2 rounded-xl transition-colors ${child.present ? "bg-success/40" : "bg-destructive/20"}`}>
              {child.present ? <Check size={16} className="text-success-foreground" /> : <X size={16} className="text-destructive" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default FrequenciaPage;
