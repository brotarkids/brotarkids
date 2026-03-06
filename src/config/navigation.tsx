import { LayoutDashboard, Users, GraduationCap, CreditCard, FileText, Settings, Crown, UserCog, ClipboardList, BookOpen, CalendarCheck, MessageSquare } from "lucide-react";

export const adminNavItems = [
  { label: "Visão Geral", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Crianças", href: "/admin/criancas", icon: <Users size={18} /> },
  { label: "Turmas", href: "/admin/turmas", icon: <GraduationCap size={18} /> },
  { label: "Equipe", href: "/admin/equipe", icon: <UserCog size={18} /> },
  { label: "Financeiro", href: "/admin/financeiro", icon: <CreditCard size={18} /> },
  { label: "Mensagens", href: "/admin/mensagens", icon: <MessageSquare size={18} /> },
  { label: "Relatórios", href: "/admin/relatorios", icon: <FileText size={18} /> },
  { label: "Assinatura", href: "/admin/assinatura", icon: <Crown size={18} /> },
  { label: "Configurações", href: "/admin/config", icon: <Settings size={18} /> },
];

export const professorNavItems = [
  { label: "Minha Turma", href: "/professor", icon: <LayoutDashboard size={18} /> },
  { label: "Meus Alunos", href: "/professor/alunos", icon: <Users size={18} /> },
  { label: "Registro Diário", href: "/professor/registro", icon: <ClipboardList size={18} /> },
  { label: "Planejamento", href: "/professor/planejamento", icon: <BookOpen size={18} /> },
  { label: "Frequência", href: "/professor/frequencia", icon: <CalendarCheck size={18} /> },
  { label: "Mensagens", href: "/professor/mensagens", icon: <MessageSquare size={18} /> },
];
