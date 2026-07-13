import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DeliveryPartner from "@/lib/models/DeliveryPartner";
import { requireDeliveryPartner } from "@/lib/deliveryAuth";

export async function POST(req: NextRequest) {
  try {
    const partnerData = await requireDeliveryPartner(req);
    await connectDB();
    const { fcmToken } = await req.json();
    if (!fcmToken) return NextResponse.json({ error: "fcmToken required" }, { status: 400 });
    await DeliveryPartner.findByIdAndUpdate(partnerData.partnerId, { $addToSet: { fcmTokens: fcmToken } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
