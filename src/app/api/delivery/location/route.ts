import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DeliveryPartner from "@/lib/models/DeliveryPartner";
import { requireDeliveryPartner } from "@/lib/deliveryAuth";

export async function POST(req: NextRequest) {
  try {
    const partnerData = await requireDeliveryPartner(req);
    await connectDB();
    const { lat, lng } = await req.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    await DeliveryPartner.findByIdAndUpdate(partnerData.partnerId, {
      currentLocation: { lat, lng },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const status = err.message === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
