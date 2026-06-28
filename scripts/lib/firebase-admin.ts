import { initializeApp, cert, getApps, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export const APP_COLLECTIONS = [
  "assignments",
  "projects",
  "clients",
  "consultants",
  "users",
] as const;

export const BUSINESS_COLLECTIONS = [
  "assignments",
  "projects",
  "clients",
  "consultants",
] as const;

export function initFirebaseAdmin() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error(
      "Set FIREBASE_SERVICE_ACCOUNT_KEY with your service account JSON string.",
    );
    console.error(
      'Example: export FIREBASE_SERVICE_ACCOUNT_KEY="$(cat workspace/your-key.json)"',
    );
    process.exit(1);
  }

  const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount & {
    project_id?: string;
  };

  const projectId = serviceAccount.projectId ?? serviceAccount.project_id;

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
    projectId,
  };
}

export async function deleteCollection(
  db: Firestore,
  collectionName: string,
): Promise<number> {
  const colRef = db.collection(collectionName);
  let deleted = 0;

  while (true) {
    const snap = await colRef.limit(500).get();
    if (snap.empty) break;

    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += snap.size;
  }

  return deleted;
}

export async function deleteAllAuthUsers(): Promise<number> {
  const auth = getAuth();
  let deleted = 0;
  let pageToken: string | undefined;

  do {
    const result = await auth.listUsers(1000, pageToken);
    const uids = result.users.map((user) => user.uid);

    if (uids.length > 0) {
      const deleteResult = await auth.deleteUsers(uids);
      deleted += deleteResult.successCount;
      if (deleteResult.failureCount > 0) {
        deleteResult.errors.forEach((err) =>
          console.warn(`  Auth delete warning: ${err.error.message}`),
        );
      }
    }

    pageToken = result.pageToken;
  } while (pageToken);

  return deleted;
}

export function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

export function getFlagValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) return undefined;
  return process.argv[index + 1];
}
