import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";

interface Product {
  _id: string; name: string; slug: string; images: string[]; unit: string; mrp: number; price: number; stock: number;
  description: string; rating: number; ratingCount: number; category: string;
  variants: { name: string; slug: string; price: number; mrp: number; stock: number; image: string; attributes: Record<string, string> }[];
  specifications: { label: string; value: string }[];
}

export default function ProductScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    apiFetch(`/api/products/${id}`).then((r) => r.json()).then((d) => {
      if (d.product) {
        d.product.variants = d.product.variants || [];
        d.product.specifications = d.product.specifications || [];
        setProduct(d.product);
      }
    });
  }, [id]);

  if (!product) return <View style={styles.center}><Text>Loading...</Text></View>;

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="heart-outline" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Image */}
        <Image source={{ uri: product.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600" }} style={styles.image} />
        {discount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{discount}% OFF</Text></View>}

        <View style={styles.body}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.unit}>{product.unit}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="white" />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.ratingCount}>{product.ratingCount} ratings</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {discount > 0 && <Text style={styles.mrp}>₹{product.mrp}</Text>}
            {discount > 0 && <Text style={styles.discount}>{discount}% off</Text>}
          </View>

          {/* Delivery */}
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText}>Delivery in 20-30 minutes</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}</Text>
          </View>

          {/* Description */}
          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          ) : null}

          {/* Specifications */}
          {product.specifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {product.specifications.filter((s) => s.label && s.value).map((spec, i) => (
                <View key={i} style={styles.specRow}>
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Variants</Text>
              <View style={styles.variantGrid}>
                {product.variants.map((v, i) => (
                  <TouchableOpacity key={i} style={styles.variantCard} onPress={() => navigation.push("Product", { id: v.slug })}>
                    <Image source={{ uri: v.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200" }} style={styles.variantImage} />
                    <Text style={styles.variantName} numberOfLines={1}>{v.name}</Text>
                    <Text style={styles.variantPrice}>₹{v.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Buy Bar */}
      <View style={styles.buyBar}>
        <View style={styles.qtySelector}>
          <TouchableOpacity onPress={() => setQty((q) => Math.max(1, q - 1))} style={styles.qtyBtn}><Ionicons name="remove" size={16} /></TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity onPress={() => setQty((q) => Math.min(product.stock, q + 1))} style={styles.qtyBtn}><Ionicons name="add" size={16} /></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addToCartBtn} onPress={() => Alert.alert("Added", "Item added to cart!")}>
          <Ionicons name="cart-outline" size={16} color="white" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={() => navigation.navigate("Checkout")}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { position: "absolute", top: 48, left: 16, right: 16, zIndex: 10, flexDirection: "row", justifyContent: "space-between" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.9)", justifyContent: "center", alignItems: "center" },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#f3f4f6" },
  badge: { position: "absolute", top: 64, left: 16, backgroundColor: "#ef4444", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: "white", fontSize: 12, fontWeight: "bold" },
  body: { padding: 20 },
  category: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  name: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  unit: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 },
  ratingBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  ratingText: { color: "white", fontSize: 12, fontWeight: "600" },
  ratingCount: { fontSize: 12, color: "#9ca3af" },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 16, gap: 8 },
  price: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  mrp: { fontSize: 16, color: "#9ca3af", textDecorationLine: "line-through" },
  discount: { fontSize: 14, color: "#ef4444", fontWeight: "600" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  infoText: { fontSize: 14, color: "#6b7280" },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 12 },
  descText: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
  specRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f9fafb" },
  specLabel: { width: 120, fontSize: 13, color: "#9ca3af" },
  specValue: { flex: 1, fontSize: 14, fontWeight: "500", color: "#111827" },
  variantGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  variantCard: { width: 100, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, overflow: "hidden" },
  variantImage: { width: "100%", aspectRatio: 1, backgroundColor: "#f3f4f6" },
  variantName: { fontSize: 11, fontWeight: "500", textAlign: "center", marginTop: 6, paddingHorizontal: 4 },
  variantPrice: { fontSize: 12, fontWeight: "bold", textAlign: "center", marginTop: 2, marginBottom: 6 },
  buyBar: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: "white", gap: 10 },
  qtySelector: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12 },
  qtyBtn: { padding: 10 },
  qtyText: { width: 32, textAlign: "center", fontSize: 15, fontWeight: "500" },
  addToCartBtn: { flex: 1, backgroundColor: "#111827", borderRadius: 12, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  addToCartText: { color: "white", fontSize: 14, fontWeight: "600" },
  buyNowBtn: { flex: 1, backgroundColor: "#059669", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buyNowText: { color: "white", fontSize: 14, fontWeight: "600" },
});
