import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, Search, Plus, MoreVertical, Loader2, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { adminNavItems, professorNavItems } from "@/config/navigation";

const CriancasPage = () => {
  const { data: profile } = useUserProfile();
  const { role } = useAuth();
  const location = useLocation();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");

  const isSuperadmin = role === 'superadmin';

  // Robust check for professor context based on route or profile
  const isProfessorRoute = location.pathname.includes('/professor');
  const isProfessor = role === 'professor' || isProfessorRoute;
  
  const navItems = isProfessor ? professorNavItems : adminNavItems;
  const roleBadge = isProfessor ? "Professor(a)" : (isSuperadmin ? "Superadmin" : "Admin");

  // Effective school_id: from profile or superadmin selection
  const effectiveSchoolId = profile?.school_id || selectedSchoolId || null;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    birth_date: "",
    class_id: "",
    parent_id: "",
    parent_email: "",
    parent_phone: "",
    status: "active"
  });
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const [isInviting, setIsInviting] = useState(false);

  const loadData = async () => {
    if (!effectiveSchoolId) {
      // Superadmin without school selected: load schools list
      if (isSuperadmin) {
        const { data: schoolsData } = await supabase.from("schools").select("id, name").order("name");
        setSchools(schoolsData || []);
        setLoading(false);
      }
      return;
    }
    
    setLoading(true);
    
    // Load classes first (needed for filtering students if professor)
    let classesQuery = supabase
      .from("classes")
      .select("id, name, teacher_id")
      .eq("school_id", effectiveSchoolId)
      .order("name");
      
    if (isProfessor) {
      classesQuery = classesQuery.eq("teacher_id", profile.user_id);
    }
    
    const { data: classesData, error: classesError } = await classesQuery;

    if (classesError) {
      console.error(classesError);
      setClasses([]);
    } else {
      setClasses(classesData || []);
    }
    
    // Load students
    let studentsQuery = supabase
      .from("students")
      .select("*, classes(name), profiles:parent_id(full_name)")
      .eq("school_id", effectiveSchoolId)
      .order("name");

    if (isProfessor && classesData) {
      const classIds = classesData.map((c: any) => c.id);
      if (classIds.length > 0) {
        studentsQuery = studentsQuery.in("class_id", classIds);
      } else {
        // Professor has no classes, so no students
        studentsQuery = studentsQuery.eq("id", "00000000-0000-0000-0000-000000000000"); // Force empty
      }
    }
    
    const { data: studentsData, error: studentsError } = await studentsQuery;
    
    if (studentsError) {
      toast.error("Erro ao carregar alunos");
      console.error(studentsError);
    } else {
      setStudents(studentsData || []);
    }

    // Load potential parents (profiles)
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, school_id")
      .eq("school_id", effectiveSchoolId)
      .order("full_name");

    if (profilesError) {
      console.error(profilesError);
    } else {
      setParents(profilesData || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (profile) loadData();
  }, [profile, isProfessor, effectiveSchoolId]);

  const handleOpenDialog = (student?: any) => {
    setIsInviting(false);
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        birth_date: student.birth_date,
        class_id: student.class_id || "_empty",
        parent_id: student.parent_id || "_empty",
        parent_email: "",
        parent_phone: "",
        status: student.status || "active"
      });
    } else {
      setEditingStudent(null);
      // Auto-select class if professor has only one
      let defaultClassId = "";
      if (isProfessor && classes.length === 1) {
        defaultClassId = classes[0].id;
      }
      setFormData({ name: "", birth_date: "", class_id: defaultClassId, parent_id: "", parent_email: "", parent_phone: "", status: "active" });
    }
    setInviteLink(null);
    setIsDialogOpen(true);
  };

  const handleSaveStudent = async () => {
    if (!effectiveSchoolId) {
      toast.error("Selecione uma escola para matricular alunos.");
      return;
    }
    if (!formData.name || !formData.birth_date) {
      toast.error("Nome e data de nascimento são obrigatórios");
      return;
    }

    setSaving(true);
    
    // Resolve parent_id or invite
    let finalParentId = (formData.parent_id && formData.parent_id !== "_empty" && !isInviting) ? formData.parent_id : null;
    let inviteSent = false;

    const payload = {
      school_id: effectiveSchoolId,
      name: formData.name,
      birth_date: formData.birth_date,
      class_id: (formData.class_id && formData.class_id !== "_empty") ? formData.class_id : null,
      parent_id: finalParentId,
      status: formData.status
    };

    let error;
    let studentId;

    if (editingStudent) {
      const { error: updateError } = await supabase.from("students").update(payload).eq("id", editingStudent.id);
      error = updateError;
      studentId = editingStudent.id;
    } else {
      const { data: newStudent, error: insertError } = await supabase.from("students").insert([payload]).select().single();
      error = insertError;
      if (newStudent) studentId = newStudent.id;
    }

    if (!error && !finalParentId && formData.parent_email && studentId) {
      // Create Invite if parent was not found and email provided
      try {
        const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const { error: inviteError } = await (supabase.from("invites" as any).insert([{
            school_id: effectiveSchoolId,
            email: formData.parent_email,
            role: 'responsavel',
            token: token,
            student_id: studentId,
            status: 'pending'
        }]) as any);
        
        if (!inviteError) {
          inviteSent = true;
          const link = `${window.location.origin}/signup?token=${token}`;
          setInviteLink(link);
        }
      } catch (err) {
        console.error("Error sending invite:", err);
      }
    }

    if (error) {
      toast.error("Erro ao salvar aluno");
      console.error(error);
    } else {
      let msg = editingStudent ? "Aluno atualizado com sucesso!" : "Aluno matriculado com sucesso!";
      if (inviteSent) {
        msg += " Convite gerado.";
        // Don't close dialog if invite sent, to show the link
      } else {
        setIsDialogOpen(false);
      }
      
      toast.success(msg);
      loadData();
    }
    setSaving(false);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aluno?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir aluno");
    } else {
      toast.success("Aluno excluído com sucesso!");
      loadData();
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calcAge = (birthDate: string | null) => {
    if (!birthDate) return "-";
    const diff = Date.now() - new Date(birthDate).getTime();
    const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    return years < 1 ? "< 1 ano" : `${years} ano${years > 1 ? "s" : ""}`;
  };

  return (
    <DashboardLayout title="Gerenciar Alunos" navItems={navItems} roleBadge={roleBadge}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Buscar criança..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" onClick={() => handleOpenDialog()}><Plus size={16} /> Nova Matrícula</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Editar Aluno" : "Nova Matrícula"}</DialogTitle>
              <DialogDescription>
                {editingStudent ? "Atualize os dados do aluno." : "Adicione um novo aluno ao sistema."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent_id">Responsável (Usuário do Sistema)</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_empty">Sem responsável vinculado</SelectItem>
                    {parents.map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || "Sem nome"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(!formData.parent_id || formData.parent_id === "_empty") && (
                  <div className="mt-2 space-y-2">
                    <Label htmlFor="parent_email" className="text-xs text-muted-foreground">Ou convide por email</Label>
                    <Input
                      id="parent_email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.parent_email}
                      onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                      className="mt-1"
                    />
                    <Input
                      id="parent_phone"
                      type="tel"
                      placeholder="WhatsApp (ex: 5511999999999)"
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="class_id">Turma</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_empty">Sem turma</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {inviteLink ? (
               <div className="space-y-4 pt-2">
                 <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center space-y-2">
                    <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                      <FileText size={20} />
                    </div>
                    <h3 className="font-semibold text-green-800">Convite Gerado!</h3>
                    <p className="text-xs text-green-700">Compartilhe com o responsável para ele acessar o app.</p>
                 </div>

                 <div className="space-y-2">
                    <Label>Link de Acesso</Label>
                    <div className="flex items-center gap-2">
                      <Input value={inviteLink} readOnly className="bg-muted text-xs" />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(inviteLink);
                          toast.success("Link copiado!");
                        }}
                      >
                        <FileText size={16} />
                      </Button>
                    </div>
                 </div>

                 <Button 
                   type="button" 
                   className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
                   onClick={() => {
                     const message = encodeURIComponent(`Olá! Sua criança ${formData.name} foi cadastrada na escola. Acesse o Brotar Kids para acompanhar o dia a dia: ${inviteLink}`);
                     const phone = formData.parent_phone.replace(/\D/g, '');
                     window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                   }}
                   disabled={!formData.parent_phone}
                 >
                   Enviar via WhatsApp
                 </Button>

                 <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setInviteLink(null);
                    }}
                 >
                    Concluir
                 </Button>
               </div>
            ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveStudent} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar
              </Button>
            </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Idade</th>
                <th className="px-5 py-3 font-medium">Turma</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Nenhuma criança encontrada.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{calcAge(c.birth_date)}</td>
                  <td className="px-5 py-3 text-foreground">{c.classes?.name || "-"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.status === "active" ? "bg-success/40 text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                      {c.status === "active" ? "Ativa" : c.status || "-"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground"><MoreVertical size={16} /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(c)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteStudent(c.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CriancasPage;
