import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Calendar, CreditCard, MessageSquare, User, Camera, Utensils, Moon, Smile, Clock } from "lucide-react";

const navItems = [
  { label: "Feed do Dia", href: "/responsavel", icon: <LayoutDashboard size={18} /> },
  { label: "Calendário", href: "/responsavel/calendario", icon: <Calendar size={18} /> },
  { label: "Pagamentos", href: "/responsavel/pagamentos", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/responsavel/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Perfil da Criança", href: "/responsavel/perfil", icon: <User size={18} /> },
];

const timeline = [
  { time: "7:45", icon: "🏫", text: "Sofia chegou na creche", type: "checkin" },
  { time: "8:30", icon: "🍎", text: "Café da manhã: frutas, pão integral, leite", type: "meal" },
  { time: "9:15", icon: "🎨", text: "Atividade artística: pintura com guache", type: "activity", hasPhoto: true },
  { time: "10:00", icon: "😊", text: "Humor: alegre e participativa", type: "mood" },
  { time: "11:30", icon: "🍚", text: "Almoço: arroz, feijão, frango, legumes", type: "meal" },
  { time: "12:15", icon: "😴", text: "Soneca: dormiu 1h20min", type: "nap" },
];

const ResponsavelDashboard = () => {
  return (
    <DashboardLayout title="Acompanhamento" navItems={navItems} roleBadge="Responsável">
      {/* Child header */}
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-sprout flex items-center justify-center text-2xl">
            👧
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">Sofia Oliveira</h2>
            <p className="text-sm text-muted-foreground">3 anos • Maternal I • Prof. Ana</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="text-center p-2 rounded-xl bg-success/20">
            <Utensils size={16} className="mx-auto mb-1 text-success-foreground" />
            <span className="text-xs text-foreground font-medium">Comeu bem</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-secondary/40">
            <Moon size={16} className="mx-auto mb-1 text-secondary-foreground" />
            <span className="text-xs text-foreground font-medium">1h20 sono</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-accent/50">
            <Smile size={16} className="mx-auto mb-1 text-accent-foreground" />
            <span className="text-xs text-foreground font-medium">Alegre</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-primary/15">
            <Camera size={16} className="mx-auto mb-1" />
            <span className="text-xs text-foreground font-medium">3 fotos</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <h3 className="font-display font-bold text-foreground mb-4">Hoje, 5 de março</h3>
        <div className="space-y-0">
          {timeline.map((item, i) => (
            <div key={i} className="flex gap-4 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="text-lg">{item.icon}</div>
                {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="flex-1 pb-4 last:pb-0">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
                <p className="text-sm text-foreground mt-0.5">{item.text}</p>
                {item.hasPhoto && (
                  <div className="mt-2 w-32 h-24 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xs">
                    <Camera size={16} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResponsavelDashboard;
