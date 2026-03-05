import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Minha Turma", href: "/professor", icon: <LayoutDashboard size={18} /> },
  { label: "Registro Diário", href: "/professor/registro", icon: <ClipboardList size={18} /> },
  { label: "Planejamento", href: "/professor/planejamento", icon: <BookOpen size={18} /> },
  { label: "Frequência", href: "/professor/frequencia", icon: <CalendarCheck size={18} /> },
  { label: "Mensagens", href: "/professor/mensagens", icon: <MessageSquare size={18} /> },
];

const weekDays = [
  { day: "Seg", date: "03/03", activity: "Roda de leitura + pintura", bncc: "EI03EF01" },
  { day: "Ter", date: "04/03", activity: "Música e movimento", bncc: "EI03CG01" },
  { day: "Qua", date: "05/03", activity: "Natureza: plantio de feijão", bncc: "EI03ET01" },
  { day: "Qui", date: "06/03", activity: "Massinha e formas geométricas", bncc: "EI03ET05" },
  { day: "Sex", date: "07/03", activity: "Brincadeira livre + teatro", bncc: "EI03EO03" },
];

const PlanejamentoPage = () => (
  <DashboardLayout title="Planejamento" navItems={navItems} roleBadge="Professor(a)">
    <div className="flex items-center justify-between mb-6">
      <h3 className="font-display font-bold text-foreground">Semana 03/03 – 07/03</h3>
      <div className="flex gap-2">
        <Button variant="outline" size="sm"><Sparkles size={14} /> Sugerir com IA</Button>
        <Button variant="default" size="sm"><Plus size={14} /> Nova atividade</Button>
      </div>
    </div>

    <div className="space-y-3">
      {weekDays.map((d) => (
        <div key={d.day} className="bg-card rounded-2xl p-4 shadow-card border border-border flex items-center gap-4">
          <div className="text-center min-w-[48px]">
            <span className="block text-xs text-muted-foreground">{d.day}</span>
            <span className="block text-sm font-bold text-foreground">{d.date}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{d.activity}</p>
            <span className="text-xs text-muted-foreground">BNCC: {d.bncc}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">Editar</Button>
        </div>
      ))}
    </div>
  </DashboardLayout>
);

export default PlanejamentoPage;
