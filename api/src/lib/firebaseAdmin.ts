import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set.");
  try {
    const jsonString = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(jsonString);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON or base64.");
  }
}

export function getAdminAuth() {
  if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    adminApp = initializeApp({ credential: cert(serviceAccount) });
  } else {
    adminApp = getApps()[0] as App;
  }
  return getAuth(adminApp);
}

export async function verifyIdToken(idToken: string) {
  return getAdminAuth().verifyIdToken(idToken);
}
