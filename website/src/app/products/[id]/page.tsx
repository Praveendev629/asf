"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Truck, ShieldCheck, Minus, Plus, ChevronLeft, ChevronRight, Heart, Cpu, HardDrive, Battery, Monitor, Camera, Smartphone, Headphones, Watch } from "lucide-react";
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
  "Screen Size": Monitor, "Refresh Rate": Monitor, Resolution: Monitor,
  Driver: Headphones, Connectivity: Headphones, "Noise Cancelling": Headphones,
  Sensors: Watch, "Water Resistance": Watch,
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
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        // Fetch related products
        if (data.product?.relatedProducts?.length > 0) {
          Promise.all(data.product.relatedProducts.map((id: string) =>
            fetch(`/api/products/${id}`).then((r) => r.json()).then((d) => d.product)
          )).then(setRelatedProducts);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !product) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) {
      if (distance > 0 && activeImage < product.images.length - 1) setActiveImage(activeImage + 1);
      if (distance < 0 && activeImage > 0) setActiveImage(activeImage - 1);
    }
  };

  const getEffectivePrice = (p: Product, sv: number | null, su: number) => {
    if (sv !== null && p.variants[sv]) {
      return { price: p.variants[sv].price, mrp: p.variants[sv].mrp };
    }
    if (p.unitType !== "none" && p.unitOptions[su]) {
      return { price: p.unitOptions[su].price, mrp: p.unitOptions[su].mrp };
    }
    return { price: p.price, mrp: p.mrp };
  };

  if (loading) return <div className="container-app py-16 text-center text-asf-slate">Loading...</div>;
  if (!product) return <div className="container-app py-16 text-center text-asf-slate">Product not found.</div>;

  const { price, mrp } = getEffectivePrice(product, selectedVariant, selectedUnit);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const wished = isWishlisted(product._id);

  function handleBuyNow() {
    const p = product!;
    const currentPrice = selectedVariant !== null ? p.variants[selectedVariant].price : (p.unitOptions[selectedUnit]?.price || p.price);
    const currentMrp = selectedVariant !== null ? p.variants[selectedVariant].mrp : (p.unitOptions[selectedUnit]?.mrp || p.mrp);
    const currentStock = selectedVariant !== null ? p.variants[selectedVariant].stock : (p.unitOptions[selectedUnit]?.stock || p.stock);
    addItem({ productId: p._id, name: p.name, image: p.images[0] || "", price: currentPrice, mrp: currentMrp, unit: p.unit, stock: currentStock }, qty);
    if (!firebaseUser) router.push(`/?redirect=${encodeURIComponent("/checkout")}`);
    else router.push("/checkout");
  }

  return (
    <div className="container-app py-10 max-w-5xl">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image Carousel */}
        <div>
          <div
            ref={imageContainerRef}
            className="relative aspect-square rounded-2xl overflow-hidden bg-asf-mist touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={product.images[activeImage] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300"
              key={activeImage}
            />
            {/* Nav arrows */}
            {activeImage > 0 && (
              <button onClick={() => setActiveImage(activeImage - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"><ChevronLeft size={20} /></button>
            )}
            {activeImage < product.images.length - 1 && (
              <button onClick={() => setActiveImage(activeImage + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"><ChevronRight size={20} /></button>
            )}
            {/* Dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`w-2 h-2 rounded-full transition ${i === activeImage ? "bg-white" : "bg-white/50"}`} />
                ))}
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${activeImage === i ? "border-asf-copper" : "border-transparent"}`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-xs uppercase tracking-wide text-asf-copper font-semibold mb-2">{product.category}</p>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-semibold text-asf-slateDeep">{product.name}</h1>
            <button onClick={() => toggle(product._id)} className="shrink-0 mt-1">
              <Heart size={24} className={wished ? "fill-red-500 text-red-500" : "text-asf-slate hover:text-red-400"} />
            </button>
          </div>
          <p className="text-asf-slate mb-4">{product.unit}</p>

          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1 bg-asf-slateDeep text-white text-xs px-2 py-1 rounded-lg"><Star size={12} className="fill-white" /> {product.rating.toFixed(1)}</span>
            <span className="text-sm text-asf-slate">{product.ratingCount} ratings</span>
          </div>

          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-bold text-asf-slateDeep">₹{price}</span>
            {discount > 0 && <><span className="text-lg strike text-asf-slate">₹{mrp}</span><span className="text-asf-copper font-semibold text-sm">{discount}% OFF</span></>}
          </div>
          {discount > 0 && <p className="text-sm text-green-700 mb-6">You save ₹{mrp - price}</p>}

          {/* Unit/Size Options */}
          {product.unitType !== "none" && product.unitOptions.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-asf-slateDeep mb-2">Select {product.unitType === "size" ? "Size" : "Option"}</p>
              <div className="flex flex-wrap gap-2">
                {product.unitOptions.map((opt, i) => (
                  <button key={i} onClick={() => setSelectedUnit(i)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${selectedUnit === i ? "bg-asf-slateDeep text-white border-asf-slateDeep" : "bg-white text-asf-slate border-asf-mist hover:border-asf-copper"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant Options */}
          {product.variants.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-asf-slateDeep mb-2">Select Variant</p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v, i) => (
                  <button key={i} onClick={() => { setSelectedVariant(i); setActiveImage(0); }} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition ${selectedVariant === i ? "border-asf-copper bg-asf-copper/5" : "border-asf-mist hover:border-asf-copper"}`}>
                    {v.image && <div className="relative w-8 h-8 rounded-lg overflow-hidden"><Image src={v.image} alt="" fill className="object-cover" /></div>}
                    <span className="text-sm font-medium">{v.name}</span>
                  </button>
                ))}
              </div>
              {selectedVariant !== null && product.variants[selectedVariant] && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(product.variants[selectedVariant].attributes).map(([k, val]) => (
                    <span key={k} className="text-xs bg-asf-mist text-asf-slateDeep px-2 py-0.5 rounded-full">{k}: {val}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4 text-sm text-asf-slate"><Truck size={18} /> Delivery in 20-30 minutes</div>
          <div className="flex items-center gap-3 mb-6 text-sm text-asf-slate"><ShieldCheck size={18} />{product.stock > 0 ? `In stock (${product.stock} available)` : "Out of stock"}</div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-asf-mist rounded-xl">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3"><Minus size={16} /></button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-3"><Plus size={16} /></button>
              </div>
              <button onClick={handleBuyNow} className="btn-primary flex-1">Buy Now</button>
            </div>
          )}

          <div>
            <h2 className="font-display text-lg font-semibold text-asf-slateDeep mb-2">Description</h2>
            <p className="text-asf-slate text-sm leading-relaxed whitespace-pre-line">{product.description || "No description provided."}</p>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {product.specifications.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-asf-slateDeep mb-4">Specifications</h2>
          <div className="card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.specifications.filter((s) => s.label && s.value).map((spec, i) => {
                const Icon = SPEC_ICONS[spec.label] || Cpu;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-asf-mist/30 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-asf-copper/10 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-asf-copper" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-asf-slate">{spec.label}</p>
                      <p className="text-sm font-medium text-asf-slateDeep truncate">{spec.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Variants as Related Products */}
      {product.variants.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-asf-slateDeep mb-4">Available Variants</h2>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {product.variants.map((v, i) => (
              <div key={i} onClick={() => { setSelectedVariant(i); setActiveImage(0); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="shrink-0 w-32 cursor-pointer card p-2 hover:shadow-premium transition">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-asf-mist mb-2">
                  <Image src={v.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"} alt={v.name} fill className="object-cover" />
                </div>
                <p className="text-xs font-medium text-asf-slateDeep truncate">{v.name}</p>
                <p className="text-xs font-semibold">₹{v.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-asf-slateDeep mb-4">Related Products</h2>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {relatedProducts.filter(Boolean).map((rp) => (
              <a key={rp._id} href={`/products/${rp.slug}`} className="shrink-0 w-32 card p-2 hover:shadow-premium transition">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-asf-mist mb-2">
                  <Image src={rp.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"} alt={rp.name} fill className="object-cover" />
                </div>
                <p className="text-xs font-medium text-asf-slateDeep truncate">{rp.name}</p>
                <p className="text-xs font-semibold">₹{rp.price}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
