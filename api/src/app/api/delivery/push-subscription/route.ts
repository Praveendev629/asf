import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DeliveryPartner from "@/lib/models/DeliveryPartner";
import { requireDeliveryPartner } from "@/lib/deliveryAuth";

export async function POST(req: NextRequest) {
  try {
    const partnerData = await requireDeliveryPartner(req);
    await connectDB();
    const { subscription } = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "subscription required" }, { status: 400 });
    }

    await DeliveryPartner.findByIdAndUpdate(
      partnerData.partnerId,
      { $addToSet: { pushSubscriptions: { endpoint: subscription.endpoint, keys: subscription.keys } } }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const partnerData = await requireDeliveryPartner(req);
    await connectDB();
    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({ error: "endpoint required" }, { status: 400 });
    }

    await DeliveryPartner.findByIdAndUpdate(
      partnerData.partnerId,
      { $pull: { pushSubscriptions: { endpoint } } }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
