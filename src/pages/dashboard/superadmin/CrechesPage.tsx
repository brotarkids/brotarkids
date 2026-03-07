
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, Plus, Search, MoreVertical, Loader2, Edit, Trash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogoUpload } from "@/components/whitelabel/LogoUpload";
import { ColorPalette, defaultPalette } from "@/lib/theme-utils";
import { ThemeEditor } from "@/components/whitelabel/ThemeEditor";
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

interface School {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  director_name: string | null;
  email: string | null;
  phone: string | null;
  plan_type: string | null;
  status: string | null;
  created_at: string;
}

const CrechesPage = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // New school form state
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    director_name: "",
    email: "",
    phone: "",
    plan_type: "trial"
  });
  const [submitting, setSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [createdSchoolName, setCreatedSchoolName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<ColorPalette>(defaultPalette);
  
  // Edit & Delete state
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSchools((data || []) as any);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar escolas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleCreateOrUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    try {
      setSubmitting(true);
      
      const payload = { 
        name: formData.name, 
        city: formData.city || null, 
        state: formData.state || null,
        director_name: formData.director_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        plan_type: formData.plan_type || 'trial',
        status: 'active',
        logo_url: logoUrl,
        primary_color: palette?.primary || null,
        color_palette: palette as unknown as any
      };

      if (editingSchool) {
        // Update existing school
        const { error } = await supabase
          .from('schools')
          .update(payload)
          .eq('id', editingSchool.id);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Creche atualizada com sucesso.",
        });
        
        setOpen(false);
        setEditingSchool(null);
      } else {
        // Create new school
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .insert([payload])
          .select()
          .single();
          
        if (schoolError) throw schoolError;

        // Generate Invite (Simulated)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const { error: inviteError } = await (supabase
          .from('invites' as any)
          .insert([{
            school_id: schoolData.id,
            email: formData.email,
            role: 'admin',
            token: token,
            status: 'pending'
          }]) as any);

        if (inviteError) {
          console.error("Error creating invite:", inviteError);
          toast({ title: "Aviso", description: "Escola criada, mas erro ao gerar convite.", variant: "destructive" });
        }

        const generatedLink = `${window.location.origin}/signup?token=${token}`;
        setInviteLink(generatedLink);
        setCreatedSchoolName(formData.name);
        
        toast({
          title: "Sucesso!",
          description: "Creche cadastrada com sucesso.",
        });
      }
      
      if (!editingSchool) {
        setFormData({
          name: "",
          city: "",
          state: "",
          director_name: "",
          email: "",
          phone: "",
          plan_type: "trial"
        });
        setLogoUrl(null);
        setPalette(defaultPalette);
      }
      
      fetchSchools();
    } catch (error: any) {
      toast({
        title: `Erro ao ${editingSchool ? 'atualizar' : 'criar'} creche`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (school: any) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      city: school.city || "",
      state: school.state || "",
      director_name: school.director_name || "",
      email: school.email || "",
      phone: school.phone || "",
      plan_type: school.plan_type || "trial"
    });
    setLogoUrl(school.logo_url);
    if (school.color_palette) {
      setPalette(school.color_palette as unknown as ColorPalette);
    } else if (school.primary_color) {
      setPalette({ ...defaultPalette, primary: school.primary_color });
    } else {
      setPalette(defaultPalette);
    }
    setOpen(true);
  };

  const handleDeleteClick = (school: School) => {
    setSchoolToDelete(school);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!schoolToDelete) return;
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: "Creche excluída",
        description: `${schoolToDelete.name} foi removida com sucesso.`,
      });
      fetchSchools();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSchoolToDelete(null);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingSchool(null);
      setInviteLink(null);
      setCreatedSchoolName("");
      setFormData({
        name: "",
        city: "",
        state: "",
        director_name: "",
        email: "",
        phone: "",
        plan_type: "trial"
      });
      setLogoUrl(null);
      setPalette(defaultPalette);
    }
  };

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (school.city && school.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout title="Creches" navItems={navItems} roleBadge="Superadmin">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Buscar creche..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm"><Plus size={16} /> Nova Creche</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSchool ? 'Editar Creche' : 'Cadastrar Nova Creche'}</DialogTitle>
            </DialogHeader>
            {inviteLink && !editingSchool ? (
              <div className="py-4 space-y-4">
                <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-800">
                  <h3 className="font-semibold mb-2">Escola criada com sucesso!</h3>
                  <p className="text-sm mb-2">Envie este link para o diretor(a) completar o cadastro:</p>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={inviteLink} className="bg-white" />
                    <Button size="sm" onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      toast({ title: "Link copiado!" });
                    }}>Copiar</Button>
                    <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={() => {
                      const msg = `Olá! Você foi convidado para administrar a escola ${createdSchoolName} no BrotarKids. Acesse o link para completar seu cadastro: ${inviteLink}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                    }}>WhatsApp</Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => handleOpenChange(false)}>Fechar</Button>
                </DialogFooter>
              </div>
            ) : (
            <form onSubmit={handleCreateOrUpdateSchool} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Logo e Cores</Label>
                <div className="bg-muted/10 p-4 rounded-lg border border-border">
                  <LogoUpload 
                    onLogoChange={setLogoUrl} 
                    onPaletteExtracted={setPalette} 
                    currentLogo={logoUrl}
                    bucket="school_assets"
                  />
                  {palette && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="text-xs text-muted-foreground mr-2">Paleta extraída:</div>
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: palette.primary }} title="Primária" />
                        <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: palette.secondary }} title="Secundária" />
                        <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: palette.accent }} title="Destaque" />
                        <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: palette.background }} title="Fundo" />
                        <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: palette.foreground }} title="Texto" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Creche</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Creche Raio de Sol"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input 
                    id="city" 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})} 
                    placeholder="Ex: Porto Alegre" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Input 
                    id="state" 
                    value={formData.state} 
                    onChange={(e) => setFormData({...formData, state: e.target.value})} 
                    placeholder="Ex: RS" 
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="director">Nome da Diretora/Admin</Label>
                <Input 
                  id="director" 
                  value={formData.director_name} 
                  onChange={(e) => setFormData({...formData, director_name: e.target.value})} 
                  placeholder="Ex: Maria Silva" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Principal</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="contato@creche.com" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    placeholder="(51) 99999-9999" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="plan">Plano Inicial</Label>
                  <select 
                    id="plan"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.plan_type}
                    onChange={(e) => setFormData({...formData, plan_type: e.target.value})}
                  >
                    <option value="trial">Teste Grátis (60 dias)</option>
                    <option value="basic">Básico</option>
                    <option value="pro">Pro</option>
                  </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="lgpd-consent" 
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  required
                />
                <Label htmlFor="lgpd-consent" className="text-sm font-normal text-muted-foreground">
                  Declaro que tenho consentimento para uso da marca/logo desta escola conforme LGPD.
                </Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSchool ? 'Salvar Alterações' : 'Cadastrar Creche'}
                </Button>
              </DialogFooter>
            </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a creche 
              <span className="font-semibold text-foreground"> {schoolToDelete?.name} </span>
              e removerá seus dados.
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

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Localização</th>
                <th className="px-5 py-3 font-medium">Alunos</th>
                <th className="px-5 py-3 font-medium">Ocupação</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Carregando...
                  </td>
                </tr>
              ) : filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    Nenhuma creche encontrada.
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{school.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {school.city ? `${school.city}${school.state ? ` – ${school.state}` : ''}` : '-'}
                    </td>
                    <td className="px-5 py-3 text-foreground">-</td>
                    <td className="px-5 py-3 text-foreground">-</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${school.status === "active" ? "bg-success/40 text-success-foreground" : "bg-accent/60 text-accent-foreground"}`}>
                        {school.status === 'active' ? 'Ativa' : school.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(school)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(school)} className="text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CrechesPage;
