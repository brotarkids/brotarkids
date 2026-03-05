import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast"; // Corrigir import se necessário
import { useUserProfile } from "@/hooks/useUserProfile"; // Criar esse hook se não existir ou importar de onde estiver

const navItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

const TurmasPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile } = useUserProfile();

  // Form state
  const [newClass, setNewClass] = useState({
    name: "",
    age_range: "",
    period: "",
    capacity: "20",
  });

  // Fetch classes
  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes", profile?.school_id],
    queryFn: async () => {
      // Se for superadmin e não tiver escola, busca todas? 
      // Por enquanto vamos focar na escola do usuário ou todas se for superadmin sem escola
      let query = supabase.from("classes").select(`
        *,
        schools (name)
      `);

      if (profile?.school_id) {
        query = query.eq("school_id", profile.school_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true, // Sempre tenta buscar, RLS vai filtrar
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: typeof newClass) => {
      if (!profile?.school_id) {
        // Fallback for superadmin creating without school_id attached to profile
        // In a real app, superadmin would select the school first.
        // For now, let's try to find the first school or fail
        const { data: schools } = await supabase.from("schools").select("id").limit(1);
        if (schools && schools.length > 0) {
           // Use first school found if user has no school
           return await supabase.from("classes").insert([{
             ...classData,
             school_id: schools[0].id,
             capacity: parseInt(classData.capacity)
           }]);
        }
        throw new Error("Nenhuma escola vinculada ao usuário para criar turma.");
      }

      return await supabase.from("classes").insert([{
        ...classData,
        school_id: profile.school_id,
        capacity: parseInt(classData.capacity)
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setIsCreateOpen(false);
      setNewClass({ name: "", age_range: "", period: "", capacity: "20" });
      toast({
        title: "Turma criada",
        description: "A turma foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar turma",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!newClass.name || !newClass.period) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e período.",
        variant: "destructive",
      });
      return;
    }
    createClassMutation.mutate(newClass);
  };

  return (
    <DashboardLayout title="Turmas" navItems={navItems} roleBadge="Diretor(a)">
      <div className="flex justify-end mb-6">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm"><Plus size={16} /> Nova Turma</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Turma</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Turma</Label>
                <Input 
                  id="name" 
                  value={newClass.name} 
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  placeholder="Ex: Maternal I" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">Faixa Etária</Label>
                <Input 
                  id="age" 
                  value={newClass.age_range} 
                  onChange={(e) => setNewClass({...newClass, age_range: e.target.value})}
                  placeholder="Ex: 2-3 anos" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period">Período</Label>
                <Select 
                  value={newClass.period} 
                  onValueChange={(value) => setNewClass({...newClass, period: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Integral">Integral</SelectItem>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  value={newClass.capacity} 
                  onChange={(e) => setNewClass({...newClass, capacity: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={createClassMutation.isPending}>
                {createClassMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {classes?.map((t: any) => (
            <div key={t.id} className="bg-card rounded-2xl p-5 shadow-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-foreground">{t.name}</h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground">{t.period}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Escola</span><span className="text-foreground">{t.schools?.name || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Professor(a)</span><span className="text-foreground">{t.teacher_id ? "Definido" : "Não atribuído"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Faixa etária</span><span className="text-foreground">{t.age_range || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Capacidade</span><span className="text-foreground font-medium">{t.capacity}</span></div>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full text-primary">Ver detalhes</Button>
            </div>
          ))}
          {classes?.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Nenhuma turma encontrada. Crie uma nova turma para começar.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TurmasPage;
