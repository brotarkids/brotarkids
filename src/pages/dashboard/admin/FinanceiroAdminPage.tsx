import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, DollarSign, AlertTriangle, CheckCircle, Clock, Loader2, Plus, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { adminNavItems } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const statusLabel: Record<string, string> = { paid: "Pago", pending: "Pendente", overdue: "Atrasado" };
const statusColor: Record<string, string> = {
  paid: "bg-success/40 text-success-foreground",
  pending: "bg-warning/30 text-warning-foreground",
  overdue: "bg-destructive/20 text-destructive",
};

const FinanceiroAdminPage = () => {
  const { data: profile } = useUserProfile();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [type, setType] = useState("tuition"); // tuition, fee, other

  const loadData = async () => {
    if (!profile?.school_id) return;
    
    // Load records
    const { data: recordsData } = await supabase
      .from("financial_records")
      .select("*, students(name)")
      .eq("school_id", profile.school_id)
      .order("due_date", { ascending: false })
      .limit(50);
    setRecords(recordsData || []);
    
    // Load students for selection
    const { data: studentsData } = await supabase
      .from("students")
      .select("id, name")
      .eq("school_id", profile.school_id)
      .eq("status", "active")
      .order("name");
    setStudents(studentsData || []);
    
    setLoading(false);
  };

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  const handleCreate = async () => {
    if (!profile?.school_id) return;
    if (!description || !amount || !dueDate || !selectedStudentId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("financial_records").insert([{
        school_id: profile.school_id,
        student_id: selectedStudentId,
        description,
        amount: parseFloat(amount),
        due_date: dueDate,
        type,
        status: "pending"
      }]);

      if (error) throw error;

      toast.success("Lançamento criado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error("Erro ao criar lançamento: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("financial_records")
        .update({ status: newStatus, payment_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null })
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Status atualizado!");
      loadData();
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDueDate("");
    setSelectedStudentId("");
    setType("tuition");
  };

  const paid = records.filter(r => r.status === "paid");
  const pending = records.filter(r => r.status === "pending");
  const overdue = records.filter(r => r.status === "overdue");
  const totalRevenue = paid.reduce((s, r) => s + Number(r.amount), 0);
  const totalPending = pending.reduce((s, r) => s + Number(r.amount), 0);
  const totalOverdue = overdue.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <DashboardLayout title="Financeiro" navItems={adminNavItems} roleBadge="Diretor(a)">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold hidden sm:block">Visão Geral</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus size={16} className="mr-2" /> Novo Lançamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Aluno</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Mensalidade Março" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Vencimento</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Mensalidade</SelectItem>
                    <SelectItem value="fee">Taxa Extra</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<DollarSign size={18} />} label="Receita" value={`R$ ${totalRevenue.toFixed(0)}`} color="bg-success/40" />
        <StatCard icon={<CheckCircle size={18} />} label="Pagos" value={String(paid.length)} sub={`de ${records.length}`} color="bg-primary/15" />
        <StatCard icon={<Clock size={18} />} label="Pendentes" value={String(pending.length)} sub={`R$ ${totalPending.toFixed(0)}`} color="bg-accent/60" />
        <StatCard icon={<AlertTriangle size={18} />} label="Atrasados" value={String(overdue.length)} sub={`R$ ${totalOverdue.toFixed(0)}`} color="bg-warning/30" />
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-bold text-foreground">Lançamentos Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Descrição</th>
                <th className="px-5 py-3 font-medium">Criança</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Vencimento</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />Carregando...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Nenhum registro financeiro.</td></tr>
              ) : records.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{b.description}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.students?.name || "-"}</td>
                  <td className="px-5 py-3 text-foreground">R$ {Number(b.amount).toFixed(2)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(b.due_date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[b.status] || "bg-muted"}`}>
                      {statusLabel[b.status] || b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={14} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, 'paid')}>Marcar como Pago</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, 'pending')}>Marcar como Pendente</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(b.id, 'overdue')}>Marcar como Atrasado</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroAdminPage;
