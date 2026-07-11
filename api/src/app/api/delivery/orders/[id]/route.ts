import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order, { ORDER_STAGES } from "@/lib/models/Order";
import DeliveryPartner from "@/lib/models/DeliveryPartner";
import { requireDeliveryPartner } from "@/lib/deliveryAuth";
import { haversineDistance, estimateDeliveryMinutes, formatETA } from "@/lib/distance";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireDeliveryPartner(req);
    await connectDB();
    const order = await Order.findById(params.id).lean();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err: any) {
    const status = err.message === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerData = await requireDeliveryPartner(req);
    await connectDB();
    const body = await req.json();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.action === "accept") {
      const partner = await DeliveryPartner.findById(partnerData.partnerId);
      if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });
      order.deliveryPartner = { name: partner.name, phone: partner.phone, eta: "", lat: partner.currentLocation?.lat, lng: partner.currentLocation?.lng };
      if (partner.currentLocation && order.deliveryAddress?.lat && order.deliveryAddress?.lng) {
        const dist = haversineDistance(partner.currentLocation.lat, partner.currentLocation.lng, order.deliveryAddress.lat, order.deliveryAddress.lng);
        order.deliveryPartner.eta = formatETA(estimateDeliveryMinutes(dist));
      }
      order.status = "confirmed";
      order.statusHistory.push({ status: "confirmed", at: new Date() });
    } else if (body.status && ORDER_STAGES.includes(body.status)) {
      order.status = body.status;
      order.statusHistory.push({ status: body.status, at: new Date() });
      if (body.lat && body.lng && order.deliveryAddress?.lat && order.deliveryAddress?.lng) {
        const dist = haversineDistance(body.lat, body.lng, order.deliveryAddress.lat, order.deliveryAddress.lng);
        if (order.deliveryPartner) {
          order.deliveryPartner.eta = formatETA(estimateDeliveryMinutes(dist));
          order.deliveryPartner.lat = body.lat;
          order.deliveryPartner.lng = body.lng;
        }
      }
    }

    await order.save();
    return NextResponse.json({ order });
  } catch (err: any) {
    const status = err.message === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
