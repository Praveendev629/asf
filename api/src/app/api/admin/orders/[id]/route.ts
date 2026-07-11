import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order, { ORDER_STAGES } from "@/lib/models/Order";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (body.status && ORDER_STAGES.includes(body.status)) {
      order.status = body.status;
      order.statusHistory.push({ status: body.status, at: new Date() });
    }
    if (body.deliveryPartner) order.deliveryPartner = body.deliveryPartner;
    if (body.userPhone) order.userPhone = body.userPhone;
    await order.save();
    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
