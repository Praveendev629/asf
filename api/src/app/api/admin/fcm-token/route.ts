import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, fcmToken } = await req.json();
    if (!email || !fcmToken) return NextResponse.json({ error: "email and fcmToken required" }, { status: 400 });

    await Admin.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $addToSet: { fcmTokens: fcmToken } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
