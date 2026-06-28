/**
 * One-time script to create the first admin user.
 *
 * Usage:
 * 1. Download service account JSON from Firebase Console
 * 2. export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
 * 3. npx tsx scripts/create-admin.ts admin@techseals.com YourPassword "Admin Name"
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const [email, password, displayName = "Admin"] = process.argv.slice(2);

if (!email || !password) {
  console.error(
    "Usage: npx tsx scripts/create-admin.ts <email> <password> [displayName]",
  );
  process.exit(1);
}

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
  console.error("Set FIREBASE_SERVICE_ACCOUNT_KEY env var with service account JSON");
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountKey);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const auth = getAuth();
const db = getFirestore();

async function main() {
  const user = await auth.createUser({ email, password, displayName });
  const now = new Date().toISOString();

  await db.collection("users").doc(user.uid).set({
    email,
    role: "admin",
    displayName,
    createdAt: now,
  });

  console.log(`Admin created: ${email} (uid: ${user.uid})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
