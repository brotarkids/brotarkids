import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAInstallBanner() {
  const { showBanner, install, dismissBanner } = usePWAInstall();

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-fade-up">
      <div className="rounded-xl border border-border bg-card p-4 shadow-elevated">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-sprout">
            <Download className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-foreground">
              Instale o Brotar
            </p>
            <p className="text-sm text-muted-foreground">
              Adicione à tela inicial para acesso rápido!
            </p>
          </div>
          <button onClick={dismissBanner} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={install} size="sm" className="flex-1">
            Instalar agora
          </Button>
          <Button onClick={dismissBanner} variant="outline" size="sm">
            Depois
          </Button>
        </div>
      </div>
    </div>
  );
}
