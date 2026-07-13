import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "../lib/storage";
import { apiFetchAuth } from "../lib/api";

interface Order {
  _id: string; orderNumber: string; status: string; total: number;
  items: { name: string; price: number; quantity: number; image: string }[];
  deliveryAddress: { line1: string; city: string; state: string; pincode: string };
  deliveryPartner?: { name: string; phone: string; eta: string };
  createdAt: string;
}

const STAGES = ["placed", "confirmed", "packed", "dispatched", "out_for_delivery", "delivered"];

export default function OrderDetailScreen({ route }: any) {
  const { id } = route.params;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    getAuth().then(({ token }) => {
      if (token) {
        apiFetchAuth(`/api/orders/${id}`, token).then((r) => r.json()).then((d) => setOrder(d.order));
      }
    });
    const interval = setInterval(() => {
      getAuth().then(({ token }) => {
        if (token) apiFetchAuth(`/api/orders/${id}`, token).then((r) => r.json()).then((d) => setOrder(d.order));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (!order) return <View style={styles.center}><Text>Loading...</Text></View>;

  const currentIndex = STAGES.indexOf(order.status);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order #{order.orderNumber}</Text>

      {/* Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Progress</Text>
        {STAGES.map((stage, i) => {
          const done = i <= currentIndex;
          return (
            <View key={stage} style={styles.progressRow}>
              <View style={[styles.dot, done ? styles.dotActive : styles.dotInactive]}>
                {done && <Ionicons name="checkmark" size={12} color="white" />}
              </View>
              <Text style={[styles.stageText, done ? styles.stageDone : styles.stagePending]}>
                {stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Delivery Partner */}
      {order.deliveryPartner && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Partner</Text>
          <Text style={styles.infoText}>{order.deliveryPartner.name} · +91 {order.deliveryPartner.phone}</Text>
          {order.deliveryPartner.eta && <Text style={styles.eta}>ETA: {order.deliveryPartner.eta}</Text>}
        </View>
      )}

      {/* Items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Items</Text>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Image source={{ uri: item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100" }} style={styles.itemImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>× {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.total}</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivering to</Text>
        <Text style={styles.infoText}>{order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", padding: 16, color: "#111827" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 12 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  dot: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  dotActive: { backgroundColor: "#059669" },
  dotInactive: { backgroundColor: "#e5e7eb" },
  stageText: { fontSize: 14 },
  stageDone: { color: "#111827", fontWeight: "500" },
  stagePending: { color: "#9ca3af" },
  infoText: { fontSize: 14, color: "#6b7280" },
  eta: { fontSize: 14, color: "#f59e0b", fontWeight: "600", marginTop: 4 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  itemImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#f3f4f6" },
  itemName: { fontSize: 14, fontWeight: "500" },
  itemQty: { fontSize: 12, color: "#9ca3af" },
  itemPrice: { fontSize: 14, fontWeight: "600" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalValue: { fontSize: 16, fontWeight: "bold" },
});
