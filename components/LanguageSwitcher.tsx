"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={locale}
      onChange={(event) =>
        router.replace(pathname, { locale: event.target.value })
      }
      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-700"
      aria-label="Language"
    >
      {routing.locales.map((code) => (
        <option key={code} value={code}>
          {code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
