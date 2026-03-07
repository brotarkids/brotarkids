
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, Building2, Bell, Clock, Palette, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { LogoUpload } from "@/components/whitelabel/LogoUpload";
import { ColorPalette, applyTheme } from "@/lib/theme-utils";
import { useTheme } from "@/components/whitelabel/ThemeContext";
import { ThemeEditor } from "@/components/whitelabel/ThemeEditor";

const navItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

const ConfigAdminPage = () => {
  const { data: profile } = useUserProfile();
  const { refreshTheme } = useTheme();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // School Details
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Hours & Notifications
  const [workingHours, setWorkingHours] = useState<any>({ open: "07:00", close: "18:00" });
  const [notifications, setNotifications] = useState<any>({ parents: true, messages: true });

  useEffect(() => {
    if (profile?.schools) {
      // Initialize with existing data
      const school = profile.schools;
      if (Array.isArray(school)) return; // Should be single object due to query

      setLogoUrl(school.logo_url);
      if (school.color_palette) {
        setPalette(school.color_palette as unknown as ColorPalette);
      } else if (school.primary_color) {
        // Partial palette from legacy
        setPalette({ ...palette!, primary: school.primary_color });
      }

      setSchoolName(school.name || "");
      setAddress((school as any).address || "");
      setCnpj((school as any).cnpj || "");
      setPhone((school as any).phone || "");
      setEmail((school as any).email || "");
      if ((school as any).working_hours) setWorkingHours((school as any).working_hours);
      if ((school as any).notification_settings) setNotifications((school as any).notification_settings);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.school_id) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("schools")
        .update({
          logo_url: logoUrl,
          color_palette: palette as unknown as any,
          primary_color: palette?.primary,
          address,
          cnpj,
          phone,
          email,
          working_hours: workingHours,
          notification_settings: notifications
        })
        .eq("id", profile.school_id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Configurações atualizadas com sucesso!" });
      
      // Update local theme immediately if changed
      if (palette) applyTheme(palette);
      await refreshTheme();
      setActiveSection(null);
      
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { 
      id: "details",
      icon: <Building2 size={20} />, 
      title: "Dados da Creche", 
      desc: "Nome, endereço, CNPJ, contato", 
      color: "bg-primary/15",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Escola</Label>
            <Input value={schoolName} disabled />
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Textarea 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Rua, Número, Bairro, Cidade - UF"
            />
          </div>
          <div className="space-y-2">
            <Label>CNPJ</Label>
            <Input 
              value={cnpj} 
              onChange={(e) => setCnpj(e.target.value)} 
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="contato@escola.com"
              />
            </div>
          </div>
        </div>
      )
    },
    { 
      id: "hours",
      icon: <Clock size={20} />, 
      title: "Horários", 
      desc: "Horário de funcionamento e turnos", 
      color: "bg-secondary/50",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Abertura</Label>
              <Input 
                type="time" 
                value={workingHours.open} 
                onChange={(e) => setWorkingHours({...workingHours, open: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Fechamento</Label>
              <Input 
                type="time" 
                value={workingHours.close} 
                onChange={(e) => setWorkingHours({...workingHours, close: e.target.value})} 
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Defina o horário de funcionamento padrão para exibição aos pais.
          </p>
        </div>
      )
    },
    { 
      id: "notifications",
      icon: <Bell size={20} />, 
      title: "Notificações", 
      desc: "Comunicados e alertas para pais", 
      color: "bg-accent/60",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="notify-parents" className="flex flex-col space-y-1">
              <span>Notificar Pais</span>
              <span className="font-normal text-xs text-muted-foreground">Enviar notificações automáticas sobre atividades.</span>
            </Label>
            <Switch 
              id="notify-parents" 
              checked={notifications.parents}
              onCheckedChange={(checked) => setNotifications({...notifications, parents: checked})}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="notify-messages" className="flex flex-col space-y-1">
              <span>Alertas de Mensagens</span>
              <span className="font-normal text-xs text-muted-foreground">Receber notificações de novas mensagens.</span>
            </Label>
            <Switch 
              id="notify-messages" 
              checked={notifications.messages}
              onCheckedChange={(checked) => setNotifications({...notifications, messages: checked})}
            />
          </div>
        </div>
      )
    },
    { 
      id: "theme",
      icon: <Palette size={20} />, 
      title: "Personalização", 
      desc: "Logo e cores da creche", 
      color: "bg-success/40",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Logo da Escola</Label>
            <LogoUpload 
              onLogoChange={setLogoUrl}
              onPaletteExtracted={setPalette}
              currentLogo={logoUrl}
              bucket="school_assets"
            />
          </div>

          {palette && (
            <div className="space-y-2">
              <ThemeEditor 
                palette={palette} 
                onPaletteChange={setPalette}
              />
            </div>
          )}
        </div>
      )
    },
  ];

  return (
    <DashboardLayout title="Configurações" navItems={navItems} roleBadge="Diretor(a)">
      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Dialog key={s.id} open={activeSection === s.id} onOpenChange={(open) => setActiveSection(open ? s.id : null)}>
            <DialogTrigger asChild>
              <div className="bg-card rounded-2xl p-5 shadow-card border border-border flex items-start gap-4 cursor-pointer hover:bg-muted/50 transition-colors text-left w-full">
                <div className={`p-3 rounded-xl ${s.color} text-foreground`}>{s.icon}</div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  <Button variant="ghost" size="sm" className="mt-3 text-primary p-0 h-auto hover:bg-transparent hover:underline">Editar</Button>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{s.title}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                {s.content}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveSection(null)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ConfigAdminPage;
