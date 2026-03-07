
import tinycolor from "tinycolor2";
import ColorThief from "color-thief-browser";

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  sidebar: string;
  sidebarForeground: string;
}

export const defaultPalette: ColorPalette = {
  primary: "#98E5A1", // Broto Suave Primary
  secondary: "#B6D9E8", // Broto Suave Secondary
  accent: "#F4A261", // Example accent
  background: "#FFFFFF",
  foreground: "#1A1A1A",
  sidebar: "#FFFFFF",
  sidebarForeground: "#1A1A1A",
};

export const extractPaletteFromLogo = async (
  imageUrl: string
): Promise<ColorPalette> => {
  try {
    // Fetch image as blob to avoid CORS/tainted canvas issues
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          // Get palette (10 colors to have more options)
          const rawPalette = colorThief.getPalette(img, 10);

          // Helper to convert RGB array to tinycolor
          const toTc = (rgb: number[]) => tinycolor({ r: rgb[0], g: rgb[1], b: rgb[2] });

          // Filter out colors that are too white, too black, or too gray for the Primary color
          // unless the image is grayscale
          const validColors = rawPalette.filter((rgb: number[]) => {
            const tc = toTc(rgb);
            const { s, l } = tc.toHsl();
            // Filter out near white (l > 0.9), near black (l < 0.1), low saturation (s < 0.1)
            return l < 0.95 && l > 0.05 && s > 0.1;
          });

          // If we filtered everything out (e.g. black and white logo), fall back to raw palette
          const candidates = validColors.length > 0 ? validColors : rawPalette;

          // Sort candidates by saturation (most vibrant first)
          candidates.sort((a: number[], b: number[]) => {
            return toTc(b).toHsl().s - toTc(a).toHsl().s;
          });

          // 1. Primary: Pick the most vibrant valid color
          let primary = candidates.length > 0 
            ? toTc(candidates[0]).toHexString() 
            : defaultPalette.primary;

          // Ensure primary has good contrast with white (for buttons)
          if (tinycolor(primary).isLight() && tinycolor.readability(primary, "#FFFFFF") < 2) {
             primary = tinycolor(primary).darken(10).toHexString();
          }

          // 2. Secondary: Find a color that contrasts with primary
          let secondary = defaultPalette.secondary;
          const primaryTc = tinycolor(primary);
          
          // Look for a color in the palette that is distinct from primary
          const secondaryCandidate = candidates.find((rgb: number[]) => {
              const tc = toTc(rgb);
              const hex = tc.toHexString();
              if (hex === primary) return false;
              return tinycolor.readability(primary, hex) > 1.5; // visible against primary
          });

          if (secondaryCandidate) {
              secondary = toTc(secondaryCandidate).toHexString();
          } else {
              secondary = primaryTc.lighten(20).toHexString(); // Monochromatic fallback
          }

          // 3. Accent: Pick another distinct vibrant color
          let accent = defaultPalette.accent;
          const accentCandidate = candidates.find((rgb: number[]) => {
              const hex = toTc(rgb).toHexString();
              return hex !== primary && hex !== secondary;
          });
          
          if (accentCandidate) {
              accent = toTc(accentCandidate).toHexString();
          } else {
               accent = primaryTc.complement().toHexString();
          }

          // 4. Background/Foreground
          const background = "#FFFFFF";
          const foreground = "#1A1A1A";
          const sidebar = "#FFFFFF";
          const sidebarForeground = "#1A1A1A";

          URL.revokeObjectURL(blobUrl);
          resolve({
            primary,
            secondary,
            accent,
            background,
            foreground,
            sidebar,
            sidebarForeground
          });
        } catch (error) {
          console.error("Error extracting colors:", error);
          URL.revokeObjectURL(blobUrl);
          resolve(defaultPalette);
        }
      };

      img.onerror = () => {
        console.error("Error loading blob image for color extraction");
        URL.revokeObjectURL(blobUrl);
        resolve(defaultPalette);
      };

      img.src = blobUrl;
    });
  } catch (error) {
    console.error("Error fetching image for color extraction:", error);
    return defaultPalette;
  }
};

export const applyTheme = (palette: ColorPalette) => {
  const root = document.documentElement;
  
  // Helper to set CSS variable and HSL version for Tailwind
  const setVariable = (name: string, color: string) => {
    root.style.setProperty(name, color);
    const tc = tinycolor(color);
    const { h, s, l } = tc.toHsl();
    // Tailwind uses space-separated HSL values (e.g. "222.2 47.4% 11.2%")
    root.style.setProperty(name.replace("--", "--"), `${h} ${s * 100}% ${l * 100}%`);
  };

  setVariable("--primary", palette.primary);
  setVariable("--secondary", palette.secondary);
  setVariable("--accent", palette.accent);
  setVariable("--background", palette.background);
  setVariable("--foreground", palette.foreground);
  setVariable("--sidebar", palette.sidebar);
  setVariable("--sidebar-foreground", palette.sidebarForeground);
};
