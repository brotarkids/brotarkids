
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Building2, User, FileText, Settings, Upload, X } from "lucide-react";
import BrotarLogo from "@/components/BrotarLogo";
import { LogoUpload } from "@/components/whitelabel/LogoUpload";
import { ColorPalette } from "@/lib/theme-utils";

const steps = [
  { id: 1, label: "Escola", icon: Building2 },
  { id: 2, label: "Perfil", icon: User },
  { id: 3, label: "Configurações", icon: Settings },
  { id: 4, label: "Legal", icon: FileText },
];

const OnboardingPage = () => {
  const { data: profile } = useUserProfile();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [schoolData, setSchoolData] = useState<any>({});

  // Form States
  const [schoolName, setSchoolName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0ea5e9"); // default sky-500
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [ratio, setRatio] = useState("10");
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [menuPreview, setMenuPreview] = useState<string | null>(null); // For PDF, just show name
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [photoPolicyAccepted, setPhotoPolicyAccepted] = useState(false);

  useEffect(() => {
    if (profile?.school_id) {
      loadSchoolData();
    }
  }, [profile]);

  const loadSchoolData = async () => {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .eq("id", profile.school_id)
      .single();

    if (data) {
      setSchoolData(data);
      setSchoolName(data.name || "");
      setPrimaryColor(data.primary_color || "#0ea5e9");
      if (data.logo_url) setLogoPreview(data.logo_url);
      setRatio(data.teacher_student_ratio?.toString() || "10");
      if (data.menu_url) setMenuPreview(data.menu_url); // Or just indicate it exists
      if (data.lgpd_accepted_at) setLgpdAccepted(true);
      if (data.photo_policy_accepted_at) setPhotoPolicyAccepted(true);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('school_assets')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('school_assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      if (currentStep === 1) {
        // Update School Info
        const { error } = await supabase
          .from("schools")
          .update({ 
            name: schoolName, 
            primary_color: palette?.primary || primaryColor,
            logo_url: logoPreview,
            color_palette: palette as unknown as any
          })
          .eq("id", profile.school_id);
        
        if (error) throw error;
      } else if (currentStep === 3) {
        // Upload Menu if changed
        let menuUrl = menuPreview;
        if (menuFile) {
           menuUrl = await uploadFile(menuFile, `menus/${profile.school_id}`);
        }

        // Update Configs
        const { error } = await supabase
          .from("schools")
          .update({ 
            teacher_student_ratio: parseInt(ratio),
            menu_url: menuUrl
          })
          .eq("id", profile.school_id);
        if (error) throw error;
      } else if (currentStep === 4) {
        // Update Legal
        if (!lgpdAccepted || !photoPolicyAccepted) {
            toast.error("Você precisa aceitar os termos para continuar.");
            setLoading(false);
            return;
        }
        const { error } = await supabase
          .from("schools")
          .update({ 
            lgpd_accepted_at: new Date().toISOString(),
            photo_policy_accepted_at: new Date().toISOString(),
            status: 'active' // Ensure active
          })
          .eq("id", profile.school_id);
        if (error) throw error;
        
        toast.success("Configuração concluída!");
        navigate("/admin");
        return;
      }

      setCurrentStep(prev => prev + 1);
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="mb-8">
        <BrotarLogo size="lg" />
      </div>
      
      {/* Stepper */}
      <div className="w-full max-w-3xl mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} 
          />
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.id <= currentStep 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {step.id < currentStep ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
              </div>
              <span className={`text-xs font-medium ${step.id <= currentStep ? "text-primary" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card className="w-full max-w-lg shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-xl">
            {currentStep === 1 && "Personalize sua Escola"}
            {currentStep === 2 && "Seu Perfil de Admin"}
            {currentStep === 3 && "Configurações Iniciais"}
            {currentStep === 4 && "Termos e Legal"}
          </CardTitle>
          <CardDescription>
            Passo {currentStep} de {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="schoolName">Nome da Escola</Label>
                <Input 
                  id="schoolName" 
                  value={schoolName} 
                  onChange={(e) => setSchoolName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Logo da Escola</Label>
                <div className="bg-muted/10 p-4 rounded-lg border border-border">
                  <LogoUpload 
                    onLogoChange={setLogoPreview} 
                    onPaletteExtracted={setPalette} 
                    currentLogo={logoPreview}
                    bucket="school_assets"
                  />
                  {palette && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs text-muted-foreground">Paleta Sugerida</Label>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: palette.primary }} title="Primária" />
                        <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: palette.secondary }} title="Secundária" />
                        <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: palette.accent }} title="Destaque" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Cor Principal (Manual)</Label>
                <div className="flex gap-3 items-center">
                  <Input 
                    id="color" 
                    type="color" 
                    className="w-12 h-12 p-1 rounded-md cursor-pointer"
                    value={palette?.primary || primaryColor} 
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      if (palette) setPalette({ ...palette, primary: e.target.value });
                    }} 
                  />
                  <div className="text-sm text-muted-foreground">
                    Você pode ajustar a cor principal se preferir.
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
               <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                 <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                    {profile.full_name?.charAt(0) || "A"}
                 </div>
                 <div>
                   <p className="font-medium">{profile.full_name}</p>
                   <p className="text-sm text-muted-foreground">Diretor(a)</p>
                 </div>
               </div>
               <p className="text-sm text-muted-foreground text-center">
                 Seu perfil de administrador já foi criado. Você poderá editar detalhes e foto mais tarde nas configurações.
               </p>
            </div>
          )}

          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ratio">Ratio Professor/Criança (Máximo)</Label>
                <Input 
                  id="ratio" 
                  type="number"
                  value={ratio} 
                  onChange={(e) => setRatio(e.target.value)} 
                />
                <p className="text-xs text-muted-foreground">
                  Número máximo de crianças por professor. O sistema alertará se excedido.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Cardápio Semanal (PDF ou Imagem)</Label>
                <div className="p-4 border border-dashed rounded-lg bg-gray-50 flex flex-col items-center gap-2">
                  {menuFile ? (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <FileText size={20} />
                      {menuFile.name}
                      <Button variant="ghost" size="sm" onClick={() => setMenuFile(null)}>
                        <X size={16} />
                      </Button>
                    </div>
                  ) : menuPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle2 size={20} />
                        Cardápio atual carregado
                      </div>
                      <a href={menuPreview} target="_blank" rel="noreferrer" className="text-xs underline text-primary">Visualizar</a>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById('menu-upload')?.click()}>
                        Substituir
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <Upload className="text-gray-400 mb-2" size={24} />
                      <p className="text-sm font-medium">Clique para fazer upload</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG ou PNG</p>
                    </div>
                  )}
                  
                  <Input 
                    id="menu-upload"
                    type="file" 
                    className={menuFile || menuPreview ? "hidden" : "mt-2"}
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setMenuFile(file);
                      }
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 border rounded-md">
                <input 
                  type="checkbox" 
                  id="lgpd" 
                  className="mt-1"
                  checked={lgpdAccepted}
                  onChange={(e) => setLgpdAccepted(e.target.checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="lgpd" className="font-medium">Termos de Uso e LGPD</Label>
                  <p className="text-sm text-muted-foreground">
                    Declaro que a escola está em conformidade com a Lei Geral de Proteção de Dados e autorizo o processamento dos dados dos alunos.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-md">
                <input 
                  type="checkbox" 
                  id="photo" 
                  className="mt-1"
                  checked={photoPolicyAccepted}
                  onChange={(e) => setPhotoPolicyAccepted(e.target.checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="photo" className="font-medium">Política de Imagem</Label>
                  <p className="text-sm text-muted-foreground">
                    Confirmo que a escola possui autorização dos pais para uso de imagem das crianças no aplicativo.
                  </p>
                </div>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between">
            {currentStep > 1 ? (
                <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} disabled={loading}>
                    Voltar
                </Button>
            ) : (
                <div /> // Spacer
            )}
            
            <Button onClick={handleNext} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentStep === 4 ? "Concluir Setup" : "Próximo"}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingPage;
