import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { useCart } from "../lib/CartContext";
import { useWishlist } from "../lib/WishlistContext";
import { COLORS } from "../lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Product {
  _id: string; name: string; slug: string; images: string[]; unit: string; mrp: number; price: number; stock: number;
  description: string; rating: number; ratingCount: number; category: string;
  variants: { name: string; slug: string; price: number; mrp: number; stock: number; image: string; attributes: Record<string, string> }[];
  specifications: { label: string; value: string }[];
  relatedProducts: string[];
  unitType: string;
  unitOptions: { label: string; price: number; mrp: number; stock: number }[];
  parentId: string;
}

export default function ProductScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { addItem, items } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiFetch(`/api/products/${id}`).then((r) => r.json()).then((d) => {
      if (d.product) {
        d.product.variants = d.product.variants || [];
        d.product.unitOptions = d.product.unitOptions || [];
        d.product.specifications = d.product.specifications || [];
        d.product.relatedProducts = d.product.relatedProducts || [];
        d.product.unitType = d.product.unitType || "none";
        d.product.parentId = d.product.parentId || "";
        setProduct(d.product);
        if (d.product.relatedProducts.length > 0) {
          Promise.all(d.product.relatedProducts.map((rid: string) =>
            apiFetch(`/api/products/${rid}`).then((r) => r.json()).then((d) => d.product)
          )).then((rps) => setRelatedProducts(rps.filter(Boolean)));
        }
      }
    });
  }, [id]);

  if (!product) return <View style={styles.center}><Text style={{ color: COLORS.textMuted }}>Loading...</Text></View>;

  const images = product.images || [];
  const { price, mrp, stock } = product.unitType !== "none" && product.unitOptions?.[selectedUnit]
    ? { price: product.unitOptions[selectedUnit].price, mrp: product.unitOptions[selectedUnit].mrp, stock: product.unitOptions[selectedUnit].stock }
    : { price: product.price, mrp: product.mrp, stock: product.stock };
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inCart = items.find((i) => i.productId === product._id);

  function handleAddToCart() {
    addItem({ productId: product._id, name: product.name, image: images[0] || "", price, mrp, unit: product.unit || "", stock }, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    navigation.navigate("Checkout");
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => toggle(product._id)} style={styles.headerBtn}>
          <Ionicons name={isWishlisted(product._id) ? "heart" : "heart-outline"} size={20} color={isWishlisted(product._id) ? COLORS.danger : COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageCarousel}>
          <FlatList
            horizontal
            pagingEnabled
            data={images.length > 0 ? images : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"]}
            keyExtractor={(i, idx) => idx.toString()}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImage(index);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.mainImage} />
            )}
          />
          {discount > 0 && <View style={styles.discountBadge}><Text style={styles.discountBadgeText}>{discount}% OFF</Text></View>}
          {images.length > 1 && (
            <View style={styles.imageDots}>
              {images.map((_, i) => <View key={i} style={[styles.imageDot, i === activeImage && styles.imageDotActive]} />)}
            </View>
          )}
        </View>

        {/* Thumbnails */}
        {images.length > 1 && (
          <View style={styles.thumbnails}>
            {images.map((img, i) => (
              <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                <Image source={{ uri: img }} style={[styles.thumbnail, i === activeImage && styles.thumbnailActive]} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.category}>{product.category}</Text>
          {product.parentId && (
            <TouchableOpacity onPress={() => navigation.push("Product", { id: product.parentId })}>
              <Text style={styles.viewAllVariants}>← View all variants</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={COLORS.white} />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.ratingCount}>{product.ratingCount} ratings</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price}</Text>
            {discount > 0 && <Text style={styles.mrp}>₹{mrp}</Text>}
            {discount > 0 && <Text style={styles.discount}>{discount}% off</Text>}
          </View>

          {/* Unit Options */}
          {product.unitType !== "none" && product.unitOptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select {product.unitType === "size" ? "Size" : "Option"}</Text>
              <View style={styles.unitOptions}>
                {product.unitOptions.map((opt, i) => (
                  <TouchableOpacity key={i} onPress={() => setSelectedUnit(i)} style={[styles.unitBtn, selectedUnit === i && styles.unitBtnActive]}>
                    <Text style={[styles.unitBtnText, selectedUnit === i && styles.unitBtnTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Delivery */}
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>Delivery in 20-30 minutes</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{stock > 0 ? `In stock (${stock} available)` : "Out of stock"}</Text>
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
              <FlatList
                horizontal
                data={product.variants}
                keyExtractor={(i, idx) => idx.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item: v }) => (
                  <TouchableOpacity style={styles.variantCard} onPress={() => navigation.push("Product", { id: v.slug })}>
                    <Image source={{ uri: v.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200" }} style={styles.variantImage} />
                    <Text style={styles.variantName} numberOfLines={1}>{v.name}</Text>
                    <Text style={styles.variantPrice}>₹{v.price}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Related Products</Text>
              <FlatList
                horizontal
                data={relatedProducts.filter(Boolean)}
                keyExtractor={(i) => i._id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item: rp }) => (
                  <TouchableOpacity style={styles.variantCard} onPress={() => navigation.push("Product", { id: rp._id })}>
                    <Image source={{ uri: rp.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200" }} style={styles.variantImage} />
                    <Text style={styles.variantName} numberOfLines={1}>{rp.name}</Text>
                    <Text style={styles.variantPrice}>₹{rp.price}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Buy Bar */}
      <View style={styles.buyBar}>
        {stock > 0 && (
          <View style={styles.qtySelector}>
            <TouchableOpacity onPress={() => setQty((q) => Math.max(1, q - 1))} style={styles.qtyBtn}><Ionicons name="remove" size={16} color={COLORS.text} /></TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity onPress={() => setQty((q) => Math.min(stock, q + 1))} style={styles.qtyBtn}><Ionicons name="add" size={16} color={COLORS.text} /></TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart} disabled={stock <= 0}>
          <Ionicons name="cart-outline" size={16} color={COLORS.white} />
          <Text style={styles.addToCartText}>{addedToCart ? "Added!" : inCart ? `In Cart (${inCart.quantity})` : "Add to Cart"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow} disabled={stock <= 0}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 48, paddingBottom: 8, backgroundColor: COLORS.white },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center" },

  imageCarousel: { position: "relative" },
  mainImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH, resizeMode: "contain", backgroundColor: COLORS.borderLight },
  discountBadge: { position: "absolute", top: 12, left: 12, backgroundColor: COLORS.danger, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  discountBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: "700" },
  imageDots: { flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: 8 },
  imageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  imageDotActive: { backgroundColor: COLORS.text },

  thumbnails: { flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingBottom: 8 },
  thumbnail: { width: 56, height: 56, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, overflow: "hidden" },
  thumbnailActive: { borderColor: COLORS.text },

  body: { padding: 16 },
  category: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  viewAllVariants: { fontSize: 12, color: COLORS.primary, fontWeight: "600", marginBottom: 8 },
  name: { fontSize: 22, fontWeight: "700", color: COLORS.text },

  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 },
  ratingBadge: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.text, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  ratingText: { color: COLORS.white, fontSize: 12, fontWeight: "600" },
  ratingCount: { fontSize: 12, color: COLORS.textMuted },

  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 14, gap: 8 },
  price: { fontSize: 28, fontWeight: "700", color: COLORS.text },
  mrp: { fontSize: 16, color: COLORS.textMuted, textDecorationLine: "line-through" },
  discount: { fontSize: 14, color: COLORS.danger, fontWeight: "600" },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: COLORS.text, marginBottom: 10 },
  descText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

  unitOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  unitBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  unitBtnActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  unitBtnText: { fontSize: 13, fontWeight: "500", color: COLORS.text },
  unitBtnTextActive: { color: COLORS.white },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  infoText: { fontSize: 14, color: COLORS.textSecondary },

  specRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  specLabel: { width: 120, fontSize: 13, color: COLORS.textMuted },
  specValue: { flex: 1, fontSize: 14, fontWeight: "500", color: COLORS.text },

  variantCard: { width: 110, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, overflow: "hidden", marginRight: 10 },
  variantImage: { width: 110, height: 110, resizeMode: "cover", backgroundColor: COLORS.borderLight },
  variantName: { fontSize: 11, fontWeight: "500", textAlign: "center", marginTop: 6, paddingHorizontal: 4, color: COLORS.text },
  variantPrice: { fontSize: 12, fontWeight: "700", textAlign: "center", marginTop: 2, marginBottom: 8, color: COLORS.text },

  buyBar: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white, gap: 10 },
  qtySelector: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.border, borderRadius: 12 },
  qtyBtn: { padding: 10 },
  qtyText: { width: 32, textAlign: "center", fontSize: 15, fontWeight: "600", color: COLORS.text },
  addToCartBtn: { flex: 1, backgroundColor: COLORS.text, borderRadius: 12, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  addToCartText: { color: COLORS.white, fontSize: 13, fontWeight: "600" },
  buyNowBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buyNowText: { color: COLORS.white, fontSize: 14, fontWeight: "600" },
});
