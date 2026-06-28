import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { UserProfile } from "@/lib/types";

export async function verifyAdminRequest(
  authorizationHeader: string | null,
): Promise<{ uid: string; profile: UserProfile }> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authorizationHeader.slice("Bearer ".length);
  const decoded = await adminAuth.verifyIdToken(token);
  const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

  if (!userDoc.exists) {
    throw new Error("Unauthorized");
  }

  const profile = userDoc.data() as UserProfile;
  if (profile.role !== "admin") {
    throw new Error("Forbidden");
  }

  return { uid: decoded.uid, profile };
}
