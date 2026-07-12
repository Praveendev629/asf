"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Truck, ShieldCheck, Minus, Plus, ChevronLeft, ChevronRight, Heart, Cpu, HardDrive, Battery, Monitor, Camera, Smartphone, Headphones, Watch, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { useWishlist } from "@/components/WishlistContext";

interface Product {
  _id: string; name: string; slug: string; description: string; images: string[];
  category: string; unit: string; unitType: string;
  unitOptions: { label: string; price: number; mrp: number; stock: number }[];
  mrp: number; price: number; stock: number; rating: number; ratingCount: number;
  variants: { name: string; slug: string; price: number; mrp: number; stock: number; image: string; attributes: Record<string, string> }[];
  relatedProducts: string[];
  specifications: { label: string; value: string; icon: string }[];
  productType: string;
}

const SPEC_ICONS: Record<string, any> = {
  Display: Monitor, Processor: Cpu, RAM: Cpu, Storage: HardDrive, Battery: Battery,
  Camera: Camera, "Front Camera": Camera, OS: Smartphone, Weight: Smartphone,
  Driver: Headphones, Connectivity: Headphones, Sensors: Watch,
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, items } = useCart();
  const { firebaseUser } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          data.product.variants = data.product.variants || [];
          data.product.unitOptions = data.product.unitOptions || [];
          data.product.specifications = data.product.specifications || [];
          data.product.relatedProducts = data.product.relatedProducts || [];
          data.product.unitType = data.product.unitType || "none";
          data.product.productType = data.product.productType || "";
          setProduct(data.product);
          if (data.product.relatedProducts.length > 0) {
            Promise.all(data.product.relatedProducts.map((id: string) =>
              fetch(`/api/products/${id}`).then((r) => r.json()).then((d) => d.product)
            )).then((rps) => setRelatedProducts(rps.filter(Boolean)));
          }
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !product) return;
    const distance = touchStart - touchEnd;
    const imgs = getCurrentImages();
    if (Math.abs(distance) > 50) {
      if (distance > 0 && activeImage < imgs.length - 1) setActiveImage(activeImage + 1);
      if (distance < 0 && activeImage > 0) setActiveImage(activeImage - 1);
    }
  };

  // Get the current images based on variant selection
  function getCurrentImages(): string[] {
    if (selectedVariant !== null && product?.variants?.[selectedVariant]?.image) {
      return [product.variants[selectedVariant].image, ...(product.images || [])];
    }
    return product?.images || [];
  }

  function getEffectivePrice(p: Product, sv: number | null, su: number) {
    if (sv !== null && p.variants?.[sv]) {
      return { price: p.variants[sv].price, mrp: p.variants[sv].mrp, stock: p.variants[sv].stock };
    }
    if (p.unitType !== "none" && p.unitOptions?.[su]) {
      return { price: p.unitOptions[su].price, mrp: p.unitOptions[su].mrp, stock: p.unitOptions[su].stock };
    }
    return { price: p.price || 0, mrp: p.mrp || 0, stock: p.stock || 0 };
  }

  function handleAddToCart() {
    if (!product) return;
    const p = product;
    const currentPrice = selectedVariant !== null && p.variants?.[selectedVariant] ? p.variants[selectedVariant].price : (p.unitOptions?.[selectedUnit]?.price || p.price);
    const currentMrp = selectedVariant !== null && p.variants?.[selectedVariant] ? p.variants[selectedVariant].mrp : (p.unitOptions?.[selectedUnit]?.mrp || p.mrp);
    const currentStock = selectedVariant !== null && p.variants?.[selectedVariant] ? p.variants[selectedVariant].stock : (p.unitOptions?.[selectedUnit]?.stock || p.stock);
    addItem({ productId: p._id, name: p.name, image: p.images?.[0] || "", price: currentPrice, mrp: currentMrp, unit: p.unit || "", stock: currentStock }, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    if (!firebaseUser) router.push(`/?redirect=${encodeURIComponent("/checkout")}`);
    else router.push("/checkout");
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-400">Product not found.</div>;

  const images = getCurrentImages();
  const { price, mrp, stock } = getEffectivePrice(product, selectedVariant, selectedUnit);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const wished = isWishlisted(product._id);
  const inCart = items.find((i) => i.productId === product._id);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100"><ArrowLeft size={18} /></button>
          <div className="flex-1" />
          <button onClick={() => toggle(product._id)} className="p-2 rounded-xl bg-gray-100">
            <Heart size={18} className={wished ? "fill-red-500 text-red-500" : ""} />
          </button>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="max-w-lg mx-auto">
        <div className="relative aspect-square bg-gray-50" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <Image src={images[activeImage] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"} alt={product.name} fill className="object-contain p-4" key={activeImage} />
          {discount > 0 && <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">{discount}% OFF</span>}
          {images.length > 1 && (
            <>
              {activeImage > 0 && <button onClick={() => setActiveImage(activeImage - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow"><ChevronLeft size={18} /></button>}
              {activeImage < images.length - 1 && <button onClick={() => setActiveImage(activeImage + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow"><ChevronRight size={18} /></button>}
            </>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition ${i === activeImage ? "bg-gray-900" : "bg-gray-300"}`} />)}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 mt-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)} className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 ${activeImage === i ? "border-gray-900" : "border-gray-200"}`}>
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <p className="text-xs text-gray-500 mb-1">{product.category}</p>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h1>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1 bg-gray-900 text-white text-xs px-2 py-0.5 rounded-md"><Star size={10} className="fill-white" /> {product.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">{product.ratingCount} ratings</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">₹{price}</span>
          {discount > 0 && <><span className="text-sm text-gray-400 line-through">₹{mrp}</span><span className="text-sm text-red-500 font-semibold">{discount}% off</span></>}
        </div>

        {/* Unit/Size Options */}
        {product.unitType !== "none" && product.unitOptions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Select {product.unitType === "size" ? "Size" : "Option"}</p>
            <div className="flex flex-wrap gap-2">
              {product.unitOptions.map((opt, i) => (
                <button key={i} onClick={() => setSelectedUnit(i)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${selectedUnit === i ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Variant Options */}
        {product.variants.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Select Variant</p>
            <div className="grid grid-cols-3 gap-2">
              {product.variants.map((v, i) => (
                <button key={i} onClick={() => { setSelectedVariant(i); setActiveImage(0); }} className={`p-3 rounded-xl border-2 text-center transition ${selectedVariant === i ? "border-gray-900 bg-gray-50" : "border-gray-200"}`}>
                  {v.image && <div className="relative w-12 h-12 mx-auto rounded-lg overflow-hidden mb-1"><Image src={v.image} alt="" fill className="object-cover" /></div>}
                  <p className="text-xs font-medium truncate">{v.name}</p>
                  <p className="text-xs font-bold">₹{v.price}</p>
                </button>
              ))}
            </div>
            {selectedVariant !== null && product.variants?.[selectedVariant] && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(product.variants[selectedVariant].attributes).map(([k, val]) => (
                  <span key={k} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{k}: {val}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delivery info */}
        <div className="flex items-center gap-3 py-3 border-t border-gray-100">
          <Truck size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">Delivery in 20-30 minutes</span>
        </div>
        <div className="flex items-center gap-3 py-3 border-t border-gray-100">
          <ShieldCheck size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">{stock > 0 ? `In stock (${stock} available)` : "Out of stock"}</span>
        </div>

        {/* Description */}
        {product.description && (
          <div className="py-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Specifications */}
        {product.specifications.length > 0 && (
          <div className="py-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Specifications</h3>
            <div className="space-y-2">
              {product.specifications.filter((s) => s.label && s.value).map((spec, i) => {
                const Icon = SPEC_ICONS[spec.label] || Cpu;
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <Icon size={16} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500 w-24 shrink-0">{spec.label}</span>
                    <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Variants */}
        {product.variants.length > 0 && (
          <div className="py-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Available Variants</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.variants.map((v, i) => (
                <div key={i} onClick={() => { setSelectedVariant(i); setActiveImage(0); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="shrink-0 w-28 cursor-pointer rounded-xl border-2 overflow-hidden transition hover:shadow-md">
                  <div className="relative aspect-square bg-gray-50"><Image src={v.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"} alt={v.name} fill className="object-cover" /></div>
                  <div className="p-2 text-center">
                    <p className="text-xs font-medium truncate">{v.name}</p>
                    <p className="text-xs font-bold">₹{v.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="py-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Related Products</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {relatedProducts.filter(Boolean).map((rp) => (
                <a key={rp._id} href={`/products/${rp.slug}`} className="shrink-0 w-28 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
                  <div className="relative aspect-square bg-gray-50"><Image src={rp.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"} alt={rp.name} fill className="object-cover" /></div>
                  <div className="p-2 text-center">
                    <p className="text-xs font-medium truncate">{rp.name}</p>
                    <p className="text-xs font-bold">₹{rp.price}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Buy Bar */}
      <div className="fixed bottom-20 left-0 right-0 z-50 safe-area-pb">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center gap-3 p-3">
            {/* Quantity */}
            {stock > 0 && (
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5"><Minus size={14} /></button>
                <span className="w-8 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(stock, q + 1))} className="p-2.5"><Plus size={14} /></button>
              </div>
            )}

            {/* Add to Cart */}
            <button onClick={handleAddToCart} disabled={stock <= 0} className="flex-1 bg-gray-900 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition">
              <ShoppingBag size={16} />
              {addedToCart ? "Added!" : inCart ? `In Cart (${inCart.quantity})` : "Add to Cart"}
            </button>

            {/* Buy Now */}
            <button onClick={handleBuyNow} disabled={stock <= 0} className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-40 transition">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
