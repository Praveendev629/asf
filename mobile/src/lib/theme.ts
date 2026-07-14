export const COLORS = {
  primary: "#059669",
  primaryDark: "#047857",
  primaryLight: "#d1fae5",
  accent: "#f59e0b",
  danger: "#ef4444",
  white: "#ffffff",
  background: "#f9fafb",
  card: "#ffffff",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  text: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  blue: "#3b82f6",
  indigo: "#6366f1",
  amber: "#f59e0b",
  purple: "#a855f7",
  orange: "#f97316",
  green: "#22c55e",
};

export const DELIVERY_FEE = 29;
export const FREE_DELIVERY_THRESHOLD = 499;

export function getDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
}

export const STAGE_META: Record<string, { label: string; color: string; bgColor: string }> = {
  placed: { label: "Placed", color: COLORS.blue, bgColor: "#eff6ff" },
  confirmed: { label: "Confirmed", color: COLORS.indigo, bgColor: "#eef2ff" },
  packed: { label: "Packed", color: COLORS.amber, bgColor: "#fffbeb" },
  dispatched: { label: "Dispatched", color: COLORS.purple, bgColor: "#faf5ff" },
  out_for_delivery: { label: "Out for Delivery", color: COLORS.orange, bgColor: "#fff7ed" },
  delivered: { label: "Delivered", color: COLORS.green, bgColor: "#f0fdf4" },
};

export const STAGE_ORDER = ["placed", "confirmed", "packed", "dispatched", "out_for_delivery", "delivered"];
