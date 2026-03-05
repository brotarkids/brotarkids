import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Plus, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAIPedagogy } from "@/hooks/useAIPedagogy";
import { toast } from "sonner";

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

const PlanejamentoPage = () => {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [ageRange, setAgeRange] = useState("3-4 anos");
  const { suggestion, isLoading, error, generate, reset } = useAIPedagogy();

  const handleGenerate = async () => {
    const currentActivities = weekDays.map(d => `${d.day}: ${d.activity} (${d.bncc})`).join("\n");
    await generate({ ageRange, theme: theme || undefined, currentActivities });
    if (error) toast.error(error);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { reset(); setTheme(""); }
  };

  return (
    <DashboardLayout title="Planejamento" navItems={navItems} roleBadge="Professor(a)">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-foreground">Semana 03/03 – 07/03</h3>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Sparkles size={14} /> Sugerir com IA</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  Sugestões Pedagógicas com IA
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Faixa Etária</Label>
                    <Select value={ageRange} onValueChange={setAgeRange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1 anos">Berçário (0-1 ano)</SelectItem>
                        <SelectItem value="1-2 anos">Berçário II (1-2 anos)</SelectItem>
                        <SelectItem value="2-3 anos">Maternal I (2-3 anos)</SelectItem>
                        <SelectItem value="3-4 anos">Maternal II (3-4 anos)</SelectItem>
                        <SelectItem value="4-5 anos">Pré I (4-5 anos)</SelectItem>
                        <SelectItem value="5-6 anos">Pré II (5-6 anos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tema (opcional)</Label>
                    <Input
                      placeholder="Ex: Natureza, Cores, Família..."
                      value={theme}
                      onChange={e => setTheme(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                  {isLoading ? <><Loader2 size={14} className="animate-spin" /> Gerando sugestões...</> : <><Sparkles size={14} /> Gerar Sugestões</>}
                </Button>

                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">{error}</div>
                )}

                {suggestion && (
                  <div className="bg-muted/50 rounded-xl p-4 border border-border prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm text-foreground">{suggestion}</div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
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
};

export default PlanejamentoPage;
