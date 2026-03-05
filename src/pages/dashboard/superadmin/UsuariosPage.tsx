import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, Search, MoreVertical, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

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
  user_id: string;
  school_name: string | null;
  role: string;
}

const UsuariosPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      // Fetch profiles with school name, and roles separately
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, schools(name)"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      const rolesMap = new Map<string, string>();
      (rolesRes.data || []).forEach((r: any) => rolesMap.set(r.user_id, r.role));

      const merged: UserRow[] = (profilesRes.data || []).map((p: any) => ({
        full_name: p.full_name,
        user_id: p.user_id,
        school_name: p.schools?.name || null,
        role: rolesMap.get(p.user_id) || "responsavel",
      }));

      setUsers(merged);
      setLoading(false);
    };
    load();
  }, []);

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
                <th className="px-5 py-3 font-medium"></th>
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
                  <td className="px-5 py-3 text-muted-foreground">{u.school_name || "-"}</td>
                  <td className="px-5 py-3"><button className="text-muted-foreground hover:text-foreground"><MoreVertical size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UsuariosPage;
