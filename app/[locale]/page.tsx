"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function HomePage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }

    router.replace("/consultant/projects");
  }, [user, role, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-zinc-500">
      Loading...
    </div>
  );
}
