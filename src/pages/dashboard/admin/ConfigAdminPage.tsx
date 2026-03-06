
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, Building2, Bell, Clock, Palette, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { LogoUpload } from "@/components/whitelabel/LogoUpload";
import { ColorPalette, applyTheme } from "@/lib/theme-utils";
import { useTheme } from "@/components/whitelabel/ThemeContext";

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
    }
  }, [profile]);

  const handleSaveTheme = async () => {
    if (!profile?.school_id) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("schools")
        .update({
          logo_url: logoUrl,
          color_palette: palette as unknown as any,
          primary_color: palette?.primary
        })
        .eq("id", profile.school_id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Tema atualizado com sucesso!" });
      
      // Update local theme immediately
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
      content: <div className="p-4 text-center text-muted-foreground">Em desenvolvimento</div>
    },
    { 
      id: "hours",
      icon: <Clock size={20} />, 
      title: "Horários", 
      desc: "Horário de funcionamento e turnos", 
      color: "bg-secondary/50",
      content: <div className="p-4 text-center text-muted-foreground">Em desenvolvimento</div>
    },
    { 
      id: "notifications",
      icon: <Bell size={20} />, 
      title: "Notificações", 
      desc: "Comunicados e alertas para pais", 
      color: "bg-accent/60",
      content: <div className="p-4 text-center text-muted-foreground">Em desenvolvimento</div>
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
              <Label>Paleta de Cores (Extraída do Logo)</Label>
              <div className="flex flex-wrap gap-4">
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-full shadow-sm border" style={{ backgroundColor: palette.primary }} />
                  <span className="text-xs text-muted-foreground">Primária</span>
                </div>
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-full shadow-sm border" style={{ backgroundColor: palette.secondary }} />
                  <span className="text-xs text-muted-foreground">Secundária</span>
                </div>
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-full shadow-sm border" style={{ backgroundColor: palette.accent }} />
                  <span className="text-xs text-muted-foreground">Destaque</span>
                </div>
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-full shadow-sm border" style={{ backgroundColor: palette.background }} />
                  <span className="text-xs text-muted-foreground">Fundo</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                As cores são aplicadas automaticamente no app dos pais e professores.
              </p>
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
                {s.id === "theme" && (
                  <Button onClick={handleSaveTheme} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ConfigAdminPage;
