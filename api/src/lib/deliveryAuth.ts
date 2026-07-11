import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.DELIVERY_JWT_SECRET || "asf-delivery-secret-change-me";

export interface DeliveryTokenPayload {
  partnerId: string;
  email: string;
}

export function signDeliveryToken(payload: DeliveryTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyDeliveryToken(token: string): DeliveryTokenPayload {
  return jwt.verify(token, JWT_SECRET) as DeliveryTokenPayload;
}

export async function requireDeliveryPartner(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) throw new Error("UNAUTHENTICATED");
  try {
    return verifyDeliveryToken(token);
  } catch {
    throw new Error("UNAUTHENTICATED");
  }
}
