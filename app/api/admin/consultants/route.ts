import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/verifyAdmin";
import { DEFAULT_WEEKLY_CAPACITY } from "@/lib/constants";
import type { CreateConsultantInput } from "@/lib/types";

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

    return NextResponse.json({
      id: consultantRef.id,
      userId: userRecord.uid,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
