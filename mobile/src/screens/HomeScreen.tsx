import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, RefreshControl, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { useCart } from "../lib/CartContext";
import { useWishlist } from "../lib/WishlistContext";
import { COLORS } from "../lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CATEGORIES = ["all", "Fruits & Vegetables", "Dairy & Eggs", "Snacks", "Beverages", "Bakery", "Household"];

interface Product {
  _id: string; name: string; slug: string; images: string[]; unit: string; mrp: number; price: number; stock: number; rating: number;
}

interface UpdateBanner {
  _id: string; title: string; description: string; imageUrl: string; link: string;
}

export default function HomeScreen({ navigation }: any) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBanners] = useState<UpdateBanner[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (q) params.set("q", q);
    const res = await apiFetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
  }, [category, q]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    apiFetch("/api/updates").then((r) => r.json()).then((d) => setBanners(d.updates || []));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    bannerTimer.current = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => { if (bannerTimer.current) clearInterval(bannerTimer.current); };
  }, [banners.length]);

  const onRefresh = async () => { setRefreshing(true); await loadProducts(); setRefreshing(false); };

  const renderProduct = ({ item }: { item: Product }) => {
    const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
    const outOfStock = item.stock <= 0;
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Product", { id: item._id })} activeOpacity={0.8}>
        <View style={styles.cardImageWrap}>
          <Image source={{ uri: item.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400" }} style={styles.cardImage} />
          {discount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{discount}% OFF</Text></View>}
          {outOfStock && <View style={styles.oosOverlay}><Text style={styles.oosText}>Out of Stock</Text></View>}
          <TouchableOpacity style={styles.wishlistBtn} onPress={() => toggle(item._id)}>
            <Ionicons name={isWishlisted(item._id) ? "heart" : "heart-outline"} size={16} color={isWishlisted(item._id) ? COLORS.danger : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardUnit}>{item.unit}</Text>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.priceWrap}>
              <Text style={styles.cardPrice}>₹{item.price}</Text>
              {item.mrp > item.price && <Text style={styles.cardMrp}>₹{item.mrp}</Text>}
            </View>
            <TouchableOpacity
              style={[styles.addBtn, outOfStock && styles.addBtnDisabled]}
              disabled={outOfStock}
              onPress={() => addItem({ productId: item._id, name: item.name, image: item.images?.[0] || "", price: item.price, mrp: item.mrp, unit: item.unit, stock: item.stock })}
            >
              <Ionicons name="add" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header / Search */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Ionicons name="cart" size={22} color={COLORS.primary} />
          <Text style={styles.logoText}>ASF Shopee</Text>
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search products..." placeholderTextColor={COLORS.textMuted} value={q} onChangeText={setQ} onSubmitEditing={loadProducts} returnKeyType="search" />
        </View>
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(i) => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Banners */}
            {!q && banners.length > 0 && (
              <View style={styles.bannerWrap}>
                <View style={styles.bannerContainer}>
                  {banners.map((banner, i) => (
                    <View key={banner._id} style={[styles.bannerSlide, i === activeBanner ? styles.bannerActive : styles.bannerInactive]}>
                      <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
                      <View style={styles.bannerOverlay} />
                      <View style={styles.bannerTextWrap}>
                        <Text style={styles.bannerTitle}>{banner.title}</Text>
                        {banner.description ? <Text style={styles.bannerDesc}>{banner.description}</Text> : null}
                      </View>
                    </View>
                  ))}
                  {banners.length > 1 && (
                    <>
                      <TouchableOpacity style={[styles.bannerArrow, styles.bannerArrowLeft]} onPress={() => setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length)}>
                        <Ionicons name="chevron-back" size={18} color={COLORS.text} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.bannerArrow, styles.bannerArrowRight]} onPress={() => setActiveBanner((prev) => (prev + 1) % banners.length)}>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.text} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
                <View style={styles.bannerDots}>
                  {banners.map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => setActiveBanner(i)}>
                      <View style={[styles.bannerDot, i === activeBanner && styles.bannerDotActive]} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Welcome Banner */}
            {!q && (
              <View style={styles.welcomeBanner}>
                <View style={styles.welcomeContent}>
                  <Text style={styles.welcomeLabel}>WELCOME TO ASF SHOPEE</Text>
                  <Text style={styles.welcomeTitle}>Fresh groceries, delivered fast.</Text>
                  <Text style={styles.welcomeSub}>Curated products with premium care. Order now!</Text>
                </View>
              </View>
            )}

            {/* Categories */}
            {!q && (
              <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={(i) => i}
                showsHorizontalScrollIndicator={false}
                style={styles.categories}
                contentContainerStyle={styles.categoriesContent}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setCategory(item)} style={[styles.catPill, category === item && styles.catPillActive]}>
                    <Text style={[styles.catText, category === item && styles.catTextActive]}>{item === "all" ? "All" : item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{q ? `Results for "${q}"` : category === "all" ? "All Products" : category}</Text>
              {products.length > 0 && <Text style={styles.sectionCount}>{products.length} items</Text>}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try a different category</Text>
          </View>
        }
        renderItem={renderProduct}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  logoText: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  listContent: { padding: 12, paddingBottom: 24 },
  row: { gap: 10 },

  // Banners
  bannerWrap: { marginBottom: 12 },
  bannerContainer: { height: 160, borderRadius: 16, overflow: "hidden", position: "relative" },
  bannerSlide: { ...StyleSheet.absoluteFillObject },
  bannerActive: { opacity: 1 },
  bannerInactive: { opacity: 0 },
  bannerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  bannerTextWrap: { position: "absolute", bottom: 16, left: 16, right: 16 },
  bannerTitle: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  bannerDesc: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
  bannerArrow: { position: "absolute", top: "50%", transform: [{ translateY: -16 }], backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 16, width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  bannerArrowLeft: { left: 8 },
  bannerArrowRight: { right: 8 },
  bannerDots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
  bannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  bannerDotActive: { backgroundColor: COLORS.white },

  // Welcome Banner
  welcomeBanner: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginBottom: 12, overflow: "hidden" },
  welcomeContent: { zIndex: 1 },
  welcomeLabel: { fontSize: 10, fontWeight: "600", color: COLORS.primaryLight, letterSpacing: 1, textTransform: "uppercase" },
  welcomeTitle: { fontSize: 20, fontWeight: "700", color: COLORS.white, marginTop: 4 },
  welcomeSub: { fontSize: 12, color: COLORS.primaryLight, marginTop: 6 },

  // Categories
  categories: { marginBottom: 12 },
  categoriesContent: { gap: 8 },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "500" },
  catTextActive: { color: COLORS.white },

  // Section
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  sectionCount: { fontSize: 12, color: COLORS.textMuted },

  // Product card
  card: { flex: 1, backgroundColor: COLORS.white, borderRadius: 16, overflow: "hidden", marginBottom: 10 },
  cardImageWrap: { position: "relative" },
  cardImage: { width: "100%", aspectRatio: 1, backgroundColor: COLORS.borderLight },
  badge: { position: "absolute", top: 8, left: 8, backgroundColor: COLORS.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: "700" },
  oosOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.7)", justifyContent: "center", alignItems: "center" },
  oosText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600" },
  wishlistBtn: { position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.85)", justifyContent: "center", alignItems: "center" },
  cardBody: { padding: 10 },
  cardUnit: { fontSize: 10, color: COLORS.textMuted, marginBottom: 2 },
  cardName: { fontSize: 12, fontWeight: "500", color: COLORS.text, lineHeight: 16, marginBottom: 6 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardPrice: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  cardMrp: { fontSize: 10, color: COLORS.textMuted, textDecorationLine: "line-through" },
  addBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
  addBtnDisabled: { opacity: 0.4 },

  emptyWrap: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: "500", color: COLORS.textMuted, marginTop: 12 },
  emptySubtext: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
});
