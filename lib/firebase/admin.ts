import {
  initializeApp,
  getApps,
  cert,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadServiceAccount(): ServiceAccount {
  const fromPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (fromPath) {
    const absolutePath = resolve(process.cwd(), fromPath);
    return JSON.parse(readFileSync(absolutePath, "utf8")) as ServiceAccount;
  }

  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (inline) {
    return JSON.parse(inline) as ServiceAccount;
  }

  throw new Error(
    "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY in .env.local, then restart the dev server.",
  );
}

function createAdminApp(): App {
  if (getApps().length) {
    return getApps()[0]!;
  }

  const serviceAccount = loadServiceAccount();
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    (serviceAccount as ServiceAccount & { project_id?: string }).project_id;

  return initializeApp({
    credential: cert(serviceAccount),
    projectId,
  });
}

let adminApp: App | null = null;

function getAdminApp(): App {
  if (!adminApp) {
    adminApp = createAdminApp();
  }
  return adminApp;
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
