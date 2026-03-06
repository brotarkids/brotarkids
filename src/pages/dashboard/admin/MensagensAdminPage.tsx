import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageSquare, Send, Loader2, UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import { adminNavItems } from "@/config/navigation";
import { useAuth } from "@/contexts/AuthContext";

const MensagensAdminPage = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState("");

  const loadMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(500);

    const msgs = data || [];
    setMessages(msgs);

    const convMap = new Map<string, { userId: string; lastMsg: string; time: string; unread: boolean; unreadCount: number }>();
    msgs.forEach(m => {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (!otherId) return;
      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          userId: otherId,
          lastMsg: m.content,
          time: new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          unread: m.receiver_id === user.id && !m.read_at,
          unreadCount: 0,
        });
      }
      if (m.receiver_id === user.id && !m.read_at) {
        const entry = convMap.get(otherId)!;
        entry.unreadCount++;
      }
    });

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

  useEffect(() => { loadMessages(); }, [user]);

  const loadContacts = async () => {
    if (!profile?.school_id) return;
    
    // Load Parents
    const { data: studentsData } = await supabase
      .from("students")
      .select("parent_id, name")
      .eq("school_id", profile.school_id)
      .eq("status", "active");
      
    const parentIds = [...new Set((studentsData || []).map(s => s.parent_id).filter(Boolean))];
    
    // Load Teachers
    const { data: users } = await supabase.rpc('get_all_users_with_email');
    const schoolTeachers = (users || []).filter((u: any) => u.school_id === profile.school_id && u.role === 'professor');
    
    // Combine IDs
    const allUserIds = [...parentIds, ...schoolTeachers.map((t: any) => t.user_id)];
    
    if (allUserIds.length === 0) {
        setContacts([]);
        return;
    }
    
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", allUserIds);
    
    const teacherIds = new Set(schoolTeachers.map((t: any) => t.user_id));
    const contactList = (profiles || []).map((p: any) => {
      const isTeacher = teacherIds.has(p.user_id);
      const studentName = !isTeacher ? studentsData?.find(s => s.parent_id === p.user_id)?.name : null;
      return {
        userId: p.user_id,
        name: p.full_name || (isTeacher ? "Professor" : "Responsável"),
        role: isTeacher ? "Professor" : "Responsável",
        detail: isTeacher ? "Equipe" : `Aluno: ${studentName || "?"}`,
      };
    });
    
    setContacts(contactList);
  };

  // Mark messages as read when selecting a conversation
  useEffect(() => {
    if (!selectedUserId || !user) return;
    const unread = messages.filter(m => m.sender_id === selectedUserId && m.receiver_id === user.id && !m.read_at);
    if (unread.length > 0) {
      // Optimistic update
      setMessages(prev => prev.map(m =>
        unread.some(u => u.id === m.id) ? { ...m, read_at: new Date().toISOString() } : m
      ));
      setConversations(prev => prev.map(c =>
        c.userId === selectedUserId ? { ...c, unread: false, unreadCount: 0 } : c
      ));

      supabase.from("messages").update({ read_at: new Date().toISOString() })
        .in("id", unread.map(m => m.id))
        .then(({ error }) => {
            if (error) console.error("Error marking read:", error);
        });
    }
  }, [selectedUserId, user, messages]); // Added user and messages to dependency array to be safe, though mainly selectedUserId triggers switch

  const selectedMessages = messages
    .filter(m => (m.sender_id === selectedUserId && m.receiver_id === user?.id) || (m.sender_id === user?.id && m.receiver_id === selectedUserId))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const selectedName = conversations.find(c => c.userId === selectedUserId)?.name || 
                       contacts.find(c => c.userId === selectedUserId)?.name || "Usuário";

  const filteredConversations = searchTerm
    ? conversations.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : conversations;

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId || !user) return;
    setSending(true);
    
    const msgContent = newMessage.trim();
    const receiver = selectedUserId;
    
    // Optimistic update
    const tempMsg = { 
        id: "temp-" + Date.now(),
        sender_id: user.id, 
        receiver_id: receiver, 
        content: msgContent, 
        created_at: new Date().toISOString() 
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage("");

    const { data, error } = await supabase.from("messages").insert([{
      sender_id: user.id,
      receiver_id: receiver,
      content: msgContent,
    }]).select().single();

    if (error) {
      toast.error("Erro ao enviar mensagem");
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id)); // Revert
    } else {
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m)); // Replace temp with real
    }
    setSending(false);
  };

  const handleNewConversation = () => {
    if (!selectedContact) return;
    setSelectedUserId(selectedContact);
    // Add to conversations if not exists
    const existing = conversations.find(c => c.userId === selectedContact);
    if (!existing) {
      const contact = contacts.find(c => c.userId === selectedContact);
      setConversations(prev => [{ 
          userId: selectedContact, 
          name: contact?.name || "Usuário", 
          lastMsg: "", 
          time: "", 
          unread: false, 
          unreadCount: 0 
      }, ...prev]);
    }
    setNewConvOpen(false);
    setSelectedContact("");
  };

  if (loading) {
    return (
      <DashboardLayout title="Mensagens" navItems={adminNavItems} roleBadge="Diretor(a)">
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mensagens" navItems={adminNavItems} roleBadge="Diretor(a)">
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        {/* Sidebar */}
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border space-y-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                    placeholder="Buscar conversa..." 
                    className="h-9 pl-9" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                />
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => { setNewConvOpen(true); loadContacts(); }}>
              <UserPlus size={14} className="mr-2" /> Nova conversa
            </Button>
          </div>
          <div className="divide-y divide-border overflow-auto flex-1">
            {filteredConversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">Nenhuma conversa iniciada.</p>
            ) : filteredConversations.map((c) => (
              <button key={c.userId} onClick={() => setSelectedUserId(c.userId)} className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${selectedUserId === c.userId ? "bg-muted/50" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground truncate flex-1">{c.lastMsg}</p>
                  {c.unreadCount > 0 && (
                    <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2 bg-card rounded-2xl shadow-card border border-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-card">
            <span className="font-display font-bold text-foreground">{selectedName}</span>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-muted/20">
            {selectedMessages.length === 0 && selectedUserId && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare size={48} className="mb-2 opacity-20" />
                  <p className="text-sm">Nenhuma mensagem ainda.</p>
                  <p className="text-xs">Envie a primeira mensagem para iniciar a conversa.</p>
              </div>
            )}
            {!selectedUserId && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare size={48} className="mb-2 opacity-20" />
                  <p>Selecione uma conversa para visualizar.</p>
              </div>
            )}
            {selectedMessages.map((m) => {
              const isMe = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none"}`}>
                    <p>{m.content}</p>
                    <span className={`text-[10px] block text-right mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      {isMe && (
                          <span className="ml-1">
                              {m.read_at ? "• Lida" : "• Enviada"}
                          </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 border-t border-border bg-card">
            <div className="flex gap-2">
              <Input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Digite sua mensagem..." 
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={!selectedUserId}
              />
              <Button onClick={handleSend} disabled={!selectedUserId || !newMessage.trim() || sending} size="icon">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={newConvOpen} onOpenChange={setNewConvOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conversa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selecione o destinatário</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Buscar pessoa..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {contacts.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">Nenhum contato encontrado.</div>
                  ) : (
                      contacts.map((c) => (
                        <SelectItem key={c.userId} value={c.userId}>
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.detail}</span>
                          </div>
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleNewConversation} disabled={!selectedContact}>Iniciar Conversa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MensagensAdminPage;
