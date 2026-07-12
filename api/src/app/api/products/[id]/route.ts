import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import cloudinary from "@/lib/cloudinary";

function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
}

async function deleteCloudinaryImages(images: string[]) {
  for (const url of images) {
    const publicId = extractPublicId(url);
    if (publicId) {
      try { await cloudinary.uploader.destroy(publicId); } catch {}
    }
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const product = await Product.findOne({
    $or: [{ _id: params.id.match(/^[0-9a-fA-F]{24}$/) ? params.id : undefined }, { slug: params.id }],
  }).lean();
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const { variants: variantData, ...updateData } = body;

    const product = await Product.findByIdAndUpdate(params.id, { $set: updateData }, { new: true });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Handle variant updates if provided
    if (variantData !== undefined) {
      // Delete old variant products
      const oldVariants = await Product.find({ parentId: params.id });
      for (const ov of oldVariants) {
        await deleteCloudinaryImages([...(ov.images || [])]);
        await Product.findByIdAndDelete(ov._id);
      }

      // Create new variant products
      const variantLinks: { name: string; slug: string; price: number; mrp: number; stock: number; image: string; attributes: Record<string, string> }[] = [];
      if (variantData && variantData.length > 0) {
        for (const v of variantData) {
          const variantSlug = v.slug || String(v.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          await Product.create({
            name: v.name,
            slug: variantSlug,
            description: updateData.description || product.description || "",
            images: v.image ? [v.image] : updateData.images || product.images || [],
            category: updateData.category || product.category,
            unit: updateData.unit || product.unit,
            unitType: updateData.unitType || product.unitType || "none",
            unitOptions: [],
            mrp: v.mrp || v.price,
            price: v.price,
            stock: v.stock || 0,
            rating: 4.3,
            ratingCount: 0,
            isFeatured: false,
            parentId: params.id,
            variants: [],
            relatedProducts: [],
            specifications: updateData.specifications || product.specifications || [],
            productType: updateData.productType || product.productType || "",
          });
          variantLinks.push({
            name: v.name, slug: variantSlug, price: v.price,
            mrp: v.mrp || v.price, stock: v.stock || 0,
            image: v.image || "", attributes: v.attributes || {},
          });
        }
      }
      await Product.findByIdAndUpdate(params.id, { $set: { variants: variantLinks } });
    }

    const updatedProduct = await Product.findById(params.id).lean();
    return NextResponse.json({ product: updatedProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete all product images from Cloudinary
    const allImages = [...(product.images || [])];
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v: any) => { if (v.image) allImages.push(v.image); });
    }
    await deleteCloudinaryImages(allImages);

    // Delete variant products
    const variantProducts = await Product.find({ parentId: params.id });
    for (const vp of variantProducts) {
      await deleteCloudinaryImages([...(vp.images || [])]);
      await Product.findByIdAndDelete(vp._id);
    }

    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, deletedImages: allImages.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
