import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        toast({ title: "Notificações desativadas", description: "Você não receberá mais alertas push." });
      }
    } else {
      const success = await subscribe();
      if (success) {
        toast({ title: "Notificações ativadas! 🔔", description: "Você será avisado quando houver novos registros." });
      } else if (permission === "denied") {
        toast({
          title: "Permissão bloqueada",
          description: "Habilite as notificações nas configurações do navegador.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      className="gap-2"
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          Desativar notificações
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Ativar notificações
        </>
      )}
    </Button>
  );
}
