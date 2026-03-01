export const COLORS = {
  primary: "#231a73",
  primaryLight: "#3d34a5",
  primaryDark: "#1a1357",
  secondary: "#eeeeee",
  secondaryDark: "#d4d4d4",
  backgroundLight: "#f6f6f8",
  backgroundDark: "#14131f",
  white: "#ffffff",
  black: "#000000",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
} as const;

export const COMMISSION_RATE = 0.1; // 10%
export const NEGATIVE_WALLET_LIMIT = -200; // SAR
export const DEFAULT_INSPECTION_FEE = 50; // SAR
export const DEFAULT_WARRANTY_DAYS = 30;
export const MAX_PHOTOS = 5;

export const SERVICE_ICONS: Record<string, string> = {
  plumbing: "water-outline",
  electrical: "flash-outline",
  hvac: "thermometer-outline",
  painting: "color-palette-outline",
  carpentry: "hammer-outline",
  cleaning: "sparkles-outline",
  general: "build-outline",
};
