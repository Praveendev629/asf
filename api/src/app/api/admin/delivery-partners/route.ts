import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DeliveryPartner from "@/lib/models/DeliveryPartner";

export async function GET() {
  try {
    await connectDB();
    const partners = await DeliveryPartner.find({}).select("-password").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ partners });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...update } = body;
    if (!id) return NextResponse.json({ error: "Partner ID required" }, { status: 400 });
    const partner = await DeliveryPartner.findByIdAndUpdate(id, update, { new: true }).select("-password");
    if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ partner });
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
