import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Update from "@/lib/models/Update";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
}

export async function GET() {
  try {
    await connectDB();
    const updates = await Update.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ updates }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const update = await Update.create(body);
    return NextResponse.json({ update }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...update } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // If replacing image, delete old one from Cloudinary
    if (update.imageUrl) {
      const existing = await Update.findById(id);
      if (existing?.imageUrl) {
        const publicId = extractPublicId(existing.imageUrl);
        if (publicId) {
          try { await cloudinary.uploader.destroy(publicId); } catch {}
        }
      }
    }

    const updated = await Update.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json({ update: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const update = await Update.findById(id);
    if (update?.imageUrl) {
      const publicId = extractPublicId(update.imageUrl);
      if (publicId) {
        try { await cloudinary.uploader.destroy(publicId); } catch {}
      }
    }

    await Update.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
