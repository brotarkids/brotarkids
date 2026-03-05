import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

// SuperAdmin
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import CrechesPage from "./pages/dashboard/superadmin/CrechesPage";
import UsuariosPage from "./pages/dashboard/superadmin/UsuariosPage";
import SAFinanceiroPage from "./pages/dashboard/superadmin/FinanceiroPage";
import AnalyticsPage from "./pages/dashboard/superadmin/AnalyticsPage";
import SAConfigPage from "./pages/dashboard/superadmin/ConfigPage";

// Admin
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import CriancasPage from "./pages/dashboard/admin/CriancasPage";
import TurmasPage from "./pages/dashboard/admin/TurmasPage";
import FinanceiroAdminPage from "./pages/dashboard/admin/FinanceiroAdminPage";
import RelatoriosPage from "./pages/dashboard/admin/RelatoriosPage";
import ConfigAdminPage from "./pages/dashboard/admin/ConfigAdminPage";

// Professor
import ProfessorDashboard from "./pages/dashboard/ProfessorDashboard";
import RegistroDiarioPage from "./pages/dashboard/professor/RegistroDiarioPage";
import PlanejamentoPage from "./pages/dashboard/professor/PlanejamentoPage";
import FrequenciaPage from "./pages/dashboard/professor/FrequenciaPage";
import MensagensProfPage from "./pages/dashboard/professor/MensagensProfPage";

// Responsável
import ResponsavelDashboard from "./pages/dashboard/ResponsavelDashboard";
import CalendarioPage from "./pages/dashboard/responsavel/CalendarioPage";
import PagamentosPage from "./pages/dashboard/responsavel/PagamentosPage";
import MensagensPage from "./pages/dashboard/responsavel/MensagensPage";
import PerfilCriancaPage from "./pages/dashboard/responsavel/PerfilCriancaPage";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* SuperAdmin */}
              <Route path="/superadmin" element={<ProtectedRoute allowedRoles={["superadmin"]}><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/superadmin/creches" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrechesPage /></ProtectedRoute>} />
              <Route path="/superadmin/usuarios" element={<ProtectedRoute allowedRoles={["superadmin"]}><UsuariosPage /></ProtectedRoute>} />
              <Route path="/superadmin/financeiro" element={<ProtectedRoute allowedRoles={["superadmin"]}><SAFinanceiroPage /></ProtectedRoute>} />
              <Route path="/superadmin/analytics" element={<ProtectedRoute allowedRoles={["superadmin"]}><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/superadmin/config" element={<ProtectedRoute allowedRoles={["superadmin"]}><SAConfigPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["superadmin", "admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/criancas" element={<ProtectedRoute allowedRoles={["superadmin", "admin"]}><CriancasPage /></ProtectedRoute>} />
              <Route path="/admin/turmas" element={<ProtectedRoute allowedRoles={["superadmin", "admin"]}><TurmasPage /></ProtectedRoute>} />
              <Route path="/admin/financeiro" element={<ProtectedRoute allowedRoles={["superadmin", "admin"]}><FinanceiroAdminPage /></ProtectedRoute>} />
              <Route path="/admin/relatorios" element={<ProtectedRoute allowedRoles={["superadmin", "admin"]}><RelatoriosPage /></ProtectedRoute>} />
              <Route path="/admin/config" element={<ProtectedRoute allowedRoles={["superadmin", "admin"]}><ConfigAdminPage /></ProtectedRoute>} />

              {/* Professor */}
              <Route path="/professor" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "professor"]}><ProfessorDashboard /></ProtectedRoute>} />
              <Route path="/professor/registro" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "professor"]}><RegistroDiarioPage /></ProtectedRoute>} />
              <Route path="/professor/planejamento" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "professor"]}><PlanejamentoPage /></ProtectedRoute>} />
              <Route path="/professor/frequencia" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "professor"]}><FrequenciaPage /></ProtectedRoute>} />
              <Route path="/professor/mensagens" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "professor"]}><MensagensProfPage /></ProtectedRoute>} />

              {/* Responsável */}
              <Route path="/responsavel" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "professor", "responsavel"]}><ResponsavelDashboard /></ProtectedRoute>} />
              <Route path="/responsavel/calendario" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "professor", "responsavel"]}><CalendarioPage /></ProtectedRoute>} />
              <Route path="/responsavel/pagamentos" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "professor", "responsavel"]}><PagamentosPage /></ProtectedRoute>} />
              <Route path="/responsavel/mensagens" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "professor", "responsavel"]}><MensagensPage /></ProtectedRoute>} />
              <Route path="/responsavel/perfil" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "professor", "responsavel"]}><PerfilCriancaPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
