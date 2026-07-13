import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CartItem {
  productId: string; name: string; image: string; price: number; mrp: number; unit: string; quantity: number; stock: number;
}

export default function CartScreen({ navigation }: any) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("asf_cart").then((raw) => { if (raw) setItems(JSON.parse(raw)); });
  }, []);

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) return setItems((prev) => prev.filter((i) => i.productId !== productId));
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: qty } : i));
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 29;
  const total = subtotal + deliveryFee;

  useEffect(() => { AsyncStorage.setItem("asf_cart", JSON.stringify(items)); }, [items]);

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="cart-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.shopBtn}>
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Cart ({items.length})</Text>
      <FlatList data={items} keyExtractor={(i) => i.productId} contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200" }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardUnit}>{item.unit}</Text>
              <Text style={styles.cardPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity onPress={() => updateQty(item.productId, item.quantity - 1)} style={styles.qtyBtn}><Ionicons name="remove" size={14} /></TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQty(item.productId, Math.min(item.stock, item.quantity + 1))} style={styles.qtyBtn}><Ionicons name="add" size={14} /></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.productId)} style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      />
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text>₹{subtotal}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery</Text><Text>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</Text></View>
        <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>₹{total}</Text></View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate("Checkout")}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb", gap: 12 },
  emptyText: { fontSize: 16, color: "#9ca3af" },
  shopBtn: { backgroundColor: "#059669", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { color: "white", fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "bold", padding: 16, color: "#111827" },
  card: { flexDirection: "row", backgroundColor: "white", borderRadius: 16, padding: 12, alignItems: "center", gap: 12 },
  cardImage: { width: 64, height: 64, borderRadius: 12, backgroundColor: "#f3f4f6" },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: "500", color: "#111827" },
  cardUnit: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  cardPrice: { fontSize: 15, fontWeight: "bold", color: "#111827", marginTop: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10 },
  qtyBtn: { padding: 8 },
  qtyText: { width: 28, textAlign: "center", fontSize: 14, fontWeight: "500" },
  removeBtn: { padding: 4 },
  summary: { backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#e5e7eb", padding: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { color: "#6b7280", fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold" },
  checkoutBtn: { backgroundColor: "#059669", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 12 },
  checkoutBtnText: { color: "white", fontSize: 16, fontWeight: "600" },
});
