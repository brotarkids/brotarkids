import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, BookOpen, CalendarCheck, MessageSquare, ClipboardList, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { label: "Minha Turma", href: "/professor", icon: <LayoutDashboard size={18} /> },
  { label: "Registro Diário", href: "/professor/registro", icon: <ClipboardList size={18} /> },
  { label: "Planejamento", href: "/professor/planejamento", icon: <BookOpen size={18} /> },
  { label: "Frequência", href: "/professor/frequencia", icon: <CalendarCheck size={18} /> },
  { label: "Mensagens", href: "/professor/mensagens", icon: <MessageSquare size={18} /> },
];

const MensagensProfPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(200);

      const msgs = data || [];
      setMessages(msgs);

      // Build conversation list
      const convMap = new Map<string, { userId: string; lastMsg: string; time: string; unread: boolean }>();
      msgs.forEach(m => {
        const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        if (!otherId) return;
        if (!convMap.has(otherId)) {
          convMap.set(otherId, {
            userId: otherId,
            lastMsg: m.content,
            time: new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            unread: m.receiver_id === user.id && !m.read_at,
          });
        }
      });

      // Fetch profiles for conversation partners
      const userIds = Array.from(convMap.keys());
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
        const profileMap = new Map<string, string>();
        (profiles || []).forEach(p => profileMap.set(p.user_id, p.full_name || "Sem nome"));

        const convList = Array.from(convMap.values()).map(c => ({
          ...c,
          name: profileMap.get(c.userId) || "Usuário",
        }));
        setConversations(convList);
        if (convList.length > 0 && !selectedUserId) setSelectedUserId(convList[0].userId);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const selectedMessages = messages
    .filter(m => (m.sender_id === selectedUserId && m.receiver_id === user?.id) || (m.sender_id === user?.id && m.receiver_id === selectedUserId))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const selectedName = conversations.find(c => c.userId === selectedUserId)?.name || "";

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert([{
      sender_id: user.id,
      receiver_id: selectedUserId,
      content: newMessage.trim(),
    }]);
    if (error) {
      toast.error("Erro ao enviar mensagem");
    } else {
      setMessages(prev => [...prev, { sender_id: user.id, receiver_id: selectedUserId, content: newMessage.trim(), created_at: new Date().toISOString() }]);
      setNewMessage("");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <DashboardLayout title="Mensagens" navItems={navItems} roleBadge="Professor(a)">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mensagens" navItems={navItems} roleBadge="Professor(a)">
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <Input placeholder="Buscar conversa..." className="h-9" />
          </div>
          <div className="divide-y divide-border">
            {conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nenhuma conversa.</p>
            ) : conversations.map((c) => (
              <button key={c.userId} onClick={() => setSelectedUserId(c.userId)} className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${selectedUserId === c.userId ? "bg-muted/50" : ""}`}>
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
            <span className="font-display font-bold text-foreground">{selectedName || "Selecione uma conversa"}</span>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-auto">
            {selectedMessages.map((m, i) => (
              <div key={i} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-2xl px-4 py-2 max-w-[75%] text-sm text-foreground ${m.sender_id === user?.id ? "bg-primary/15 rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <Input placeholder="Escrever mensagem..." className="flex-1" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} />
            <Button variant="default" size="icon" onClick={handleSend} disabled={sending}><Send size={16} /></Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MensagensProfPage;
