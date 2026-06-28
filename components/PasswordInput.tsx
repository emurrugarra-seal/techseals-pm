"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formInputClass } from "@/lib/ui";

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
}

export function PasswordInput({
  id,
  value,
  onChange,
  required,
  minLength,
}: PasswordInputProps) {
  const tCommon = useTranslations("common");
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${formInputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        aria-label={visible ? tCommon("hidePassword") : tCommon("showPassword")}
      >
        {visible ? tCommon("hidePassword") : tCommon("showPassword")}
      </button>
    </div>
  );
}
