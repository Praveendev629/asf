import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const includeVariants = searchParams.get("includeVariants");
  const filter: Record<string, unknown> = {};
  // By default, exclude variant products from listing
  if (!includeVariants) {
    filter.$or = [{ parentId: { $exists: false } }, { parentId: "" }, { parentId: null }];
  }
  if (category && category !== "all") filter.category = category;
  if (q) filter.name = { $regex: q, $options: "i" };
  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { variants: variantData, ...productData } = body;
    const slug = String(productData.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

    // Create main product
    const product = await Product.create({ ...productData, slug, variants: [], parentId: "" });

    // Create separate product records for each variant
    const variantLinks: { name: string; slug: string; price: number; mrp: number; stock: number; image: string; attributes: Record<string, string> }[] = [];
    if (variantData && variantData.length > 0) {
      for (const v of variantData) {
        const variantSlug = v.slug || String(v.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const variantProduct = await Product.create({
          name: v.name,
          slug: variantSlug,
          description: productData.description || "",
          images: v.image ? [v.image] : productData.images || [],
          category: productData.category,
          unit: productData.unit,
          unitType: productData.unitType || "none",
          unitOptions: [],
          mrp: v.mrp || v.price,
          price: v.price,
          stock: v.stock || 0,
          rating: 4.3,
          ratingCount: 0,
          isFeatured: false,
          parentId: String(product._id),
          variants: [],
          relatedProducts: [],
          specifications: productData.specifications || [],
          productType: productData.productType || "",
        });
        variantLinks.push({
          name: v.name,
          slug: variantSlug,
          price: v.price,
          mrp: v.mrp || v.price,
          stock: v.stock || 0,
          image: v.image || "",
          attributes: v.attributes || {},
        });
      }
      // Update main product with variant links
      await Product.findByIdAndUpdate(product._id, { variants: variantLinks });
    }

    const updatedProduct = await Product.findById(product._id).lean();
    return NextResponse.json({ product: updatedProduct }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}
