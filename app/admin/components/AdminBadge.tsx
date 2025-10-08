interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export default function AdminBadge({
  children,
  variant = "default",
}: AdminBadgeProps) {
  const variants = {
    default: "bg-neutral-100 text-neutral-700 border-neutral-200",
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
