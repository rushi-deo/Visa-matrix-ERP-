/**
 * Premium UI Design System Utilities
 * Reusable Tailwind class combinations for consistent enterprise styling
 */

// Reusable Card Styles
export const cardBase = [
  "rounded-premium border bg-gradient-to-br from-white to-premium-platinum-50",
  "border-premium-silver-200/60 shadow-card",
  "transition-all duration-300",
].join(" ");

export const cardHover = [
  "hover:shadow-card-hover hover:border-premium-blue-300/40",
  "hover:before:from-premium-blue-500/5 hover:before:to-premium-blue-500/5",
].join(" ");

export const cardWithGradient = [
  cardBase,
  "group relative overflow-hidden",
  "before:absolute before:inset-0 before:bg-gradient-to-br before:from-premium-blue-500/0 before:to-premium-blue-500/0",
  "before:transition-all before:duration-300",
].join(" ");

export const cardAccent = [
  "absolute -right-12 -top-12 h-48 w-48 rounded-full",
  "bg-gradient-to-br from-premium-blue-500/10 to-premium-blue-600/5",
  "blur-3xl transition-all duration-300 group-hover:scale-125",
].join(" ");

// Button Styles
export const buttonPrimary = [
  "px-6 py-3 rounded-premium font-semibold text-sm",
  "bg-gradient-to-r from-premium-blue-500 to-premium-blue-600",
  "text-white shadow-card",
  "transition-all duration-300",
  "hover:shadow-card-hover hover:scale-105",
  "active:scale-95",
  "focus:ring-premium",
].join(" ");

export const buttonSecondary = [
  "px-6 py-3 rounded-premium font-semibold text-sm",
  "border border-premium-silver-200 bg-white text-premium-navy-700",
  "shadow-sm transition-all duration-300",
  "hover:bg-premium-platinum-100 hover:shadow-card",
  "focus:ring-premium active:scale-95",
].join(" ");

export const buttonGhost = [
  "px-6 py-3 rounded-premium font-semibold text-sm",
  "text-premium-navy-700 transition-all duration-300",
  "hover:bg-premium-platinum-100 hover:shadow-sm",
  "focus:ring-premium active:scale-95",
].join(" ");

export const buttonDanger = [
  "px-6 py-3 rounded-premium font-semibold text-sm",
  "bg-gradient-to-r from-premium-rose to-premium-rose/80",
  "text-white shadow-card",
  "transition-all duration-300",
  "hover:shadow-card-hover hover:scale-105",
  "active:scale-95",
  "focus:ring-premium",
].join(" ");

// Input & Form Styles
export const inputBase = [
  "w-full px-4 py-3 rounded-premium",
  "border border-premium-silver-200 bg-white",
  "text-premium-navy-700 placeholder:text-premium-silver-400",
  "transition-all duration-300",
  "hover:border-premium-blue-300/50 hover:bg-white",
  "focus:outline-none focus:ring-premium focus:border-premium-blue-400",
].join(" ");

export const selectBase = [
  "w-full px-4 py-3 rounded-premium",
  "border border-premium-silver-200 bg-white",
  "text-premium-navy-700",
  "transition-all duration-300",
  "hover:border-premium-blue-300/50",
  "focus:outline-none focus:ring-premium focus:border-premium-blue-400",
].join(" ");

export const textareaBase = [
  "w-full px-4 py-3 rounded-premium",
  "border border-premium-silver-200 bg-white",
  "text-premium-navy-700 placeholder:text-premium-silver-400",
  "transition-all duration-300 resize-none",
  "hover:border-premium-blue-300/50 hover:bg-white",
  "focus:outline-none focus:ring-premium focus:border-premium-blue-400",
].join(" ");

// Badge & Pill Styles
export const badgeSuccess = [
  "inline-flex items-center rounded-full px-3 py-1.5",
  "bg-premium-emerald/15 text-premium-emerald border border-premium-emerald/30",
  "text-xs font-semibold tracking-wide",
].join(" ");

export const badgeWarning = [
  "inline-flex items-center rounded-full px-3 py-1.5",
  "bg-premium-amber/15 text-premium-amber border border-premium-amber/30",
  "text-xs font-semibold tracking-wide",
].join(" ");

export const badgeDanger = [
  "inline-flex items-center rounded-full px-3 py-1.5",
  "bg-premium-rose/15 text-premium-rose border border-premium-rose/30",
  "text-xs font-semibold tracking-wide",
].join(" ");

export const badgeInfo = [
  "inline-flex items-center rounded-full px-3 py-1.5",
  "bg-premium-blue-100/60 text-premium-blue-800 border border-premium-blue-200/50",
  "text-xs font-semibold tracking-wide",
].join(" ");

// Icon Wrapper Styles
export const iconWrapper = [
  "flex items-center justify-center rounded-premium",
  "bg-gradient-to-br",
].join(" ");

export const iconWrapperBlue = [
  iconWrapper,
  "from-premium-blue-500/20 to-premium-blue-600/10",
  "text-premium-blue-600 border border-premium-blue-300/30",
].join(" ");

