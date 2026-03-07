
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ColorPalette } from "@/lib/theme-utils";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeEditorProps {
  palette: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;
  onReset?: () => void;
}

export const ThemeEditor = ({ palette, onPaletteChange, onReset }: ThemeEditorProps) => {
  const handleChange = (key: keyof ColorPalette, value: string) => {
    onPaletteChange({
      ...palette,
      [key]: value,
    });
  };

  const colorFields = [
    { 
      key: "primary" as keyof ColorPalette, 
      label: "Cor Primária", 
      desc: "Botões principais, links ativos, destaques.",
      previewClass: "bg-primary text-primary-foreground"
    },
    { 
      key: "secondary" as keyof ColorPalette, 
      label: "Cor Secundária", 
      desc: "Elementos de apoio, fundos secundários.",
      previewClass: "bg-secondary text-secondary-foreground"
    },
    { 
      key: "accent" as keyof ColorPalette, 
      label: "Cor de Destaque", 
      desc: "Alertas, notificações, detalhes especiais.",
      previewClass: "bg-accent text-accent-foreground"
    },
    { 
      key: "sidebar" as keyof ColorPalette, 
      label: "Menu Lateral (Fundo)", 
      desc: "Cor de fundo da barra de navegação.",
      previewClass: "border border-border"
    },
    { 
      key: "sidebarForeground" as keyof ColorPalette, 
      label: "Menu Lateral (Texto)", 
      desc: "Cor do texto e ícones do menu.",
      previewClass: "border border-border"
    },
    { 
      key: "background" as keyof ColorPalette, 
      label: "Fundo da Página", 
      desc: "Cor de fundo geral da aplicação.",
      previewClass: "border border-border"
    },
    { 
      key: "foreground" as keyof ColorPalette, 
      label: "Texto Principal", 
      desc: "Cor do texto padrão da aplicação.",
      previewClass: "border border-border"
    },
  ];

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Personalizar Cores do Tema</h3>
        {onReset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2 text-xs">
                <RefreshCw className="mr-2 h-3 w-3" /> Restaurar Padrão
            </Button>
        )}
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {colorFields.map((field) => (
          <div key={field.key} className="flex items-center gap-3 bg-card p-2 rounded-md border shadow-sm">
            <div className="relative">
                <Input
                type="color"
                id={`color-${field.key}`}
                value={palette[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-10 h-10 p-1 rounded cursor-pointer"
                />
            </div>
            <div className="flex-1 min-w-0">
              <Label htmlFor={`color-${field.key}`} className="text-sm font-medium cursor-pointer block">
                {field.label}
              </Label>
              <p className="text-xs text-muted-foreground truncate" title={field.desc}>
                {field.desc}
              </p>
            </div>
            {/* Preview Box */}
            <div 
                className={`w-8 h-8 rounded text-[10px] flex items-center justify-center font-bold shadow-sm ${field.key === 'sidebar' ? '' : ''}`}
                style={{ 
                    backgroundColor: palette[field.key], 
                    color: field.key.includes('Foreground') || field.key === 'foreground' ? '#fff' : 
                           (field.key === 'background' || field.key === 'sidebar') ? palette.foreground : '#fff' 
                }}
            >
                Aa
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
