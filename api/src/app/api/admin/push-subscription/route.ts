import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, subscription } = await req.json();
    if (!email || !subscription?.endpoint) {
      return NextResponse.json({ error: "email and subscription required" }, { status: 400 });
    }

    await Admin.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $addToSet: { pushSubscriptions: { endpoint: subscription.endpoint, keys: subscription.keys } } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { email, endpoint } = await req.json();
    if (!email || !endpoint) {
      return NextResponse.json({ error: "email and endpoint required" }, { status: 400 });
    }

    await Admin.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $pull: { pushSubscriptions: { endpoint } } }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
