/**
 * Card Styles and Utilities
 *
 * Reusable styling constants for the Cerebral People design system.
 * Provides glass effect cards, dividers, and consistent styling patterns.
 *
 * Usage:
 * ```tsx
 * import { glassCard, hairlineDivider } from './cardStyles';
 *
 * <div className={glassCard}>...</div>
 * <hr className={hairlineDivider} />
 * ```
 */

/**
 * Glass Card Effect
 * Translucent card with soft shadows and backdrop blur
 */
export const glassCard =
  "bg-white/80 backdrop-blur-sm rounded-[1rem] shadow-[0_6px_20px_rgba(32,26,23,.08)] border border-neutral-200/50 transition-all motion-reduce:transition-none";

/**
 * Glass Card with Hover Effect
 * Adds lift animation on hover
 */
export const glassCardHover =
  "bg-white/80 backdrop-blur-sm rounded-[1rem] shadow-[0_6px_20px_rgba(32,26,23,.08)] border border-neutral-200/50 transition-all hover:shadow-[0_0_0_1px_rgba(32,26,23,.06),0_12px_30px_rgba(32,26,23,.08)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:transform-none";

/**
 * Solid Card
 * Opaque card with soft shadows (for content that needs more contrast)
 */
export const solidCard =
  "bg-white rounded-[1rem] shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-neutral-200 transition-all motion-reduce:transition-none";

/**
 * Hairline Divider
 * Subtle gradient horizontal rule
 */
export const hairlineDivider =
  "h-px border-0 bg-gradient-to-r from-transparent via-neutral-300 to-transparent";

/**
 * Focus Ring (for custom interactive elements)
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/55 focus-visible:ring-offset-2";

/**
 * Button Styles
 */
export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-[0.75rem] bg-brand-500 px-6 py-2.5 text-base font-medium text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none";

export const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-[0.75rem] bg-neutral-100 px-6 py-2.5 text-base font-medium text-ink-900 shadow-sm transition-all hover:bg-neutral-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none";

export const buttonGhost =
  "inline-flex items-center justify-center gap-2 rounded-[0.75rem] px-4 py-2 text-base font-medium text-ink-700 transition-colors hover:bg-neutral-100 hover:text-ink-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transition-none motion-reduce:active:transform-none";

/**
 * Input Styles
 */
export const inputBase =
  "w-full rounded-[0.75rem] border border-neutral-300 bg-white px-4 py-2.5 text-base text-ink-900 placeholder:text-ink-500 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-neutral-100 disabled:cursor-not-allowed motion-reduce:transition-none";

export const textareaBase =
  "w-full rounded-[0.75rem] border border-neutral-300 bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-500 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-neutral-100 disabled:cursor-not-allowed resize-none motion-reduce:transition-none [text-wrap:pretty]";

/**
 * Badge Styles
 */
export const badgePrimary =
  "inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800";

export const badgeSecondary =
  "inline-flex items-center gap-1 rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-800";

export const badgeSuccess =
  "inline-flex items-center gap-1 rounded-full bg-[#8FBF8F]/20 px-3 py-1 text-xs font-medium text-[#4A7C4A]";

/**
 * Energy Level Styling Helpers
 */
export const energyLevelToGradient = (level: number | null): string => {
  switch (level) {
    case 1:
      return "from-[#E6A1A6]/10 to-brand-50";
    case 2:
      return "from-[#E5B769]/10 to-brand-100";
    case 3:
      return "from-brand-200/30 to-brand-100";
    case 4:
      return "from-[#8FBF8F]/20 to-brand-200";
    default:
      return "from-neutral-50 to-white";
  }
};

export const energyLevelToEmoji = (level: number | null): string => {
  switch (level) {
    case 1:
      return "😴";
    case 2:
      return "😐";
    case 3:
      return "🙂";
    case 4:
      return "💪";
    default:
      return "";
  }
};

export const energyLevelToLabel = (level: number | null): string => {
  switch (level) {
    case 1:
      return "Low energy";
    case 2:
      return "Medium-low energy";
    case 3:
      return "Medium-high energy";
    case 4:
      return "High energy";
    default:
      return "Energy level not specified";
  }
};
