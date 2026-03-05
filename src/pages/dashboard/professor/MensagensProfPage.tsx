import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Minha Turma", href: "/professor", icon: <LayoutDashboard size={18} /> },
  { label: "Registro Diário", href: "/professor/registro", icon: <ClipboardList size={18} /> },
  { label: "Planejamento", href: "/professor/planejamento", icon: <BookOpen size={18} /> },
  { label: "Frequência", href: "/professor/frequencia", icon: <CalendarCheck size={18} /> },
  { label: "Mensagens", href: "/professor/mensagens", icon: <MessageSquare size={18} /> },
];

const conversations = [
  { name: "Fernanda Costa", child: "Sofia", lastMsg: "Obrigada pelo carinho com a Sofia!", time: "10:32", unread: false },
  { name: "João Santos", child: "Miguel", lastMsg: "Miguel vai faltar amanhã.", time: "09:15", unread: true },
  { name: "Carlos Souza", child: "Arthur", lastMsg: "Arthur pode comer morango?", time: "Ontem", unread: true },
  { name: "Ana Lima", child: "Helena", lastMsg: "Tudo certo, obrigada!", time: "Ontem", unread: false },
];

const MensagensProfPage = () => (
  <DashboardLayout title="Mensagens" navItems={navItems} roleBadge="Professor(a)">
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <Input placeholder="Buscar conversa..." className="h-9" />
        </div>
        <div className="divide-y divide-border">
          {conversations.map((c) => (
            <button key={c.name} className="w-full text-left p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground truncate flex-1">{c.lastMsg}</p>
                {c.unread && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-card rounded-2xl shadow-card border border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <span className="font-display font-bold text-foreground">Fernanda Costa</span>
          <span className="text-xs text-muted-foreground ml-2">mãe da Sofia</span>
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-auto">
          <div className="flex justify-end"><div className="bg-primary/15 rounded-2xl rounded-br-md px-4 py-2 max-w-[75%] text-sm text-foreground">A Sofia participou muito da atividade de pintura hoje! 🎨</div></div>
          <div className="flex justify-start"><div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2 max-w-[75%] text-sm text-foreground">Que lindo! Ela adora pintar em casa também. Obrigada pelo carinho com a Sofia!</div></div>
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <Input placeholder="Escrever mensagem..." className="flex-1" />
          <Button variant="default" size="icon"><Send size={16} /></Button>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default MensagensProfPage;
