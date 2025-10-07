/**
 * EnergyHalo Component
 *
 * Displays a warm gradient halo indicating user energy levels.
 * Maps energy states to specific gradient combinations with accessibility labels.
 *
 * Usage:
 * ```tsx
 * <EnergyHalo level="MEDIUM" size="md" />
 * ```
 */

interface EnergyHaloProps {
  level: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const energyConfig = {
  NONE: {
    gradient: "from-neutral-200 via-neutral-100 to-neutral-50",
    label: "Energy level not specified",
    emoji: "⚪",
  },
  LOW: {
    gradient: "from-[#E6A1A6] via-brand-100 to-brand-50",
    label: "Low energy",
    emoji: "😴",
  },
  MEDIUM: {
    gradient: "from-[#E5B769] via-brand-200 to-brand-100",
    label: "Medium energy",
    emoji: "🙂",
  },
  HIGH: {
    gradient: "from-[#8FBF8F] via-brand-300 to-brand-200",
    label: "High energy",
    emoji: "💪",
  },
};

const sizeConfig = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export default function EnergyHalo({
  level,
  size = "md",
  className = "",
}: EnergyHaloProps) {
  const config = energyConfig[level];
  const sizeClass = sizeConfig[size];

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-sm transition-all motion-reduce:transition-none ${className}`}
      role="img"
      aria-label={config.label}
      title={config.label}
    >
      <span className="text-xl" aria-hidden="true">
        {config.emoji}
      </span>
    </div>
  );
}
