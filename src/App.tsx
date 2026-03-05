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
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProfessorDashboard from "./pages/dashboard/ProfessorDashboard";
import ResponsavelDashboard from "./pages/dashboard/ResponsavelDashboard";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

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
              <Route path="/superadmin" element={
                <ProtectedRoute allowedRoles={["superadmin"]}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/professor" element={
                <ProtectedRoute allowedRoles={["superadmin", "admin", "professor"]}>
                  <ProfessorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/responsavel" element={
                <ProtectedRoute allowedRoles={["superadmin", "admin", "professor", "responsavel"]}>
                  <ResponsavelDashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
