"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const operationsLinks = [
  { href: "/admin/operations/clients", key: "clients" },
  { href: "/admin/operations/consultants", key: "consultants" },
  { href: "/admin/operations/projects", key: "projects" },
  { href: "/admin/operations/missions", key: "missions" },
] as const;

export function OperationsShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <div className="flex gap-6">
      <aside className="w-48 shrink-0">
        <nav className="space-y-0.5 rounded-lg border border-zinc-200 bg-white p-1">
          {operationsLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-zinc-100 font-medium text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
