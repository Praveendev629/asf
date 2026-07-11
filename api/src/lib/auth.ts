import { NextRequest } from "next/server";
import { verifyIdToken } from "./firebaseAdmin";

export async function requireUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) throw new Error("UNAUTHENTICATED");
  return verifyIdToken(token);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}

export async function requireAdmin(req: NextRequest) {
  const decoded = await requireUser(req);
  if (!isAdminEmail(decoded.email)) throw new Error("FORBIDDEN");
  return decoded;
}
