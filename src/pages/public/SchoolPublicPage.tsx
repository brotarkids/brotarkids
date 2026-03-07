import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Users, Sprout, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SchoolPublicPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: school, isLoading, error } = useQuery({
    queryKey: ["school-public", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-2xl p-8 space-y-6">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Sprout className="mx-auto text-muted-foreground" size={48} />
          <h1 className="text-2xl font-bold text-foreground">Escola não encontrada</h1>
          <p className="text-muted-foreground">Verifique o endereço e tente novamente.</p>
          <Link to="/">
            <Button variant="outline">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = school.primary_color || "#16a34a";
  const workingHours = school.working_hours as { open?: string; close?: string } | null;

  return (
    <>
      <Helmet>
        <title>{school.name} | Brotar Kids</title>
        <meta name="description" content={`${school.name} - Gestão escolar inteligente com Brotar Kids. ${school.city ? `Localizada em ${school.city}${school.state ? `/${school.state}` : ''}` : ''}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div
          className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)` }}
        >
          <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
            {school.logo_url ? (
              <img
                src={school.logo_url}
                alt={`Logo ${school.name}`}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-contain mx-auto mb-6 shadow-lg border border-border bg-card"
              />
            ) : (
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-4xl sm:text-5xl font-bold text-white">
                  {school.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {school.name}
            </h1>

            {school.director_name && (
              <p className="text-muted-foreground mb-6">
                Direção: {school.director_name}
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link to="/login">
                <Button
                  size="lg"
                  className="gap-2"
                  style={{ backgroundColor: primaryColor, color: "white" }}
                >
                  Acessar plataforma <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-2 gap-4">
            {school.address && (
              <InfoCard
                icon={<MapPin size={20} />}
                label="Endereço"
                value={`${school.address}${school.city ? `, ${school.city}` : ''}${school.state ? ` - ${school.state}` : ''}`}
                color={primaryColor}
              />
            )}
            {school.phone && (
              <InfoCard
                icon={<Phone size={20} />}
                label="Telefone"
                value={school.phone}
                color={primaryColor}
              />
            )}
            {school.email && (
              <InfoCard
                icon={<Mail size={20} />}
                label="Email"
                value={school.email}
                color={primaryColor}
              />
            )}
            {workingHours?.open && workingHours?.close && (
              <InfoCard
                icon={<Clock size={20} />}
                label="Horário"
                value={`${workingHours.open} às ${workingHours.close}`}
                color={primaryColor}
              />
            )}
            {school.teacher_student_ratio && (
              <InfoCard
                icon={<Users size={20} />}
                label="Proporção Professor/Aluno"
                value={`1:${school.teacher_student_ratio}`}
                color={primaryColor}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Plataforma gerenciada por{" "}
            <Link to="/" className="font-semibold hover:underline" style={{ color: primaryColor }}>
              Brotar Kids
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => (
  <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
    <div
      className="p-2.5 rounded-lg shrink-0"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-foreground font-medium mt-0.5">{value}</p>
    </div>
  </div>
);

export default SchoolPublicPage;
