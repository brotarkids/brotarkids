import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, Search, MoreVertical, Loader2, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Link dialog state
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    const [profilesRes, rolesRes, schoolsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, school_id, schools(name)"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("schools").select("id, name").order("name"),
    ]);

    const rolesMap = new Map<string, string>();
    (rolesRes.data || []).forEach((r: any) => rolesMap.set(r.user_id, r.role));

    const merged: UserRow[] = (profilesRes.data || []).map((p: any) => ({
      full_name: p.full_name,
      user_id: p.user_id,
      school_id: p.school_id,
      school_name: p.schools?.name || null,
      role: rolesMap.get(p.user_id) || "responsavel",
    }));

    setUsers(merged);
    setSchools(schoolsRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openLinkDialog = (user: UserRow) => {
    setSelectedUser(user);
    setSelectedSchoolId(user.school_id || "");
    setSelectedRole(user.role);
    setLinkOpen(true);
  };

  const handleSaveLink = async () => {
    if (!selectedUser) return;
    setSubmitting(true);

    try {
      // Update school_id on profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ school_id: selectedSchoolId || null })
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

      toast({ title: "Usuário atualizado!", description: "Creche e papel vinculados com sucesso." });
      setLinkOpen(false);
      setSelectedUser(null);
      await loadData();
    } catch (error: any) {
      toast({ title: "Erro ao vincular", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.school_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Usuários" navItems={navItems} roleBadge="Superadmin">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Buscar usuário..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Papel</th>
                <th className="px-5 py-3 font-medium">Creche</th>
                <th className="px-5 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.user_id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{u.full_name || "Sem nome"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleBadgeColor[u.role] ?? "bg-muted"}`}>{roleLabels[u.role] || u.role}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.school_name || "—"}</td>
                  <td className="px-5 py-3">
                    <Button variant="ghost" size="sm" onClick={() => openLinkDialog(u)} className="gap-1.5 text-xs">
                      <Link2 size={14} /> Vincular
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Link User to School Dialog */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Usuário à Creche</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Usuário: <span className="font-medium text-foreground">{selectedUser?.full_name || "Sem nome"}</span>
            </p>

            <div className="space-y-2">
              <Label>Creche</Label>
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma creche" />
                </SelectTrigger>
                <SelectContent>
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
            <Button variant="outline" onClick={() => setLinkOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveLink} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UsuariosPage;
