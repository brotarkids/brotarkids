import { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BrotarLogo from "@/components/BrotarLogo";
import { Mail, Lock, User, Sprout, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleDashboard } from "@/components/auth/ProtectedRoute";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, role, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [inviteData, setInviteData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const fetchInvite = async () => {
        // Use RPC to get invite details securely
        const { data, error } = await supabase
          .rpc('get_invite_by_token' as any, { token_input: token });

        if (error || !data) {
          console.error("Error fetching invite:", error);
          toast.error("Convite inválido ou expirado.");
        } else {
          const inviteObj = data as any;
          setInviteData({
            ...inviteObj,
            schools: { name: inviteObj.school_name }
          });
          setEmail(inviteObj.email);
        }
      };
      fetchInvite();
    }
  }, [token]);

  if (authLoading) return null;
  if (user) return <Navigate to={getRoleDashboard(role)} replace />;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    
    // 1. Sign Up
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: name,
          // If invite exists, pass these as metadata too, just in case trigger uses them
          ...(inviteData ? { 
            school_id: inviteData.school_id, 
            role: inviteData.role 
          } : {})
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // 2. If Invite, process it
    if (inviteData && authData.user) {
      try {
        // Use RPC to accept invite securely
        const { error: rpcError } = await supabase.rpc('accept_invite' as any, { 
            token_input: token 
        });

        if (rpcError) throw rpcError;

      toast.success("Conta criada e convite aceito com sucesso!");
      } catch (err: any) {
        console.error("Error processing invite:", err);
        toast.error("Erro ao processar convite: " + err.message);
      }
    } else {
      // 3. If no invite, just create profile (default role?)
      // Usually signups are invite-only for school roles, or public for superadmin/demos
      // For now, assume public signup creates a 'visitor' or 'parent' without school
      // But based on flow, superadmin creates school -> director. Director invites teachers. Teachers invite parents.
      // So public signup might be disabled or restricted.
      
      // Update profile with name
      await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("user_id", authData.user.id);
        
      toast.success("Conta criada com sucesso! Verifique seu email.");
    }

    // Send notification email to admin
    try {
      await supabase.functions.invoke('notify-signup', {
        body: {
          name,
          email,
          role: inviteData?.role || null,
          school_name: inviteData?.schools?.name || null,
        },
      });
    } catch (err) {
      console.error("Error sending signup notification:", err);
    }
    
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao cadastrar com Google");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrotarLogo size="lg" />
          </div>
          {inviteData ? (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-4">
              <p className="font-medium text-primary flex items-center justify-center gap-2">
                <Building2 size={18} />
                Convite: {inviteData.schools?.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Você está se cadastrando como <strong>{inviteData.role === 'admin' ? 'Diretor(a)' : (inviteData.role === 'teacher' || inviteData.role === 'professor') ? 'Professor(a)' : 'Responsável'}</strong>.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Crie sua conta e comece a usar</p>
          )}
        </div>

        <div className="bg-card rounded-2xl shadow-elevated border border-border p-6 space-y-5">
          {!inviteData && (
            <>
            <Button variant="outline" className="w-full h-11 gap-3 font-medium" onClick={handleGoogleSignup} disabled={loading}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Cadastrar com Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>
            </>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input id="name" placeholder="Seu nome" className="pl-10 h-11" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-10 h-11" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={!!inviteData}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10 h-11" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
            </div>
            <Button variant="hero" className="w-full" size="lg" type="submit" disabled={loading}>
              <Sprout size={18} />
              {loading ? "Criando conta..." : "Criar minha conta"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
