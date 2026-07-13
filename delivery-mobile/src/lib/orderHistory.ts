import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "delivery_order_history";

export interface OrderHistoryItem {
  _id: string;
  orderNumber: string;
  userName: string;
  userPhone: string;
  total: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  deliveryAddress: { line1: string; city: string; state: string; pincode: string; lat?: number; lng?: number };
  acceptedAt: string;
  deliveredAt?: string;
}

export async function saveOrderToHistory(order: OrderHistoryItem) {
  const existing = await getOrderHistory();
  const filtered = existing.filter((o) => o._id !== order._id);
  filtered.unshift(order);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 100))); // Keep last 100
}

export async function getOrderHistory(): Promise<OrderHistoryItem[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function clearOrderHistory() {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
