import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Plus, Sparkles, Loader2, Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAIPedagogy } from "@/hooks/useAIPedagogy";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { professorNavItems } from "@/config/navigation";

const getWeekRange = (refDate: Date) => {
  const d = new Date(refDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return { start: monday.toISOString().split("T")[0], end: friday.toISOString().split("T")[0], monday };
};

const statusColors: Record<string, string> = {
  planned: "bg-secondary/50 text-secondary-foreground",
  done: "bg-success/40 text-success-foreground",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = { planned: "Planejado", done: "Concluído", cancelled: "Cancelado" };

const PlanejamentoPage = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekRef, setWeekRef] = useState(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bnccCode, setBnccCode] = useState("");
  const [plannedDate, setPlannedDate] = useState("");
  const [status, setStatus] = useState("planned");

  // AI
  const [theme, setTheme] = useState("");
  const [ageRange, setAgeRange] = useState("3-4 anos");
  const { suggestion, isLoading: aiLoading, error: aiError, generate, reset: aiReset } = useAIPedagogy();

  const week = getWeekRange(weekRef);

  const loadPlans = async (classId: string) => {
    const { data } = await supabase
      .from("lesson_plans" as any)
      .select("*")
      .eq("class_id", classId)
      .gte("planned_date", week.start)
      .lte("planned_date", week.end)
      .order("planned_date");
    setPlans(data || []);
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: classesData } = await supabase.from("classes").select("*").eq("teacher_id", user.id);
      setClasses(classesData || []);
      if (classesData && classesData.length > 0) {
        setSelectedClassId(classesData[0].id);
        await loadPlans(classesData[0].id);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (selectedClassId) loadPlans(selectedClassId);
  }, [weekRef, selectedClassId]);

  const resetForm = () => {
    setTitle(""); setDescription(""); setBnccCode(""); setPlannedDate(""); setStatus("planned"); setEditingPlan(null);
  };

  const openCreate = () => { resetForm(); setPlannedDate(week.start); setDialogOpen(true); };
  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    setTitle(plan.title); setDescription(plan.description || ""); setBnccCode(plan.bncc_code || ""); setPlannedDate(plan.planned_date); setStatus(plan.status);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !selectedClassId || !title.trim() || !plannedDate) return;
    setSaving(true);
    const payload = {
      class_id: selectedClassId,
      teacher_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      bncc_code: bnccCode.trim() || null,
      planned_date: plannedDate,
      status,
    };

    let error;
    if (editingPlan) {
      ({ error } = await supabase.from("lesson_plans" as any).update(payload).eq("id", editingPlan.id));
    } else {
      ({ error } = await supabase.from("lesson_plans" as any).insert([payload]));
    }

    if (error) { toast.error("Erro ao salvar plano"); console.error(error); }
    else { toast.success(editingPlan ? "Plano atualizado!" : "Plano criado!"); setDialogOpen(false); resetForm(); await loadPlans(selectedClassId); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!selectedClassId) return;
    const { error } = await supabase.from("lesson_plans" as any).delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Plano excluído"); await loadPlans(selectedClassId); }
  };

  const handleToggleStatus = async (plan: any) => {
    const next = plan.status === "done" ? "planned" : "done";
    await supabase.from("lesson_plans" as any).update({ status: next }).eq("id", plan.id);
    if (selectedClassId) await loadPlans(selectedClassId);
  };

  const changeWeek = (dir: number) => {
    setWeekRef(prev => { const d = new Date(prev); d.setDate(d.getDate() + dir * 7); return d; });
  };

  const handleGenerate = async () => {
    const currentActivities = plans.map(p => `${p.planned_date}: ${p.title} (${p.bncc_code || "sem código"})`).join("\n");
    await generate({ ageRange, theme: theme || undefined, currentActivities: currentActivities || undefined });
    if (aiError) toast.error(aiError);
  };

  const weekLabel = `${new Date(week.start + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} – ${new Date(week.end + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;

  // Group by date
  const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex"];
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(week.monday);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    return { dayName: dayNames[i], date: dateStr, dateLabel: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), plans: plans.filter(p => p.planned_date === dateStr) };
  });

  if (loading) {
    return (
      <DashboardLayout title="Planejamento Pedagógico" navItems={professorNavItems} roleBadge="Professor(a)">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (classes.length === 0) {
    return (
      <DashboardLayout title="Planejamento Pedagógico" navItems={professorNavItems} roleBadge="Professor(a)">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma turma atribuída a você ainda.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Planejamento Pedagógico" navItems={professorNavItems} roleBadge="Professor(a)">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {classes.length > 1 ? (
            <Select value={selectedClassId || ""} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <h2 className="text-lg font-bold mr-2">{classes[0]?.name}</h2>
          )}

          <Button variant="ghost" size="icon" onClick={() => changeWeek(-1)}><ChevronLeft size={18} /></Button>
          <h3 className="font-display font-bold text-foreground text-sm sm:text-base">Semana {weekLabel}</h3>
          <Button variant="ghost" size="icon" onClick={() => changeWeek(1)}><ChevronRight size={18} /></Button>
        </div>
        <div className="flex gap-2">
          <Dialog open={aiOpen} onOpenChange={(o) => { setAiOpen(o); if (!o) { aiReset(); setTheme(""); } }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Sparkles size={14} /> Sugerir com IA</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles size={18} className="text-primary" />Sugestões Pedagógicas com IA</DialogTitle></DialogHeader>
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
                    <Input placeholder="Ex: Natureza, Cores, Família..." value={theme} onChange={e => setTheme(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleGenerate} disabled={aiLoading} className="w-full">
                  {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Gerando...</> : <><Sparkles size={14} /> Gerar Sugestões</>}
                </Button>
                {aiError && <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">{aiError}</div>}
                {suggestion && (
                  <div className="bg-muted/50 rounded-xl p-4 border border-border">
                    <div className="whitespace-pre-wrap text-sm text-foreground">{suggestion}</div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="default" size="sm" onClick={openCreate}><Plus size={14} /> Nova atividade</Button>
        </div>
      </div>

      {/* Week grid */}
      <div className="space-y-3">
        {weekDays.map((wd) => (
          <div key={wd.date} className="bg-card rounded-2xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-center min-w-[48px]">
                <span className="block text-xs text-muted-foreground">{wd.dayName}</span>
                <span className="block text-sm font-bold text-foreground">{wd.dateLabel}</span>
              </div>
              <div className="flex-1">
                {wd.plans.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Sem atividade planejada</p>
                ) : (
                  <div className="space-y-2">
                    {wd.plans.map(plan => (
                      <div key={plan.id} className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => handleToggleStatus(plan)} className="text-sm font-medium text-foreground hover:underline text-left">
                              {plan.title}
                            </button>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[plan.status] || "bg-muted"}`}>
                              {statusLabels[plan.status] || plan.status}
                            </span>
                          </div>
                          {plan.bncc_code && <span className="text-xs text-muted-foreground">BNCC: {plan.bncc_code}</span>}
                          {plan.description && <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(plan)}><Edit2 size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(plan.id)}><Trash2 size={14} /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingPlan ? "Editar Atividade" : "Nova Atividade"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Roda de leitura" />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes da atividade..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Código BNCC</Label>
                <Input value={bnccCode} onChange={e => setBnccCode(e.target.value)} placeholder="Ex: EI03EF01" />
              </div>
              <div className="space-y-1.5">
                <Label>Data *</Label>
                <Input type="date" value={plannedDate} onChange={e => setPlannedDate(e.target.value)} />
              </div>
            </div>
            {editingPlan && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planejado</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim() || !plannedDate}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {editingPlan ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PlanejamentoPage;
