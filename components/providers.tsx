"use client";

import * as React from "react";
import { Toaster } from "sonner";

import { LanguageProvider } from "@/context/language-context";
import { DEFAULT_LOCALE, type Locale } from "@/types";

/** Globalni klientski ponudniki (jezik, toast obvestila). */
export function Providers({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(0 0% 7%)",
            border: "1px solid hsl(40 6% 18%)",
            color: "hsl(40 10% 92%)",
          },
        }}
      />
    </LanguageProvider>
  );
}
