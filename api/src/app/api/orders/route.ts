import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import User from "@/lib/models/User";
import { requireUser } from "@/lib/auth";
import { notifyAllDeliveryPartners } from "@/lib/deliveryNotifications";

function generateOrderNumber() {
  return `ASF${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function GET(req: NextRequest) {
  try {
    const decoded = await requireUser(req);
    await connectDB();
    const orders = await Order.find({ userId: decoded.uid }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireUser(req);
    await connectDB();
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user || !user.phone || !user.address) {
      return NextResponse.json({ error: "Complete phone and address first." }, { status: 400 });
    }
    const body = await req.json();
    const items: { productId: string; quantity: number }[] = body.items || [];
    if (!items.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 });
      }
      product.stock -= item.quantity;
      await product.save();
      subtotal += product.price * item.quantity;
      orderItems.push({
        product: String(product._id),
        name: product.name,
        image: product.images[0] || "",
        price: product.price,
        quantity: item.quantity,
      });
    }

    const deliveryFee = subtotal >= 499 ? 0 : 29;
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: decoded.uid,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      deliveryAddress: user.address,
      items: orderItems,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      status: "placed",
      statusHistory: [{ status: "placed", at: new Date() }],
    });

    // Notify all available delivery partners about new order
    await notifyAllDeliveryPartners(String(order._id), order.orderNumber, order.total);

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
