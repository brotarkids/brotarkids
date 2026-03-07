
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { applyTheme, ColorPalette, defaultPalette } from "@/lib/theme-utils";

interface ThemeContextType {
  logoUrl: string | null;
  palette: ColorPalette;
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  logoUrl: null,
  palette: defaultPalette,
  isLoading: true,
  refreshTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<ColorPalette>(defaultPalette);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTheme = async () => {
    try {
      // 1. Check local storage first for immediate feedback
      const cachedTheme = localStorage.getItem("brotar_theme");
      if (cachedTheme) {
        const parsed = JSON.parse(cachedTheme);
        setLogoUrl(parsed.logoUrl);
        setPalette(parsed.palette);
        applyTheme(parsed.palette);
      }

      if (!user) {
        setIsLoading(false);
        return;
      }

      // 2. Fetch from DB if user is logged in
      // We need to get the school_id from the profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .single();

      if (profile?.school_id) {
        const { data: school } = await supabase
          .from("schools")
          .select("logo_url, primary_color, color_palette")
          .eq("id", profile.school_id)
          .single();

        if (school) {
          let newPalette: ColorPalette;

          if (school.color_palette) {
            newPalette = school.color_palette as unknown as ColorPalette;
          } else {
            newPalette = { ...defaultPalette };
            // Fallback if only primary_color is set (legacy)
            if (school.primary_color) {
              newPalette.primary = school.primary_color;
            }
          }

          console.log("Applying theme for school:", school.logo_url, newPalette);

          setLogoUrl(school.logo_url);
          setPalette(newPalette);
          applyTheme(newPalette);

          // Cache it
          localStorage.setItem(
            "brotar_theme",
            JSON.stringify({ logoUrl: school.logo_url, palette: newPalette })
          );
        }
      }
    } catch (error) {
      console.error("Error fetching theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, [user, session]);

  return (
    <ThemeContext.Provider value={{ logoUrl, palette, isLoading, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
