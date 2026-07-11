import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DeliveryPartner from "@/lib/models/DeliveryPartner";
import bcrypt from "bcryptjs";
import { signDeliveryToken } from "@/lib/deliveryAuth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const partner = await DeliveryPartner.findOne({ email: email.toLowerCase() });
    if (!partner) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, partner.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signDeliveryToken({ partnerId: String(partner._id), email: partner.email });

    return NextResponse.json({
      token,
      partner: {
        _id: partner._id,
        name: partner.name,
        phone: partner.phone,
        email: partner.email,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 400 });
  }
}
