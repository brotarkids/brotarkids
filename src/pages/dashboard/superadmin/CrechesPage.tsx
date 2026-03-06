
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, Plus, Search, MoreVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogoUpload } from "@/components/whitelabel/LogoUpload";
import { ColorPalette } from "@/lib/theme-utils";

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
  const [palette, setPalette] = useState<ColorPalette | null>(null);

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

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    try {
      setSubmitting(true);
      // 1. Create School
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert([{ 
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
          color_palette: palette as unknown as any // Using any to bypass Json type strictness for now
        }])
        .select()
        .single();
        
      if (schoolError) throw schoolError;

      // 2. Generate Invite (Simulated)
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const { error: inviteError } = await supabase
        .from('invites')
        .insert([{
          school_id: schoolData.id,
          email: formData.email,
          role: 'admin',
          token: token,
          status: 'pending'
        }]);

      if (inviteError) {
        console.error("Error creating invite:", inviteError);
        // Don't block success if invite fails, just warn
        toast({ title: "Aviso", description: "Escola criada, mas erro ao gerar convite.", variant: "destructive" });
      }

      const generatedLink = `${window.location.origin}/signup?token=${token}`;
      setInviteLink(generatedLink);
      setCreatedSchoolName(formData.name);
      
      toast({
        title: "Sucesso!",
        description: "Creche cadastrada com sucesso.",
      });
      
      // Don't close dialog immediately, show invite link
      // setOpen(false); 
      setFormData({
        name: "",
        city: "",
        state: "",
        director_name: "",
        email: "",
        phone: "",
        plan_type: "trial"
      });
      fetchSchools();
    } catch (error: any) {
      toast({
        title: "Erro ao criar creche",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm"><Plus size={16} /> Nova Creche</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Creche</DialogTitle>
            </DialogHeader>
            {inviteLink ? (
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
                  <Button onClick={() => { setOpen(false); setInviteLink(null); setCreatedSchoolName(""); }}>Fechar</Button>
                </DialogFooter>
              </div>
            ) : (
            <form onSubmit={handleCreateSchool} className="space-y-4 py-4">
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Salvar e Gerar Convite
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
                      <button className="text-muted-foreground hover:text-foreground"><MoreVertical size={16} /></button>
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
