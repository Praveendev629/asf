import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../lib/CartContext";
import { COLORS, getDeliveryFee } from "../lib/theme";

export default function CartScreen({ navigation }: any) {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const deliveryFee = getDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="cart-outline" size={64} color={COLORS.border} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.shopBtn}>
          <Text style={styles.shopBtnText}>Continue shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.productId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200" }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardUnit}>{item.unit}</Text>
              <Text style={styles.cardPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity onPress={() => updateQuantity(item.productId, item.quantity - 1)} style={styles.qtyBtn}><Ionicons name="remove" size={14} color={COLORS.text} /></TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))} style={styles.qtyBtn}><Ionicons name="add" size={14} color={COLORS.text} /></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.productId)} style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>₹{subtotal}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery</Text><Text style={styles.summaryValue}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</Text></View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate("Checkout")}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: COLORS.text },
  shopBtn: { marginTop: 8 },
  shopBtnText: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },
  title: { fontSize: 22, fontWeight: "700", padding: 16, paddingBottom: 8, color: COLORS.text },
  list: { padding: 16, gap: 12 },
  card: { flexDirection: "row", backgroundColor: COLORS.white, borderRadius: 16, padding: 12, alignItems: "center", gap: 12 },
  cardImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: COLORS.borderLight },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  cardUnit: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  cardPrice: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginTop: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.border, borderRadius: 10 },
  qtyBtn: { padding: 8 },
  qtyText: { width: 28, textAlign: "center", fontSize: 14, fontWeight: "600", color: COLORS.text },
  removeBtn: { padding: 4 },
  summary: { backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, padding: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 14 },
  summaryValue: { fontSize: 14, color: COLORS.text },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  checkoutBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 12 },
  checkoutBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
});
