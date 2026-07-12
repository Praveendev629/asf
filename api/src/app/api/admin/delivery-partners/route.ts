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
