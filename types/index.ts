/** Podprti jeziki. SLO je privzeti. */
export type Locale = "sl" | "hr" | "en";

export const LOCALES: Locale[] = ["sl", "hr", "en"];
export const DEFAULT_LOCALE: Locale = "sl";

/** Oznake jezikov za preklopnik. */
export const LOCALE_LABELS: Record<Locale, string> = {
  sl: "SLO",
  hr: "HR",
  en: "EN",
};

/** Kategorija, kot jo vrnejo javni API-ji (vsa tri jezikovna polja). */
export interface CategoryDTO {
  id: string;
  slug: string;
  title_sl: string;
  title_hr: string;
  title_en: string;
  imageCount: number;
}

/** Slika, kot jo vrnejo javni API-ji. */
export interface ImageDTO {
  id: string;
  title_sl: string;
  title_hr: string;
  title_en: string;
  imageUrl: string;
  width: number | null;
  height: number | null;
  categoryId: string;
  createdAt: string;
}

/** Kategorija skupaj s svojimi slikami (za izris sekcij). */
export interface CategoryWithImages extends CategoryDTO {
  images: ImageDTO[];
}

/** Pomožna funkcija: izberi pravo jezikovno polje iz objekta s title_sl/hr/en. */
export function localized(
  item: { title_sl: string; title_hr: string; title_en: string },
  locale: Locale
): string {
  const value = item[`title_${locale}` as const];
  // Padec nazaj na slovenščino, če prevod manjka.
  return value && value.trim().length > 0 ? value : item.title_sl;
}
