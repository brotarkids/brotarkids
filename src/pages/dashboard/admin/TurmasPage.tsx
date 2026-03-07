import { useState, useEffect } from "react";
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

import { adminNavItems } from "@/config/navigation";

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
    teacher_id: "",
  });

  const [editingClass, setEditingClass] = useState<any>(null);

  const [teachers, setTeachers] = useState<any[]>([]);

  // Fetch classes
  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes", profile?.school_id],
    queryFn: async () => {
      let query = supabase.from("classes").select("*, schools(name)");

      if (profile?.school_id) {
        query = query.eq("school_id", profile.school_id);
      }
      query = query.order("name");

      const { data, error } = await query;
      if (error) throw error;

      // Fetch teacher names separately
      if (data && data.length > 0) {
        const teacherIds = [...new Set(data.filter(c => c.teacher_id).map(c => c.teacher_id))];
        if (teacherIds.length > 0) {
          const { data: teacherProfiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", teacherIds);
          const teacherMap = Object.fromEntries((teacherProfiles || []).map(t => [t.user_id, t.full_name]));
          return data.map(c => ({ ...c, teacher_name: c.teacher_id ? teacherMap[c.teacher_id] || null : null }));
        }
      }
      return (data || []).map(c => ({ ...c, teacher_name: null }));
    },
    enabled: !!profile,
  });

    // Fetch teachers
    useEffect(() => {
    const fetchTeachers = async () => {
      if (!profile?.school_id) return;
      try {
        // Fetch profiles in the school
        const { data: schoolProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .eq('school_id', profile.school_id);
        
        if (profilesError) throw profilesError;
        if (!schoolProfiles || schoolProfiles.length === 0) {
          setTeachers([]);
          return;
        }

        const userIds = schoolProfiles.map(p => p.user_id);

        // Fetch roles for these users to filter professors
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds)
          .eq('role', 'professor');

        if (rolesError) throw rolesError;

        // Filter profiles that have the professor role
        const professorIds = new Set((rolesData || []).map(r => r.user_id));
        const schoolTeachers = schoolProfiles
          .filter(p => professorIds.has(p.user_id))
          .map(p => ({
             ...p,
             role: 'professor',
             school_id: profile.school_id
          }));

        setTeachers(schoolTeachers || []);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    fetchTeachers();
  }, [profile?.school_id]);

  // Create/Update class mutation
  const saveClassMutation = useMutation({
    mutationFn: async (classData: typeof newClass & { id?: string }) => {
      const payload = {
        name: classData.name,
        age_range: classData.age_range,
        period: classData.period,
        capacity: parseInt(classData.capacity),
        teacher_id: (classData.teacher_id && classData.teacher_id !== "_empty") ? classData.teacher_id : null
      };

      if (classData.id) {
        // Update
        return await supabase.from("classes").update(payload).eq("id", classData.id);
      } else {
        // Create
        let schoolId = profile?.school_id;
        if (!schoolId) {
          const { data: schools } = await supabase.from("schools").select("id").limit(1);
          if (schools && schools.length > 0) schoolId = schools[0].id;
          else throw new Error("Nenhuma escola vinculada.");
        }
        return await supabase.from("classes").insert([{ ...payload, school_id: schoolId }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setIsCreateOpen(false);
      setEditingClass(null);
      setNewClass({ name: "", age_range: "", period: "", capacity: "20", teacher_id: "" });
      toast({ title: "Sucesso", description: "Turma salva com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      return await supabase.from("classes").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({ title: "Sucesso", description: "Turma excluída." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!newClass.name || !newClass.period) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome e período.", variant: "destructive" });
      return;
    }
    saveClassMutation.mutate({ ...newClass, id: editingClass?.id });
  };

  const openEdit = (cls: any) => {
    setEditingClass(cls);
    setNewClass({
        name: cls.name,
        age_range: cls.age_range || "",
        period: cls.period || "",
        capacity: String(cls.capacity || "20"),
        teacher_id: cls.teacher_id || "_empty",
      });
      setIsCreateOpen(true);
    };
  
    const openCreate = () => {
      setEditingClass(null);
      setNewClass({ name: "", age_range: "", period: "", capacity: "20", teacher_id: "_empty" });
      setIsCreateOpen(true);
    };

  return (
    <DashboardLayout title="Turmas" navItems={adminNavItems} roleBadge="Diretor(a)">
      <div className="flex justify-end mb-6">
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if(!open) setEditingClass(null); }}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" onClick={openCreate}><Plus size={16} /> Nova Turma</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClass ? "Editar Turma" : "Nova Turma"}</DialogTitle>
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
              <div className="grid gap-2">
                <Label htmlFor="teacher">Professor Responsável</Label>
                <Select 
                  value={newClass.teacher_id} 
                  onValueChange={(value) => setNewClass({...newClass, teacher_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um professor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_empty">Sem professor</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.user_id} value={t.user_id}>{t.full_name || t.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saveClassMutation.isPending}>
                {saveClassMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                <div className="flex justify-between"><span className="text-muted-foreground">Professor(a)</span><span className="text-foreground">{t.teacher_name || "Não atribuído"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Faixa etária</span><span className="text-foreground">{t.age_range || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Capacidade</span><span className="text-foreground font-medium">{t.capacity}</span></div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(t)}>Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => {
                  if (confirm("Tem certeza que deseja excluir esta turma?")) deleteClassMutation.mutate(t.id);
                }}>Excluir</Button>
              </div>
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
