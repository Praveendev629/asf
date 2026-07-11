import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { requireDeliveryPartner } from "@/lib/deliveryAuth";

export async function GET(req: NextRequest) {
  try {
    const partner = await requireDeliveryPartner(req);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");

    let query: Record<string, unknown>;

    if (filter === "my") {
      // Show orders assigned to this partner (by email match)
      query = { "deliveryPartner.email": partner.email };
    } else {
      // Show available orders: no partner assigned yet, still in placed status
      query = {
        status: "placed",
        $or: [
          { "deliveryPartner.email": { $exists: false } },
          { "deliveryPartner.email": null },
          { "deliveryPartner.email": "" },
        ],
      };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ orders });
  } catch (err: any) {
    const status = err.message === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
