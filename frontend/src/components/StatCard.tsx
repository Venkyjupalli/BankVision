import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>

        <div
          className="stat-icon"
          style={{
            backgroundColor: `${color}15`,
            color,
          }}
        >
          <Icon size={21} />
        </div>
      </div>

      <h2 className="stat-value">{value}</h2>

      <p className="stat-description">{description}</p>
    </div>
  );
}