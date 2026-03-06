
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
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        // Get dominant color
        const dominantColor = colorThief.getColor(img);
        // Get palette (5 colors)
        const palette = colorThief.getPalette(img, 6);

        // Convert to hex
        const hexPalette = palette.map((rgb: number[]) =>
          tinycolor({ r: rgb[0], g: rgb[1], b: rgb[2] }).toHexString()
        );

        // Construct semantic palette
        // 1. Primary: Use dominant color or first vibrant color
        let primary = tinycolor({
          r: dominantColor[0],
          g: dominantColor[1],
          b: dominantColor[2],
        }).toHexString();

        // Ensure primary has good contrast with white (for buttons)
        // If not, darken it
        if (tinycolor(primary).isLight()) {
          // If too light, maybe pick another from palette or darken
          primary = tinycolor(primary).darken(10).toHexString();
        }

        // 2. Secondary: Pick a color that contrasts with primary but is distinct
        const secondary = hexPalette.find(c => c !== primary && tinycolor.readability(primary, c) > 1.5) || hexPalette[1] || defaultPalette.secondary;

        // 3. Accent: Pick the most vibrant/saturated remaining color
        const accent = hexPalette.find(c => c !== primary && c !== secondary && tinycolor(c).toHsl().s > 0.5) || hexPalette[2] || defaultPalette.accent;

        // 4. Sidebar: Usually white or dark, let's derive from primary but very dark or very light
        // For simplicity, keep white for clean look or use very light primary
        const sidebar = "#FFFFFF";
        const sidebarForeground = "#1A1A1A";

        resolve({
            primary,
            secondary,
            accent,
            background: "#FFFFFF",
            foreground: "#1A1A1A",
            sidebar,
            sidebarForeground
        });
      } catch (error) {
        console.error("Error extracting colors:", error);
        resolve(defaultPalette);
      }
    };

    img.onerror = (err) => {
        console.error("Error loading image for color extraction:", err);
        resolve(defaultPalette);
    };
  });
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
