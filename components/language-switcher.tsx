"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { LOCALES, LOCALE_LABELS } from "@/types";

/** Preklopnik jezika SLO / HR / EN. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Izbira jezika"
      className={cn(
        "flex items-center gap-1 text-xs tracking-label",
        className
      )}
    >
      {LOCALES.map((code, i) => (
        <React.Fragment key={code}>
          {i > 0 && <span className="text-muted-foreground/40">/</span>}
          <button
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={locale === code}
            className={cn(
              "rounded px-1.5 py-1 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              locale === code
                ? "text-accent"
                : "text-muted-foreground"
            )}
          >
            {LOCALE_LABELS[code]}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
