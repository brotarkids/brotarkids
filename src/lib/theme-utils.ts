
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
          const dominantColor = colorThief.getColor(img);
          const palette = colorThief.getPalette(img, 6);

          const hexPalette = palette.map((rgb: number[]) =>
            tinycolor({ r: rgb[0], g: rgb[1], b: rgb[2] }).toHexString()
          );

          let primary = tinycolor({
            r: dominantColor[0],
            g: dominantColor[1],
            b: dominantColor[2],
          }).toHexString();

          if (tinycolor(primary).isLight()) {
            primary = tinycolor(primary).darken(10).toHexString();
          }

          const secondary = hexPalette.find(c => c !== primary && tinycolor.readability(primary, c) > 1.5) || hexPalette[1] || defaultPalette.secondary;
          const accent = hexPalette.find(c => c !== primary && c !== secondary && tinycolor(c).toHsl().s > 0.5) || hexPalette[2] || defaultPalette.accent;

          URL.revokeObjectURL(blobUrl);
          resolve({
            primary,
            secondary,
            accent,
            background: "#FFFFFF",
            foreground: "#1A1A1A",
            sidebar: "#FFFFFF",
            sidebarForeground: "#1A1A1A",
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
    const tc = tinycolor(color);
    const { h, s, l } = tc.toHsl();
    // Set standard hex variable
    root.style.setProperty(`--${name}-hex`, color);
    // Set HSL values for Tailwind (e.g., --primary: 142 76% 36%)
    // Tailwind uses: hsl(var(--primary))
    root.style.setProperty(`--${name}`, `${h} ${s * 100}% ${l * 100}%`);
    
    // Calculate foreground (text color) for this background
    // If background is dark, text should be light, and vice versa
    const isDark = tc.isDark();
    const fgColor = isDark ? "#FFFFFF" : "#1A1A1A";
    const fgTc = tinycolor(fgColor);
    const fgHsl = fgTc.toHsl();
    root.style.setProperty(`--${name}-foreground`, `${fgHsl.h} ${fgHsl.s * 100}% ${fgHsl.l * 100}%`);
  };

  setVariable("primary", palette.primary);
  setVariable("secondary", palette.secondary);
  setVariable("accent", palette.accent);
  
  // Update sidebar colors if needed
  setVariable("sidebar-primary", palette.primary);
  
  // We can also set specific sidebar background if we want
  // root.style.setProperty("--sidebar-background", ...);
};
