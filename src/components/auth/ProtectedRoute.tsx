import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sprout } from "lucide-react";

type AppRole = "superadmin" | "admin" | "professor" | "responsavel";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

const roleRedirects: Record<AppRole, string> = {
  superadmin: "/superadmin",
  admin: "/admin",
  professor: "/professor",
  responsavel: "/responsavel",
};

export const getRoleDashboard = (role: AppRole | null): string => {
  if (!role) return "/login";
  return roleRedirects[role] || "/responsavel";
};

const LoadingScreen = () => (
  <div className="min-h-screen gradient-hero flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 animate-pulse">
      <div className="gradient-sprout rounded-2xl p-3">
        <Sprout size={32} className="text-primary-foreground" />
      </div>
      <span className="font-display font-bold text-muted-foreground">Carregando...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={getRoleDashboard(role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
