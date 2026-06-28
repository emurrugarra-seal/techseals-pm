"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const mainTabs = [
  { href: "/admin/dashboard", key: "dashboard" },
  { href: "/admin/operations/clients", key: "operations" },
] as const;

function isOperationsPath(pathname: string) {
  return pathname.startsWith("/admin/operations");
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const { signOutUser } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-zinc-900">{tCommon("appName")}</span>

            <nav className="flex items-center gap-1">
              {mainTabs.map((tab) => {
                const active =
                  tab.key === "operations"
                    ? isOperationsPath(pathname)
                    : pathname.startsWith(tab.href);

                return (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    {t(tab.key)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => signOutUser()}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              {tCommon("signOut")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
