/**
 * Full reset: all Firestore collections + all Auth users.
 * Optionally recreate the admin account in the same run.
 *
 * Usage:
 *   export FIREBASE_SERVICE_ACCOUNT_KEY="$(cat workspace/your-key.json)"
 *
 *   # Wipe everything
 *   npx tsx scripts/reset-total.ts --confirm RESET
 *
 *   # Wipe + create new admin immediately
 *   npx tsx scripts/reset-total.ts --confirm RESET admin@techseals.nl "YourPassword" "Admin Name"
 */
import { getAuth } from "firebase-admin/auth";
import {
  APP_COLLECTIONS,
  deleteAllAuthUsers,
  deleteCollection,
  getFlagValue,
  initFirebaseAdmin,
} from "./lib/firebase-admin";

async function main() {
  const confirmValue = getFlagValue("--confirm");
  if (confirmValue !== "RESET") {
    console.error('Refusing to run without --confirm RESET');
    console.error("");
    console.error("Usage:");
    console.error("  npx tsx scripts/reset-total.ts --confirm RESET");
    console.error(
      '  npx tsx scripts/reset-total.ts --confirm RESET admin@email.com "password" "Display Name"',
    );
    process.exit(1);
  }

  const confirmIndex = process.argv.indexOf("--confirm");
  const positional = process.argv.slice(confirmIndex + 2);
  const [adminEmail, adminPassword, adminName = "Admin"] = positional;

  const { db, projectId } = initFirebaseAdmin();

  console.log(`Project: ${projectId}`);
  console.log("FULL RESET — this cannot be undone");
  console.log("");

  for (const name of APP_COLLECTIONS) {
    const count = await deleteCollection(db, name);
    console.log(`  ✓ ${name}: ${count} document(s) deleted`);
  }

  const authDeleted = await deleteAllAuthUsers();
  console.log(`  ✓ auth: ${authDeleted} user(s) deleted`);

  if (adminEmail && adminPassword) {
    const auth = getAuth();
    const user = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: adminName,
    });
    const now = new Date().toISOString();

    await db.collection("users").doc(user.uid).set({
      email: adminEmail,
      role: "admin",
      displayName: adminName,
      createdAt: now,
    });

    console.log("");
    console.log(`  ✓ admin recreated: ${adminEmail} (uid: ${user.uid})`);
  } else {
    console.log("");
    console.log("No admin recreated. Run:");
    console.log(
      '  npx tsx scripts/create-admin.ts admin@email.com "password" "Admin Name"',
    );
  }

  console.log("");
  console.log("Reset complete.");
  console.log("");
  console.log("Note: this clears data inside Firestore, not the database itself.");
  console.log("If you deleted the database in Firebase Console, redeploy rules:");
  console.log("  firebase deploy --only firestore:rules --project techseals-pm");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