// Typography Utilities
export const headingH1 = "text-3xl font-semibold tracking-tight text-premium-navy-950";
export const headingH2 = "text-2xl font-semibold tracking-tight text-premium-navy-950";
export const headingH3 = "text-xl font-semibold tracking-tight text-premium-navy-950";
export const headingH4 = "text-lg font-semibold tracking-tight text-premium-navy-950";

export const textSmall = "text-sm text-premium-silver-500";
export const textMuted = "text-sm text-premium-silver-400";
export const textBase = "text-sm text-premium-navy-700";

// Layout & Container Styles
export const containerBase = [
  "mx-auto max-w-7xl px-4 md:px-6 lg:px-8",
].join(" ");

export const gridBase = [
  "grid gap-6",
].join(" ");

export const gridCols2 = "md:grid-cols-2";
export const gridCols3 = "lg:grid-cols-3";
export const gridCols4 = "lg:grid-cols-4";

// Divider Styles
export const divider = "border-b border-premium-silver-200/50";
export const dividerLight = "border-b border-premium-silver-200/30";

// Shadow Depth
export const shadowNone = "shadow-none";
export const shadowXs = "shadow-xs";
export const shadowSm = "shadow-sm";
export const shadowMd = "shadow-card";
export const shadowLg = "shadow-card-lg";
export const shadowXl = "shadow-card-hover";
export const shadowGlow = "shadow-glow";

// Backdrop Blur
export const glassEffect = [
  "bg-white/80 backdrop-blur-md border border-white/20",
  "transition-all duration-300",
].join(" ");

export const glassDark = [
  "bg-premium-navy-900/70 backdrop-blur-md border border-premium-blue-500/10",
  "transition-all duration-300",
].join(" ");

// Focus Ring Utilities
export const focusRing = "focus:outline-none focus:ring-premium";
export const focusRingSmall = "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-blue-500";

// Animation Classes
export const transitionSmooth = "transition-all duration-300 ease-in-out";
export const transitionFast = "transition-all duration-200 ease-in-out";

// Gradient Backgrounds
export const gradientPlatinum = "bg-gradient-to-br from-premium-platinum-50 via-premium-platinum-100 to-premium-platinum-50";
export const gradientMetallic = "bg-gradient-to-br from-white to-premium-platinum-50";
export const gradientNavy = "bg-gradient-to-b from-premium-navy-900 to-premium-navy-800";
export const gradientBlue = "bg-gradient-to-r from-premium-blue-400 to-premium-blue-500";

// Utility Function: Combine Multiple Classes
export function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Utility Function: Get Status Color
export function getStatusColor(status: string): string {
  const normalized = status.toLowerCase();
  
  if (normalized.includes("approved") || normalized.includes("issued")) {
    return badgeSuccess;
  }
  if (normalized.includes("rejected")) {
    return badgeDanger;
  }
  if (normalized.includes("processing") || normalized.includes("submitted")) {
    return badgeWarning;
  }
  if (normalized.includes("pending")) {
    return badgeInfo;
  }
  
  return badgeInfo;
}

// Utility Function: Get Icon Wrapper by Theme
export function getIconWrapperByTheme(theme: "blue" | "success" | "warning" | "danger" = "blue"): string {
  const themes = {
    blue: iconWrapperBlue,
    success: "flex items-center justify-center rounded-premium from-premium-emerald/20 to-premium-emerald/10 text-premium-emerald border border-premium-emerald/30",
    warning: "flex items-center justify-center rounded-premium from-premium-amber/20 to-premium-amber/10 text-premium-amber border border-premium-amber/30",
    danger: "flex items-center justify-center rounded-premium from-premium-rose/20 to-premium-rose/10 text-premium-rose border border-premium-rose/30",
  };
  
  return themes[theme];
}

export default {
  // Cards
  cardBase,
  cardHover,
  cardWithGradient,
  cardAccent,
  // Buttons
  buttonPrimary,
  buttonSecondary,
  buttonGhost,
  buttonDanger,
  // Forms
  inputBase,
  selectBase,
  textareaBase,
  // Badges
  badgeSuccess,
  badgeWarning,
  badgeDanger,
  badgeInfo,
  // Icons
  iconWrapper,
  iconWrapperBlue,
  // Typography
  headingH1,
  headingH2,
  headingH3,
  headingH4,
  textSmall,
  textMuted,
  textBase,
  // Layout
  containerBase,
  gridBase,
  gridCols2,
  gridCols3,
  gridCols4,
  divider,
  dividerLight,
  // Shadows
  shadowNone,
  shadowXs,
  shadowSm,
  shadowMd,
  shadowLg,
  shadowXl,
  shadowGlow,
  // Effects
  glassEffect,
  glassDark,
  // Focus
  focusRing,
  focusRingSmall,
  // Animations
  transitionSmooth,
  transitionFast,
  // Gradients
  gradientPlatinum,
  gradientMetallic,
  gradientNavy,
  gradientBlue,
  // Functions
  cx,
  getStatusColor,
  getIconWrapperByTheme,
};
