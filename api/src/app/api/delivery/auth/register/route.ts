import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DeliveryPartner from "@/lib/models/DeliveryPartner";
import bcrypt from "bcryptjs";
import { signDeliveryToken } from "@/lib/deliveryAuth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, phone, email, password } = await req.json();
    if (!name || !phone || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    const existing = await DeliveryPartner.findOne({ email: email.toLowerCase() });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const hashed = await bcrypt.hash(password, 10);
    const partner = await DeliveryPartner.create({ name, phone, email: email.toLowerCase(), password: hashed });
    const token = signDeliveryToken({ partnerId: String(partner._id), email: partner.email });
    return NextResponse.json({ token, partner: { _id: partner._id, name: partner.name, phone: partner.phone, email: partner.email } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
