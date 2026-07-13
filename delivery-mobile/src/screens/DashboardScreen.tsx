import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "../lib/storage";
import { apiFetchAuth } from "../lib/api";
import { sendLocalNotification } from "../lib/notifications";

interface Order {
  _id: string; orderNumber: string; userName: string; userPhone: string; total: number;
  items: { name: string; quantity: number }[];
  deliveryAddress: { line1: string; city: string; state: string; pincode: string; lat?: number; lng?: number };
  createdAt: string;
}

export default function DashboardScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  const loadOrders = useCallback(async () => {
    const { token } = await getAuth();
    if (!token) return;
    const res = await apiFetchAuth("/api/delivery/orders", token);
    const data = await res.json();
    const newOrders = data.orders || [];

    // Check for new orders and notify
    if (lastCount > 0 && newOrders.length > lastCount) {
      sendLocalNotification("New Order Available!", `New order #${newOrders[0]?.orderNumber} — ₹${newOrders[0]?.total}`);
    }
    setLastCount(newOrders.length);
    setOrders(newOrders);
  }, [lastCount]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => { setRefreshing(true); await loadOrders(); setRefreshing(false); };

  async function handleAccept(orderId: string) {
    const { token } = await getAuth();
    if (!token) return;
    await apiFetchAuth(`/api/delivery/orders/${orderId}`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    Alert.alert("Accepted!", "Order assigned to you");
    loadOrders();
  }

  function openNavigation(destLat: number, destLng: number) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
    import("react-native").then(({ Linking }) => Linking.openURL(url));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Orders</Text>
        <Text style={styles.count}>{orders.length} orders</Text>
      </View>
      <FlatList data={orders} keyExtractor={(i) => i._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderNum}>#{item.orderNumber}</Text>
              <Text style={styles.total}>₹{item.total}</Text>
            </View>
            <View style={styles.customer}>
              <Ionicons name="person" size={14} color="#6b7280" />
              <Text style={styles.customerText}>{item.userName} · +91 {item.userPhone}</Text>
            </View>
            <View style={styles.customer}>
              <Ionicons name="location" size={14} color="#6b7280" />
              <Text style={styles.customerText}>{item.deliveryAddress.line1}, {item.deliveryAddress.city}</Text>
            </View>
            <View style={styles.items}>
              {item.items.map((it, i) => (
                <Text key={i} style={styles.itemText}>{it.name} × {it.quantity}</Text>
              ))}
            </View>
            <View style={styles.actions}>
              {item.deliveryAddress.lat && item.deliveryAddress.lng && (
                <TouchableOpacity style={styles.navBtn} onPress={() => openNavigation(item.deliveryAddress.lat!, item.deliveryAddress.lng!)}>
                  <Ionicons name="navigate" size={16} color="white" />
                  <Text style={styles.navBtnText}>Navigate</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item._id)}>
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="cube-outline" size={48} color="#d1d5db" /><Text style={styles.emptyText}>No available orders</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  count: { fontSize: 14, color: "#6b7280" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  orderNum: { fontSize: 16, fontWeight: "600", color: "#111827" },
  total: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  customer: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  customerText: { fontSize: 13, color: "#6b7280" },
  items: { marginBottom: 12 },
  itemText: { fontSize: 12, color: "#9ca3af" },
  actions: { flexDirection: "row", gap: 12 },
  navBtn: { flex: 1, backgroundColor: "#3b82f6", borderRadius: 12, paddingVertical: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  navBtnText: { color: "white", fontSize: 14, fontWeight: "600" },
  acceptBtn: { flex: 1, backgroundColor: "#111827", borderRadius: 12, paddingVertical: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  acceptBtnText: { color: "white", fontSize: 14, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#9ca3af", marginTop: 8 },
});
