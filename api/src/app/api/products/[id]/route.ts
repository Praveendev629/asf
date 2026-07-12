import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import cloudinary from "@/lib/cloudinary";

function extractPublicId(url: string): string | null {
  // Cloudinary URLs: https://res.cloudinary.com/cloudname/image/upload/v1234/folder/publicid.jpg
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
}

async function deleteCloudinaryImages(images: string[]) {
  for (const url of images) {
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch {}
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
    const product = await Product.findByIdAndUpdate(params.id, { $set: body }, { new: true });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
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
    // Also delete variant images
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v: any) => {
        if (v.image) allImages.push(v.image);
      });
    }
    await deleteCloudinaryImages(allImages);

    // Delete the product from MongoDB
    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, deletedImages: allImages.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
