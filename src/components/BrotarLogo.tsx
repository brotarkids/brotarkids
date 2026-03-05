import { Sprout } from "lucide-react";

interface BrotarLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizes = {
  sm: { icon: 20, text: "text-lg" },
  md: { icon: 28, text: "text-2xl" },
  lg: { icon: 40, text: "text-4xl" },
};

const BrotarLogo = ({ size = "md", showText = true }: BrotarLogoProps) => {
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2">
      <div className="gradient-sprout rounded-xl p-1.5 flex items-center justify-center">
        <Sprout size={s.icon} className="text-primary-foreground" />
      </div>
      {showText && (
        <span className={`font-display font-bold text-foreground ${s.text}`}>
          Brotar
        </span>
      )}
    </div>
  );
};

export default BrotarLogo;
