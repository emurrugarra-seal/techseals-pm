/**
 * Clear Firestore app data (keeps Auth users by default).
 *
 * Usage:
 *   export FIREBASE_SERVICE_ACCOUNT_KEY="$(cat workspace/your-key.json)"
 *
 *   # Business data only (assignments, projects, clients, consultants)
 *   npx tsx scripts/clear-database.ts --confirm
 *
 *   # Also clear Firestore users/ profiles
 *   npx tsx scripts/clear-database.ts --confirm --with-users
 *
 *   # Also delete Firebase Authentication accounts
 *   npx tsx scripts/clear-database.ts --confirm --with-users --with-auth
 */
import {
  BUSINESS_COLLECTIONS,
  deleteAllAuthUsers,
  deleteCollection,
  hasFlag,
  initFirebaseAdmin,
} from "./lib/firebase-admin";

async function main() {
  if (!hasFlag("--confirm")) {
    console.error("Refusing to run without --confirm");
    console.error("");
    console.error("Usage:");
    console.error("  npx tsx scripts/clear-database.ts --confirm");
    console.error("  npx tsx scripts/clear-database.ts --confirm --with-users");
    console.error(
      "  npx tsx scripts/clear-database.ts --confirm --with-users --with-auth",
    );
    process.exit(1);
  }

  const withUsers = hasFlag("--with-users");
  const withAuth = hasFlag("--with-auth");

  if (withAuth && !withUsers) {
    console.error("--with-auth requires --with-users (Firestore users/ docs too)");
    process.exit(1);
  }

  const { db, projectId } = initFirebaseAdmin();
  const collections = withUsers
    ? [...BUSINESS_COLLECTIONS, "users"]
    : [...BUSINESS_COLLECTIONS];

  console.log(`Project: ${projectId}`);
  console.log(`Clearing collections: ${collections.join(", ")}`);
  if (withAuth) console.log("Also deleting Firebase Auth users");
  console.log("");

  for (const name of collections) {
    const count = await deleteCollection(db, name);
    console.log(`  ✓ ${name}: ${count} document(s) deleted`);
  }

  if (withAuth) {
    const authDeleted = await deleteAllAuthUsers();
    console.log(`  ✓ auth: ${authDeleted} user(s) deleted`);
  }

  console.log("");
  console.log("Done.");
  if (!withAuth) {
    console.log("Firebase Auth accounts were kept. Add --with-auth to remove them.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
