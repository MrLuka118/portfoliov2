"use client";

import * as React from "react";

import sl from "@/messages/sl.json";
import hr from "@/messages/hr.json";
import en from "@/messages/en.json";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/types";

type Messages = typeof sl;

const MESSAGES: Record<Locale, Messages> = { sl, hr, en };

const STORAGE_KEY = "luka-locale";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Prevedi po pikčasti poti, npr. t("hero.subtitle"). Podpira {param} zamenjave. */
  t: (path: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

/** Varno preberi vrednost iz gnezdenega objekta po "a.b.c" poti. */
function resolvePath(obj: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof value === "string" ? value : path;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  // Ob prvem renderju na klientu preberi shranjeno izbiro (localStorage).
  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.includes(stored)) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    // Cookie zato, da bi ga lahko prebral tudi strežnik (npr. <html lang>).
    document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  const t = React.useCallback(
    (path: string, params?: Record<string, string | number>) => {
      let str = resolvePath(MESSAGES[locale], path);
      if (params) {
        for (const [key, val] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
        }
      }
      return str;
    },
    [locale]
  );

  const value = React.useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

/** Hook za dostop do jezika in prevodov. */
export function useLanguage(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage mora biti uporabljen znotraj <LanguageProvider>.");
  }
  return ctx;
}
