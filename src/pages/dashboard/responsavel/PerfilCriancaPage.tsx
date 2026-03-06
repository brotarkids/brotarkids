import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Calendar, CreditCard, MessageSquare, User, Loader2, ChevronLeft, ChevronRight, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Feed do Dia", href: "/responsavel", icon: <LayoutDashboard size={18} /> },
  { label: "Calendário", href: "/responsavel/calendario", icon: <Calendar size={18} /> },
  { label: "Pagamentos", href: "/responsavel/pagamentos", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/responsavel/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Perfil da Criança", href: "/responsavel/perfil", icon: <User size={18} /> },
];

interface DayPhotos {
  date: string;
  photos: string[];
}

const PerfilCriancaPage = () => {
  const { user } = useAuth();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState<DayPhotos[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("students")
        .select("*, classes(name, period)")
        .eq("parent_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      setChild(data);
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!child) return;
    const loadGallery = async () => {
      setGalleryLoading(true);
      const [year, month] = selectedMonth.split("-").map(Number);
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const { data } = await supabase
        .from("daily_logs")
        .select("date, photos")
        .eq("student_id", child.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .not("photos", "is", null)
        .order("date", { ascending: false });

      const days: DayPhotos[] = [];
      (data || []).forEach((log: any) => {
        if (log.photos && log.photos.length > 0) {
          const existing = days.find(d => d.date === log.date);
          if (existing) {
            existing.photos.push(...log.photos);
          } else {
            days.push({ date: log.date, photos: [...log.photos] });
          }
        }
      });
      setGallery(days);
      setGalleryLoading(false);
    };
    loadGallery();
  }, [child, selectedMonth]);

  const changeMonth = (dir: number) => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const monthLabel = (() => {
    const [y, m] = selectedMonth.split("-").map(Number);
    return new Date(y, m - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  })();

  const totalPhotos = gallery.reduce((sum, d) => sum + d.photos.length, 0);

  const calcAge = (bd: string | null) => {
    if (!bd) return "-";
    const diff = Date.now() - new Date(bd).getTime();
    const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    return `${years} ano${years !== 1 ? "s" : ""} e ${months} mes${months !== 1 ? "es" : ""}`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Perfil da Criança" navItems={navItems} roleBadge="Responsável">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!child) {
    return (
      <DashboardLayout title="Perfil da Criança" navItems={navItems} roleBadge="Responsável">
        <p className="text-center py-12 text-muted-foreground">Nenhuma criança vinculada.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Perfil da Criança" navItems={navItems} roleBadge="Responsável">
      {/* Header */}
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-sprout flex items-center justify-center text-3xl">
            {child.photo_url ? <img src={child.photo_url} alt={child.name} className="w-full h-full rounded-full object-cover" /> : "👧"}
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">{child.name}</h2>
            <p className="text-sm text-muted-foreground">{calcAge(child.birth_date)} • {child.classes?.name || "Sem turma"}</p>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-3">Informações pessoais</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data de nascimento</span>
              <span className="text-foreground">{child.birth_date ? new Date(child.birth_date).toLocaleDateString("pt-BR") : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Turma</span>
              <span className="text-foreground">{child.classes?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Período</span>
              <span className="text-foreground">{child.classes?.period || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-foreground">{child.status === "active" ? "Ativa" : child.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-3">Informações de saúde</h3>
          <p className="text-sm text-muted-foreground">
            Dados de saúde (alergias, tipo sanguíneo, etc.) podem ser adicionados pelo administrador da escola.
          </p>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-primary" />
            <h3 className="font-display font-bold text-foreground">Galeria de Fotos</h3>
          </div>
          <span className="text-xs text-muted-foreground">{totalPhotos} foto{totalPhotos !== 1 ? "s" : ""}</span>
        </div>

        {/* Month navigator */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
            <ChevronLeft size={18} />
          </Button>
          <span className="font-medium text-foreground capitalize text-sm min-w-[140px] text-center">{monthLabel}</span>
          <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
            <ChevronRight size={18} />
          </Button>
        </div>

        {galleryLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : gallery.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">Nenhuma foto neste mês.</p>
        ) : (
          <div className="space-y-6">
            {gallery.map(day => (
              <div key={day.date}>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {day.photos.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox(url)}
                      className="aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setLightbox(null)}>
            <X size={28} />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default PerfilCriancaPage;
