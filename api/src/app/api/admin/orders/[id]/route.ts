import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order, { ORDER_STAGES } from "@/lib/models/Order";
import { notifyOrderStatusUpdate } from "@/lib/notifications";
import { sendDeliveryNotification } from "@/lib/deliveryNotifications";
import DeliveryPartner from "@/lib/models/DeliveryPartner";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const order = await Order.findById(params.id).lean();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Update phone number
    if (body.userPhone) {
      order.userPhone = body.userPhone;
    }

    // Assign delivery partner
    if (body.deliveryPartner) {
      order.deliveryPartner = body.deliveryPartner;
    }

    // Update order status
    if (body.status && ORDER_STAGES.includes(body.status)) {
      order.status = body.status;
      order.statusHistory.push({ status: body.status, at: new Date() });
    }

    await order.save();

    // Notify user of status change
    if (body.status) {
      await notifyOrderStatusUpdate(String(order._id), body.status);
    }

    // Notify the assigned delivery partner about the new order
    if (body.deliveryPartner?.email) {
      const partner = await DeliveryPartner.findOne({ email: body.deliveryPartner.email });
      if (partner) {
        await sendDeliveryNotification(
          String(partner._id),
          "New Order Assigned!",
          `Order #${order.orderNumber} — ₹${order.total} has been assigned to you. Tap to view.`,
          { orderId: String(order._id), type: "order_assigned" }
        );
      }
    }

    // Notify admin when delivered
    if (body.status === "delivered") {
      const { notifyAdminOrderDelivered } = await import("@/lib/adminNotifications");
      await notifyAdminOrderDelivered(order.orderNumber, order.total);
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await Order.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
