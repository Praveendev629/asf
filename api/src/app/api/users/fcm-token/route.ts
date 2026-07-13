import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireUser(req);
    await connectDB();
    const { fcmToken } = await req.json();
    if (!fcmToken) return NextResponse.json({ error: "fcmToken required" }, { status: 400 });

    await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      { $addToSet: { fcmTokens: fcmToken } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
