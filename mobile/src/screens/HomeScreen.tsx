import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";

const CATEGORIES = ["all", "Fruits & Vegetables", "Dairy & Eggs", "Snacks", "Beverages", "Bakery", "Household"];

interface Product {
  _id: string; name: string; slug: string; images: string[]; unit: string; mrp: number; price: number; stock: number;
}

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (q) params.set("q", q);
    const res = await apiFetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
  }, [category, q]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const onRefresh = async () => { setRefreshing(true); await loadProducts(); setRefreshing(false); };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput style={styles.searchInput} placeholder="Search products..." value={q} onChangeText={setQ} onSubmitEditing={loadProducts} />
      </View>

      {/* ASF Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Fresh groceries, delivered fast.</Text>
        <Text style={styles.bannerSub}>Order now from ASF Shopee</Text>
      </View>

      {/* Categories */}
      <FlatList horizontal data={CATEGORIES} keyExtractor={(i) => i} showsHorizontalScrollIndicator={false} style={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setCategory(item)} style={[styles.catPill, category === item && styles.catPillActive]}>
            <Text style={[styles.catText, category === item && styles.catTextActive]}>{item === "all" ? "All" : item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Products */}
      <FlatList data={products} numColumns={2} keyExtractor={(i) => i._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.productGrid}
        renderItem={({ item }) => {
          const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
          return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Product", { id: item._id })}>
              <Image source={{ uri: item.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400" }} style={styles.cardImage} />
              {discount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{discount}% OFF</Text></View>}
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardPrice}>₹{item.price}</Text>
                  {item.mrp > item.price && <Text style={styles.cardMrp}>₹{item.mrp}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "white", margin: 16, marginBottom: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  banner: { backgroundColor: "#059669", marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 20 },
  bannerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  bannerSub: { color: "#d1fae5", fontSize: 12, marginTop: 4 },
  categories: { paddingHorizontal: 16, marginBottom: 12, maxHeight: 44 },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "white", marginRight: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  catPillActive: { backgroundColor: "#059669", borderColor: "#059669" },
  catText: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  catTextActive: { color: "white" },
  productGrid: { padding: 16, gap: 12 },
  card: { flex: 1, backgroundColor: "white", borderRadius: 16, overflow: "hidden", marginHorizontal: 4, marginBottom: 8 },
  cardImage: { width: "100%", aspectRatio: 1, backgroundColor: "#f3f4f6" },
  badge: { position: "absolute", top: 8, left: 8, backgroundColor: "#ef4444", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: "500", color: "#111827", marginBottom: 4 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardPrice: { fontSize: 15, fontWeight: "bold", color: "#111827" },
  cardMrp: { fontSize: 11, color: "#9ca3af", textDecorationLine: "line-through" },
});
