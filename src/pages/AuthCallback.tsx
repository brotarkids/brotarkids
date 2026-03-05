import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleDashboard } from "@/components/auth/ProtectedRoute";
import { Sprout } from "lucide-react";

const AuthCallback = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Small delay to let role fetch complete
      const timer = setTimeout(() => {
        navigate(getRoleDashboard(role), { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, role, navigate]);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="gradient-sprout rounded-2xl p-3">
          <Sprout size={32} className="text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-muted-foreground">Autenticando...</span>
      </div>
    </div>
  );
};

export default AuthCallback;
