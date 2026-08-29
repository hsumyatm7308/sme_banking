import { colors } from "@/lib/colors";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
}: StatsCardProps) {
  return (
    <div
      className="rounded-xl p-6 shadow-md transition-transform hover:scale-105"
      style={{ backgroundColor: colors.surface }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            {title}
          </p>
          <h3 className="text-2xl font-bold mt-2" style={{ color: colors.textPrimary }}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: colors.textLight }}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            {icon}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className="text-sm font-semibold"
            style={{
              color: trend === "up" ? colors.success : colors.error,
            }}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
          <span className="text-sm" style={{ color: colors.textLight }}>
            from last month
          </span>
        </div>
      )}
    </div>
  );
}
