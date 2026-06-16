import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";
import { Providers } from "@/components/providers";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/types";

// Sans-serif za telo besedila.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

// Serif za naslove in kurzivne poudarke.
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Luka Photography — Photography & Videography",
  description:
    "Luka Photography — visual stories captured with an eye for light, detail and the decisive moment.",
  openGraph: {
    title: "Luka Photography",
    description:
      "Visual stories captured with an eye for light, detail and the decisive moment.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Preberi shranjen jezik iz piškotka (za pravilen <html lang> ob SSR).
  const cookieStore = await cookies();
  const stored = cookieStore.get("luka-locale")?.value as Locale | undefined;
  const initialLocale =
    stored && LOCALES.includes(stored) ? stored : DEFAULT_LOCALE;

  return (
    <html lang={initialLocale} className={`${inter.variable} ${playfair.variable} dark`}>
      <body>
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
