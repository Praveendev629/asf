import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { useCart } from "../lib/CartContext";
import { useWishlist } from "../lib/WishlistContext";
import { COLORS } from "../lib/theme";

interface Product {
  _id: string; name: string; slug: string; images: string[]; unit: string; mrp: number; price: number; stock: number; rating: number;
}

export default function WishlistScreen({ navigation }: any) {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/products").then((r) => r.json()).then((d) => {
      const all = d.products || [];
      setProducts(all.filter((p: Product) => items.includes(p._id)));
      setLoading(false);
    });
  }, [items]);

  if (loading) return <View style={styles.empty}><Text style={{ color: COLORS.textMuted }}>Loading wishlist...</Text></View>;

  if (products.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={64} color={COLORS.border} />
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtext}>Tap the heart icon on any product to save it here.</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.emptyLink}>Browse products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Wishlist ({products.length})</Text>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
          return (
            <View style={styles.card}>
              <TouchableOpacity style={styles.heartBtn} onPress={() => toggle(item._id)}>
                <Ionicons name="heart" size={16} color={COLORS.danger} />
              </TouchableOpacity>
              {discount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{discount}% OFF</Text></View>}
              <TouchableOpacity onPress={() => navigation.navigate("Product", { id: item._id })}>
                <Image source={{ uri: item.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400" }} style={styles.cardImage} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardUnit}>{item.unit}</Text>
                  <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardPrice}>₹{item.price}</Text>
                  {item.mrp > item.price && <Text style={styles.cardMrp}>₹{item.mrp}</Text>}
                </View>
                <TouchableOpacity
                  style={[styles.addBtn, item.stock <= 0 && { opacity: 0.4 }]}
                  disabled={item.stock <= 0}
                  onPress={() => addItem({ productId: item._id, name: item.name, image: item.images[0] || "", price: item.price, mrp: item.mrp, unit: item.unit, stock: item.stock })}
                >
                  <Ionicons name="cart" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background, gap: 8, padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: COLORS.text },
  emptySubtext: { fontSize: 13, color: COLORS.textMuted, textAlign: "center" },
  emptyLink: { color: COLORS.primary, fontWeight: "600", fontSize: 14, marginTop: 4 },
  title: { fontSize: 22, fontWeight: "700", padding: 16, paddingBottom: 8, color: COLORS.text },
  list: { padding: 12, paddingBottom: 24 },
  row: { gap: 10 },
  card: { flex: 1, backgroundColor: COLORS.white, borderRadius: 16, overflow: "hidden", marginBottom: 10, position: "relative" },
  heartBtn: { position: "absolute", top: 10, right: 10, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.9)", justifyContent: "center", alignItems: "center" },
  badge: { position: "absolute", top: 10, left: 10, zIndex: 10, backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: "700" },
  cardImage: { width: "100%", aspectRatio: 1, backgroundColor: COLORS.borderLight },
  cardBody: { padding: 10 },
  cardUnit: { fontSize: 10, color: COLORS.textMuted, marginBottom: 2 },
  cardName: { fontSize: 12, fontWeight: "500", color: COLORS.text, lineHeight: 16 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, paddingTop: 0 },
  cardPrice: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  cardMrp: { fontSize: 10, color: COLORS.textMuted, textDecorationLine: "line-through" },
  addBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.text, justifyContent: "center", alignItems: "center" },
});
