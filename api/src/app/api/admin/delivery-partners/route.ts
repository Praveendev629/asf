import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DeliveryPartner from "@/lib/models/DeliveryPartner";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const partners = await DeliveryPartner.find({}).select("-password").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ partners }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, isAvailable } = body;
    if (!id) return NextResponse.json({ error: "Partner ID required" }, { status: 400 });

    await DeliveryPartner.findByIdAndUpdate(id, { isAvailable });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Partner ID required" }, { status: 400 });

    await DeliveryPartner.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
