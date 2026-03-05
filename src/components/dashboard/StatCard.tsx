import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

const StatCard = ({ icon, label, value, sub, color = "bg-primary/15" }: StatCardProps) => (
  <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
    <div className="flex items-center gap-3 mb-3">
      <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
    <div className="text-2xl font-bold font-display text-foreground">{value}</div>
    {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
  </div>
);

export default StatCard;
