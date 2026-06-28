import { NextResponse } from "next/server";
import { FirebaseAuthError } from "firebase-admin/auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/verifyAdmin";
import { DEFAULT_WEEKLY_CAPACITY } from "@/lib/constants";
import type { CreateConsultantInput } from "@/lib/types";

function mapAuthError(error: FirebaseAuthError): { message: string; status: number } {
  switch (error.code) {
    case "auth/email-already-exists":
      return { message: "This email is already registered.", status: 409 };
    case "auth/invalid-email":
      return { message: "Invalid email address.", status: 400 };
    case "auth/invalid-password":
      return { message: "Password must be at least 6 characters.", status: 400 };
    case "auth/weak-password":
      return { message: "Password is too weak.", status: 400 };
    default:
      return { message: error.message, status: 500 };
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdminRequest(request.headers.get("authorization"));

    const body = (await request.json()) as CreateConsultantInput;
    const {
      name,
      email,
      password,
      jobRole,
      seniority,
      weeklyCapacityHours = DEFAULT_WEEKLY_CAPACITY,
    } = body;

    if (!name || !email || !password || !jobRole || !seniority) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    const now = new Date().toISOString();
    const consultantRef = adminDb.collection("consultants").doc();

    try {
      await adminDb.runTransaction(async (transaction) => {
        transaction.set(consultantRef, {
          name,
          email,
          jobRole,
          seniority,
          weeklyCapacityHours,
          active: true,
          userId: userRecord.uid,
          createdAt: now,
          updatedAt: now,
        });

        transaction.set(adminDb.collection("users").doc(userRecord.uid), {
          email,
          role: "consultant",
          consultantId: consultantRef.id,
          displayName: name,
          createdAt: now,
        });
      });
    } catch (firestoreError) {
      await adminAuth.deleteUser(userRecord.uid).catch(() => undefined);
      throw firestoreError;
    }

    return NextResponse.json({
      id: consultantRef.id,
      userId: userRecord.uid,
    });
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      const mapped = mapAuthError(error);
      return NextResponse.json({ error: mapped.message }, { status: mapped.status });
    }

    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : message.includes("Firebase Admin is not configured")
            ? 503
            : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
