
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { extractPaletteFromLogo, ColorPalette } from "@/lib/theme-utils";
import { toast } from "sonner";

interface LogoUploadProps {
  onLogoChange: (url: string | null) => void;
  onPaletteExtracted: (palette: ColorPalette) => void;
  currentLogo?: string | null;
  folder?: string;
  bucket?: string;
}

export const LogoUpload = ({ onLogoChange, onPaletteExtracted, currentLogo, folder = "logos", bucket = "logos" }: LogoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 1024 * 1024) { // 1MB
      toast.error("O logo deve ter no máximo 1MB.");
      return;
    }

    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      toast.error("Formato inválido. Use PNG, JPEG ou SVG.");
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = fileName; // folder is part of path

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from(bucket) 
        .upload(filePath, file, {
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onLogoChange(publicUrl);

      // Extract Palette
      const palette = await extractPaletteFromLogo(publicUrl);
      onPaletteExtracted(palette);
      toast.success("Logo enviado e paleta extraída com sucesso!");

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onLogoChange(null);
    // Ideally delete from storage too, but for now just clear reference
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative group w-32 h-32 rounded-lg border overflow-hidden bg-white/50 flex items-center justify-center">
            <img src={preview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
            <UploadCloud size={32} className="mb-2 opacity-50" />
            <span className="text-xs text-center px-2">Arraste ou clique</span>
          </div>
        )}
        
        <div className="flex-1 space-y-2">
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <div className="flex items-center gap-2">
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    disabled={isUploading}
                    onClick={() => document.getElementById("logo-upload")?.click()}
                >
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUploading ? "Enviando..." : "Escolher Logo"}
                </Button>
                <span className="text-xs text-muted-foreground">PNG, JPG ou SVG (Max 1MB)</span>
              </div>
            </Label>
            <Input
                id="logo-upload"
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
            />
        </div>
      </div>
    </div>
  );
};
