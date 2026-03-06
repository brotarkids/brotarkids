import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminNavItems } from "@/config/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import { Loader2, Plus, Mail, Trash2, UserCog, ClipboardList, MoreVertical, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EquipePage = () => {
  const { data: profile } = useUserProfile();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [invitePhone, setInvitePhone] = useState("");
  
  // Edit state
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchTeam = async () => {
    if (!profile?.school_id) return;

    try {
      setLoading(true);
      
      // Fetch active teachers using the RPC function if available, or fall back to profiles + user_roles
      // For now, let's try to use the view/RPC if it works, or just query profiles and filter by role logic if possible.
      // Since filtering by role in profiles requires a join with user_roles, and Supabase client supports it:
      
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_all_users_with_email');

      if (usersError) throw usersError;

      // Filter for this school and role 'professor' or 'admin' (excluding self if needed, but listing all is fine)
      const schoolTeam = usersData.filter((u: any) => 
        u.school_id === profile.school_id && 
        (u.role === 'professor' || u.role === 'admin')
      );
      
      setTeachers(schoolTeam);

      // Fetch pending invites
      const { data: invitesData, error: invitesError } = await (supabase
        .from('invites' as any)
        .select('*')
        .eq('school_id', profile.school_id)
        .eq('status', 'pending') as any);

      if (invitesError) throw invitesError;
      setInvites(invitesData || []);

    } catch (error: any) {
      console.error("Error fetching team:", error);
      toast.error("Erro ao carregar equipe.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.school_id) {
      fetchTeam();
    }
  }, [profile]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !profile?.school_id) return;

    try {
      setInviting(true);
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const { error } = await (supabase
        .from('invites' as any)
        .insert([{
          school_id: profile.school_id,
          email: inviteEmail,
          role: 'professor',
          token: token,
          status: 'pending'
        }]) as any);

      if (error) throw error;

      // In a real app, we would call an Edge Function to send the email.
      // Here we simulate it by showing the link or just saying sent.
      const inviteLink = `${window.location.origin}/signup?token=${token}`;
      
      setLastInviteLink(inviteLink);
      toast.success("Convite criado com sucesso!");
      
      // Don't clear inputs yet so user can send via WhatsApp
      // setInviteEmail("");
      // setInviteName("");
      // setInvitePhone("");
      // setIsInviteDialogOpen(false); // Keep open to show link
      fetchTeam();
    } catch (error: any) {
      toast.error("Erro ao enviar convite: " + error.message);
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('invites' as any)
        .delete()
        .eq('id', id) as any);
      
      if (error) throw error;
      toast.success("Convite cancelado.");
      fetchTeam();
    } catch (error: any) {
      toast.error("Erro ao cancelar: " + error.message);
    }
  };

  const handleEditClick = (member: any) => {
    setEditingMember(member);
    setEditName(member.full_name || "");
    setEditRole(member.role || "professor");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      setSavingEdit(true);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: editName,
          // role: editRole // Note: role update might be restricted by RLS or handled differently. 
                           // Ideally, role should be updated in a secure way. 
                           // For now, let's assume profiles.role is editable by admin.
        })
        .eq('user_id', editingMember.user_id);

      if (error) throw error;
      
      // If role changed, we might need to update other things, but let's stick to profiles for now.
      // If we need to update metadata, that's more complex.

      toast.success("Membro atualizado com sucesso!");
      setIsEditDialogOpen(false);
      fetchTeam();
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro da equipe?")) return;

    try {
      // Set school_id to null to remove from school
      const { error } = await supabase
        .from('profiles')
        .update({ school_id: null })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success("Membro removido da equipe.");
      fetchTeam();
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message);
    }
  };

  return (
    <DashboardLayout title="Equipe" navItems={adminNavItems} roleBadge="Diretor(a)">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-display">Professores e Administradores</h2>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              Convidar Professor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
              <DialogDescription>
                Envie um convite para um novo professor ou administrador.
              </DialogDescription>
            </DialogHeader>
            
            {lastInviteLink ? (
              <div className="space-y-4 py-4">
                 <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                      <Mail size={24} />
                    </div>
                    <h3 className="font-semibold text-green-800">Convite Criado!</h3>
                    <p className="text-sm text-green-700">O link de acesso foi gerado com sucesso.</p>
                 </div>

                 <div className="space-y-2">
                    <Label>Link de Acesso</Label>
                    <div className="flex items-center gap-2">
                      <Input value={lastInviteLink} readOnly className="bg-muted" />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(lastInviteLink);
                          toast.success("Link copiado!");
                        }}
                      >
                        <ClipboardList size={16} />
                      </Button>
                    </div>
                 </div>

                 {invitePhone && (
                   <Button 
                     type="button" 
                     className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
                     onClick={() => {
                       const message = encodeURIComponent(`Olá ${inviteName}! Você foi convidado(a) para fazer parte da equipe da escola ${profile?.schools?.name || 'Brotar Kids'}. Acesse o link para completar seu cadastro: ${lastInviteLink}`);
                       const phone = invitePhone.replace(/\D/g, '');
                       window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                     }}
                   >
                     <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-[10px] font-bold">W</div>
                     Enviar via WhatsApp
                   </Button>
                 )}

                 <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setLastInviteLink(null);
                      setInviteEmail("");
                      setInviteName("");
                      setInvitePhone("");
                      fetchTeam();
                    }}
                 >
                    Convidar Outro
                 </Button>
              </div>
            ) : (
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="professor@email.com" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome (Opcional)</Label>
                <Input 
                  id="name" 
                  placeholder="Nome do professor" 
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp (Opcional)</Label>
                <Input 
                  id="phone" 
                  placeholder="5511999999999" 
                  value={invitePhone}
                  onChange={e => setInvitePhone(e.target.value)}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={inviting}>
                  {inviting ? <Loader2 className="animate-spin" size={18} /> : "Gerar Convite"}
                </Button>
              </DialogFooter>
            </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {/* Active Members */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold">Membros Ativos</h3>
          </div>
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : teachers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhum membro encontrado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {member.full_name?.[0] || member.email?.[0] || "?"}
                        </div>
                        {member.full_name || "Sem nome"}
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {member.role === 'admin' ? 'Administrador' : 'Professor'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(member)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveMember(member.user_id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-muted-foreground">Convites Pendentes</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-muted-foreground" />
                        {invite.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{invite.role}</span>
                    </TableCell>
                    <TableCell>
                      {new Date(invite.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancelInvite(invite.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input 
                id="edit-name" 
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
            </div>
            {/* Role editing disabled for now as it's complex with auth */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? <Loader2 className="animate-spin" size={18} /> : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EquipePage;
