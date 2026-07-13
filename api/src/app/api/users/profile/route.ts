import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { requireUser } from "@/lib/auth";
import { notifyAdminNewCustomer } from "@/lib/adminNotifications";

export async function GET(req: NextRequest) {
  try {
    const decoded = await requireUser(req);
    await connectDB();
    const user = await User.findOne({ firebaseUid: decoded.uid }).lean();
    return NextResponse.json({ user: user || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireUser(req);
    await connectDB();
    const body = await req.json();

    // Check if this is a new user
    const existingUser = await User.findOne({ firebaseUid: decoded.uid });

    const update: Record<string, unknown> = {
      firebaseUid: decoded.uid,
      name: decoded.name || body.name || "ASF Customer",
      email: decoded.email,
      photoURL: decoded.picture,
    };
    if (body.phone) update.phone = body.phone;
    if (body.address) update.address = body.address;
    const isComplete = Boolean((body.phone || undefined) && body.address);

    const user = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      { $set: { ...update, ...(isComplete ? { onboardingComplete: true } : {}) } },
      { upsert: true, new: true }
    );

    // Notify admin if new customer
    if (!existingUser) {
      await notifyAdminNewCustomer(user.name, user.email);
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
