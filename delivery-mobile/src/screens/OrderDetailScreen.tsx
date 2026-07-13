import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "../lib/storage";
import { apiFetchAuth } from "../lib/api";

interface Order {
  _id: string; orderNumber: string; userName: string; userPhone: string; total: number; status: string;
  items: { name: string; quantity: number; price: number }[];
  deliveryAddress: { line1: string; city: string; state: string; pincode: string; lat?: number; lng?: number };
  deliveryPartner?: { eta: string };
}

export default function OrderDetailScreen({ route }: any) {
  const { id } = route.params;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    getAuth().then(({ token }) => {
      if (token) apiFetchAuth(`/api/delivery/orders/${id}`, token).then((r) => r.json()).then((d) => setOrder(d.order));
    });
  }, [id]);

  if (!order) return <View style={styles.center}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order #{order.orderNumber}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Customer</Text>
        <Text style={styles.text}>{order.userName}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.userPhone}`)}>
          <Text style={styles.phone}>+91 {order.userPhone}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Address</Text>
        <Text style={styles.text}>{order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</Text>
        {order.deliveryAddress.lat && order.deliveryAddress.lng && (
          <TouchableOpacity style={styles.mapBtn} onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryAddress.lat},${order.deliveryAddress.lng}&travelmode=driving`)}>
            <Ionicons name="navigate" size={16} color="white" />
            <Text style={styles.mapBtnText}>Navigate</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Items</Text>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>× {item.quantity}</Text>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.total}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", padding: 16, color: "#111827" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 },
  text: { fontSize: 14, color: "#6b7280" },
  phone: { fontSize: 14, color: "#3b82f6", fontWeight: "600", marginTop: 4 },
  mapBtn: { backgroundColor: "#3b82f6", borderRadius: 12, paddingVertical: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 12 },
  mapBtnText: { color: "white", fontSize: 14, fontWeight: "600" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  itemName: { flex: 1, fontSize: 14, color: "#111827" },
  itemQty: { fontSize: 14, color: "#6b7280", marginHorizontal: 12 },
  itemPrice: { fontSize: 14, fontWeight: "600" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalValue: { fontSize: 16, fontWeight: "bold" },
});
