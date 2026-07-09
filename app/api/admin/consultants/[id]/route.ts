import { NextResponse } from "next/server";
import { FirebaseAuthError } from "firebase-admin/auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/verifyAdmin";
import { DEFAULT_WEEKLY_CAPACITY } from "@/lib/constants";
import type { Consultant, UpdateConsultantInput } from "@/lib/types";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await verifyAdminRequest(request.headers.get("authorization"));

    const { id } = await params;
    const body = (await request.json()) as UpdateConsultantInput;
    const {
      name,
      email,
      password,
      jobRole,
      seniority,
      weeklyCapacityHours = DEFAULT_WEEKLY_CAPACITY,
      active,
    } = body;

    if (!name || !email || !jobRole || !seniority || active == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const consultantRef = adminDb.collection("consultants").doc(id);
    const consultantSnap = await consultantRef.get();

    if (!consultantSnap.exists) {
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 });
    }

    const consultant = consultantSnap.data() as Omit<Consultant, "id">;
    const now = new Date().toISOString();

    if (consultant.userId) {
      const authUpdate: {
        email?: string;
        displayName: string;
        password?: string;
        disabled?: boolean;
      } = {
        displayName: name,
        disabled: !active,
      };

      if (email !== consultant.email) {
        authUpdate.email = email;
      }

      if (password) {
        authUpdate.password = password;
      }

      await adminAuth.updateUser(consultant.userId, authUpdate);

      await adminDb.collection("users").doc(consultant.userId).update({
        email,
        displayName: name,
      });
    }

    await consultantRef.update({
      name,
      email,
      jobRole,
      seniority,
      weeklyCapacityHours,
      active,
      updatedAt: now,
    });

    return NextResponse.json({ id });
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
