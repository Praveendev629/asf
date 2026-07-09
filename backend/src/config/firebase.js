const admin = require("firebase-admin");

// The service account JSON is stored as a base64 string in the
// FIREBASE_SERVICE_ACCOUNT_BASE64 env var so it can be safely pasted
// into Render's environment variable UI (no multiline JSON issues).
function initFirebase() {
  if (admin.apps.length) return admin;

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    console.warn(
      "[firebase] FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. Firebase Admin SDK is disabled."
    );
    return admin;
  }

  const json = Buffer.from(base64, "base64").toString("utf8");
  const serviceAccount = JSON.parse(json);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`,
  });

  return admin;
}

const firebaseAdmin = initFirebase();
const db = firebaseAdmin.apps.length ? firebaseAdmin.firestore() : null;
const messaging = firebaseAdmin.apps.length ? firebaseAdmin.messaging() : null;

module.exports = { admin: firebaseAdmin, db, messaging };
