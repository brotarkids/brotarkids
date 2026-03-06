import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Calendar, CreditCard, MessageSquare, User, Bell, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import { toast } from "sonner";

const navItems = [
  { label: "Feed do Dia", href: "/responsavel", icon: <LayoutDashboard size={18} /> },
  { label: "Calendário", href: "/responsavel/calendario", icon: <Calendar size={18} /> },
  { label: "Pagamentos", href: "/responsavel/pagamentos", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/responsavel/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Perfil da Criança", href: "/responsavel/perfil", icon: <User size={18} /> },
  { label: "Notificações", href: "/responsavel/notificacoes", icon: <Bell size={18} /> },
];

interface Preferences {
  daily_logs: boolean;
  messages: boolean;
  financial: boolean;
  announcements: boolean;
}

const defaultPrefs: Preferences = {
  daily_logs: true,
  messages: true,
  financial: true,
  announcements: true,
};

const prefItems = [
  { key: "daily_logs" as const, label: "Registros Diários", desc: "Refeições, sonecas, humor e fotos do seu filho(a)", icon: "📋" },
  { key: "messages" as const, label: "Mensagens", desc: "Novas mensagens de professores e escola", icon: "💬" },
  { key: "financial" as const, label: "Financeiro", desc: "Faturas, cobranças e confirmações de pagamento", icon: "💰" },
  { key: "announcements" as const, label: "Avisos Gerais", desc: "Comunicados e eventos da escola", icon: "📢" },
];

const NotificacoesConfigPage = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("notification_preferences" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPrefs({
          daily_logs: (data as any).daily_logs,
          messages: (data as any).messages,
          financial: (data as any).financial,
          announcements: (data as any).announcements,
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const togglePref = async (key: keyof Preferences) => {
    if (!user || saving) return;
    setSaving(true);
    const newValue = !prefs[key];
    const newPrefs = { ...prefs, [key]: newValue };
    setPrefs(newPrefs);

    const { error } = await supabase
      .from("notification_preferences" as any)
      .upsert(
        { user_id: user.id, ...newPrefs, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (error) {
      setPrefs(prefs); // revert
      toast.error("Erro ao salvar preferência");
    } else {
      toast.success("Preferência atualizada");
    }
    setSaving(false);
  };

  return (
    <DashboardLayout title="Notificações" navItems={navItems} roleBadge="Responsável">
      <div className="space-y-6 max-w-lg">
        {/* Push toggle */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-2">Notificações Push</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ative para receber alertas diretamente no seu dispositivo.
          </p>
          <PushNotificationToggle />
        </div>

        {/* Category preferences */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h3 className="font-display font-bold text-foreground mb-1">Tipos de Alerta</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Escolha quais notificações você deseja receber.
          </p>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {prefItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <Label htmlFor={item.key} className="font-medium text-foreground cursor-pointer">
                        {item.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    id={item.key}
                    checked={prefs[item.key]}
                    onCheckedChange={() => togglePref(item.key)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificacoesConfigPage;
