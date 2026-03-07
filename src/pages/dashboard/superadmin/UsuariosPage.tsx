import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, Search, MoreVertical, Loader2, Link2, Plus, Edit, Trash, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const navItems = [
  { label: "Visão Geral", href: "/superadmin", icon: <LayoutDashboard size={18} /> },
  { label: "Creches", href: "/superadmin/creches", icon: <Building2 size={18} /> },
  { label: "Usuários", href: "/superadmin/usuarios", icon: <Users size={18} /> },
  { label: "Financeiro", href: "/superadmin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Analytics", href: "/superadmin/analytics", icon: <BarChart3 size={18} /> },
  { label: "Configurações", href: "/superadmin/config", icon: <Settings size={18} /> },
];

const roleLabels: Record<string, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  professor: "Professor",
  responsavel: "Responsável",
};
const roleBadgeColor: Record<string, string> = {
  superadmin: "bg-destructive/20 text-destructive",
  admin: "bg-primary/20 text-primary",
  professor: "bg-secondary/50 text-secondary-foreground",
  responsavel: "bg-accent/60 text-accent-foreground",
};

interface UserRow {
  full_name: string | null;
  email: string | null;
  user_id: string;
  school_id: string | null;
  school_name: string | null;
  role: string;
}

interface School {
  id: string;
  name: string;
}

const UsuariosPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { toast } = useToast();

  // Invite state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ email: "", role: "responsavel", school_id: "" });
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);

  const loadData = useCallback(async () => {
    const [usersRes, schoolsRes] = await Promise.all([
      supabase.rpc("get_all_users_with_email"),
      supabase.from("schools").select("id, name").order("name"),
    ]);

    const schoolsMap = new Map<string, string>();
    (schoolsRes.data || []).forEach((s: any) => schoolsMap.set(s.id, s.name));

    const merged: UserRow[] = (usersRes.data || []).map((u: any) => ({
      full_name: u.full_name,
      email: u.email,
      user_id: u.user_id,
      school_id: u.school_id,
      school_name: u.school_name || (u.school_id ? schoolsMap.get(u.school_id) : null),
      role: u.role || "responsavel",
    }));

    setUsers(merged);
    setSchools(schoolsRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openEditDialog = (user: UserRow) => {
    setSelectedUser(user);
    setSelectedSchoolId(user.school_id || "");
    setSelectedRole(user.role);
    setSelectedName(user.full_name || "");
    setEditOpen(true);
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email || !inviteData.role) return;
    
    setSubmitting(true);
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const { error } = await supabase
        .from('invites' as any)
        .insert([{
          email: inviteData.email,
          role: inviteData.role,
          school_id: inviteData.school_id || null,
          token: token,
          status: 'pending'
        }]) as any;

      if (error) throw error;

      const link = `${window.location.origin}/signup?token=${token}`;
      setInviteLink(link);
      toast({ title: "Convite gerado!", description: "Envie o link para o usuário." });
    } catch (error: any) {
      toast({ title: "Erro ao convidar", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);

    try {
      // Update profile (school_id and full_name)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          school_id: selectedSchoolId || null,
          full_name: selectedName
        })
        .eq("user_id", selectedUser.user_id);

      if (profileError) throw profileError;

      // Update role if changed
      if (selectedRole && selectedRole !== selectedUser.role) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: selectedRole as any })
          .eq("user_id", selectedUser.user_id);

        if (roleError) throw roleError;
      }

      toast({ title: "Usuário atualizado!", description: "Dados salvos com sucesso." });
      setEditOpen(false);
      setSelectedUser(null);
      await loadData();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (user: UserRow) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      // Delete profile (cascades or we do it manually)
      // Note: We cannot easily delete from auth.users from client without edge function.
      // But deleting profile removes them from the app logic.
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userToDelete.user_id);
        
      if (error) throw error;
      
      // Also try to delete user_roles just in case
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userToDelete.user_id);
      
      toast({
        title: "Usuário removido",
        description: "O perfil foi excluído com sucesso.",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const closeInviteDialog = () => {
    setInviteOpen(false);
    setInviteLink(null);
    setInviteData({ email: "", role: "responsavel", school_id: "" });
  };

  const filtered = users.filter(u => {
    const matchesSearch = 
      (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.school_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout title="Usuários" navItems={navItems} roleBadge="Superadmin">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="Buscar usuário..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrar por papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="professor">Professores</SelectItem>
              <SelectItem value="responsavel">Responsáveis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus size={16} /> Convidar Usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Usuário</DialogTitle>
            </DialogHeader>
            {inviteLink ? (
              <div className="py-4 space-y-4">
                <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-800">
                  <h3 className="font-semibold mb-2">Convite gerado!</h3>
                  <p className="text-sm mb-2">Envie este link para o usuário se cadastrar:</p>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={inviteLink} className="bg-white" />
                    <Button size="sm" onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      toast({ title: "Link copiado!" });
                    }}>Copiar</Button>
                    <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={() => {
                      const msg = `Olá! Você foi convidado para o BrotarKids. Acesse: ${inviteLink}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                    }}>WhatsApp</Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={closeInviteDialog}>Fechar</Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleInviteUser} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    value={inviteData.email} 
                    onChange={e => setInviteData({...inviteData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Papel</Label>
                  <Select value={inviteData.role} onValueChange={v => setInviteData({...inviteData, role: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="professor">Professor</SelectItem>
                      <SelectItem value="responsavel">Responsável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Creche (Opcional)</Label>
                  <Select value={inviteData.school_id} onValueChange={v => setInviteData({...inviteData, school_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_empty">Nenhuma</SelectItem>
                      {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Gerar Convite
                  </Button>
                </DialogFooter>
              </form>
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
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Papel</th>
                <th className="px-5 py-3 font-medium">Creche</th>
                <th className="px-5 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.user_id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{u.full_name || "Sem nome"}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{u.email || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleBadgeColor[u.role] ?? "bg-muted"}`}>{roleLabels[u.role] || u.role}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.school_name || "—"}</td>
                  <td className="px-5 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(u)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(u)} className="text-destructive focus:text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
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

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input 
                value={selectedName} 
                onChange={e => setSelectedName(e.target.value)} 
                placeholder="Nome do usuário"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email (Somente leitura)</Label>
              <Input value={selectedUser?.email || ""} readOnly className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Creche</Label>
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma creche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_empty">Nenhuma</SelectItem>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Papel</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="responsavel">Responsável</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá o perfil e o acesso do usuário <span className="font-semibold">{userToDelete?.full_name || userToDelete?.email}</span>.
              A conta de autenticação pode permanecer, mas sem acesso aos dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default UsuariosPage;
