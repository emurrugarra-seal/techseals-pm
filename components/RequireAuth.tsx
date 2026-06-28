"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "admin" | "consultant";
}) {
  const { user, role: userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (role && userRole !== role) {
      router.replace(userRole === "admin" ? "/admin/dashboard" : "/consultant/projects");
    }
  }, [user, userRole, loading, role, router]);

  if (loading || !user || (role && userRole !== role)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
