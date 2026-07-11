import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Paste the full service account JSON (base64 or raw) as an env var."
    );
  }
  try {
    // Support both raw JSON and base64-encoded JSON
    const jsonString = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON or base64-encoded JSON.");
  }
}

export function getAdminAuth() {
  if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    adminApp = getApps()[0] as App;
  }
  return getAuth(adminApp);
}

export async function verifyIdToken(idToken: string) {
  const auth = getAdminAuth();
  return auth.verifyIdToken(idToken);
}
