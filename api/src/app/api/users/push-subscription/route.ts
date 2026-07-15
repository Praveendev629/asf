import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const decoded = await requireUser(req);
    await connectDB();
    const user = await User.findOne({ firebaseUid: decoded.uid }).lean();
    return NextResponse.json({
      firebaseUid: decoded.uid,
      pushSubscriptions: user?.pushSubscriptions?.length || 0,
      fcmTokens: user?.fcmTokens?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireUser(req);
    await connectDB();
    const { subscription } = await req.json();

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "subscription required" }, { status: 400 });
    }

    console.log("[Push] Saving subscription for user:", decoded.uid, "| endpoint:", subscription.endpoint.substring(0, 50) + "...");

    await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $addToSet: {
          pushSubscriptions: {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
        },
      },
      { upsert: true }
    );

    console.log("[Push] Subscription saved successfully");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Push] Save subscription error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const decoded = await requireUser(req);
    await connectDB();
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: "endpoint required" }, { status: 400 });
    }

    await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      { $pull: { pushSubscriptions: { endpoint } } }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
