import logoFull from "@/assets/logo-brotar.png";
import iconBrotar from "@/assets/icon-brotar.png";

interface BrotarLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const heights = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
};

const iconSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const BrotarLogo = ({ size = "md", showText = true }: BrotarLogoProps) => {
  if (showText) {
    return <img src={logoFull} alt="Brotar" className={`${heights[size]} w-auto`} />;
  }
  return <img src={iconBrotar} alt="Brotar" className={`${iconSizes[size]} rounded-xl`} />;
};

export default BrotarLogo;
