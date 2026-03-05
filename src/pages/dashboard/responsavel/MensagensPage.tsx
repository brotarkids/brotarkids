import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Calendar, CreditCard, MessageSquare, User, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Feed do Dia", href: "/responsavel", icon: <LayoutDashboard size={18} /> },
  { label: "Calendário", href: "/responsavel/calendario", icon: <Calendar size={18} /> },
  { label: "Pagamentos", href: "/responsavel/pagamentos", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/responsavel/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Perfil da Criança", href: "/responsavel/perfil", icon: <User size={18} /> },
];

const MensagensPage = () => (
  <DashboardLayout title="Mensagens" navItems={navItems} roleBadge="Responsável">
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <Input placeholder="Buscar..." className="h-9" />
        </div>
        <div className="divide-y divide-border">
          {[
            { name: "Prof. Ana", subject: "Maternal I", lastMsg: "A Sofia participou muito da pintura!", time: "10:32", unread: true },
            { name: "Coordenação", subject: "Creche", lastMsg: "Lembrete: reunião dia 07/03", time: "Ontem", unread: false },
          ].map((c) => (
            <button key={c.name} className="w-full text-left p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
              {c.unread && <span className="inline-block w-2 h-2 bg-primary rounded-full mt-1" />}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-card rounded-2xl shadow-card border border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <span className="font-display font-bold text-foreground">Prof. Ana</span>
          <span className="text-xs text-muted-foreground ml-2">Maternal I</span>
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-auto">
          <div className="flex justify-start"><div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2 max-w-[75%] text-sm text-foreground">A Sofia participou muito da atividade de pintura hoje! 🎨</div></div>
          <div className="flex justify-end"><div className="bg-primary/15 rounded-2xl rounded-br-md px-4 py-2 max-w-[75%] text-sm text-foreground">Que lindo! Ela adora pintar. Obrigada pelo carinho!</div></div>
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <Input placeholder="Escrever mensagem..." className="flex-1" />
          <Button variant="default" size="icon"><Send size={16} /></Button>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default MensagensPage;
