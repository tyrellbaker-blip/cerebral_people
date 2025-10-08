interface AdminStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon?: string;
}

export default function AdminStatCard({
  title,
  value,
  description,
  trend,
  icon,
}: AdminStatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-ink-500">{description}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
              <span className="text-xs text-ink-500">vs last period</span>
            </div>
          )}
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
}
