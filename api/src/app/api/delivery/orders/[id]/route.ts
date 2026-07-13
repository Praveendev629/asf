import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order, { ORDER_STAGES } from "@/lib/models/Order";
import DeliveryPartner from "@/lib/models/DeliveryPartner";
import { requireDeliveryPartner } from "@/lib/deliveryAuth";
import { haversineDistance, estimateDeliveryMinutes, formatETA } from "@/lib/distance";
import { notifyOrderStatusUpdate } from "@/lib/notifications";
import { notifyAdminOrderDelivered } from "@/lib/adminNotifications";

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

    let notifyStatus: string | null = null;

    if (body.action === "accept") {
      const partner = await DeliveryPartner.findById(partnerData.partnerId);
      if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

      order.deliveryPartner = {
        name: partner.name,
        phone: partner.phone,
        email: partner.email,
        eta: "",
        lat: partner.currentLocation?.lat,
        lng: partner.currentLocation?.lng,
      };

      if (partner.currentLocation && order.deliveryAddress?.lat && order.deliveryAddress?.lng) {
        const dist = haversineDistance(partner.currentLocation.lat, partner.currentLocation.lng, order.deliveryAddress.lat, order.deliveryAddress.lng);
        order.deliveryPartner.eta = formatETA(estimateDeliveryMinutes(dist));
      }

      order.status = "confirmed";
      order.statusHistory.push({ status: "confirmed", at: new Date() });
      notifyStatus = "confirmed";
    } else if (body.status && ORDER_STAGES.includes(body.status)) {
      order.status = body.status;
      order.statusHistory.push({ status: body.status, at: new Date() });
      notifyStatus = body.status;

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

    // Send push notification to customer
    if (notifyStatus) {
      await notifyOrderStatusUpdate(String(order._id), notifyStatus);
    }

    // Notify admin when order is delivered
    if (notifyStatus === "delivered") {
      await notifyAdminOrderDelivered(order.orderNumber, order.total);
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    const status = err.message === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
