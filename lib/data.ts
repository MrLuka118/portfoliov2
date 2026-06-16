import { prisma } from "@/lib/prisma";
import type { CategoryDTO, CategoryWithImages, ImageDTO } from "@/types";

/** Ključi nastavitev v tabeli `settings`. */
export const SETTING_KEYS = {
  heroImage: "heroImageUrl",
  aboutImage: "aboutImageUrl",
} as const;

/** Dovoljeni ključi za nalaganje slik strani (varnostni allowlist). */
export const IMAGE_SETTING_KEYS: Record<string, string> = {
  [SETTING_KEYS.heroImage]: "hero",
  [SETTING_KEYS.aboutImage]: "about",
};

/** Privzeta naslovna fotografija, dokler je ni admin zamenjal. */
export const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2400&q=80";

/** Privzeti portret v About sekciji, dokler ga admin ne zamenja. */
export const ABOUT_FALLBACK =
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80";

/** Prebere vrednost nastavitve (ali null). */
export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

/** URL naslovne fotografije (z padcem na privzeto). */
export async function getHeroImage(): Promise<string> {
  return (await getSetting(SETTING_KEYS.heroImage)) ?? HERO_FALLBACK;
}

/** URL portreta v About sekciji (z padcem na privzeto). */
export async function getAboutImage(): Promise<string> {
  return (await getSetting(SETTING_KEYS.aboutImage)) ?? ABOUT_FALLBACK;
}

/** Pretvori Prisma Image v serializabilen DTO. */
function toImageDTO(img: {
  id: string;
  titleSl: string;
  titleHr: string;
  titleEn: string;
  imageUrl: string;
  width: number | null;
  height: number | null;
  categoryId: string;
  createdAt: Date;
}): ImageDTO {
  return {
    id: img.id,
    title_sl: img.titleSl,
    title_hr: img.titleHr,
    title_en: img.titleEn,
    imageUrl: img.imageUrl,
    width: img.width,
    height: img.height,
    categoryId: img.categoryId,
    createdAt: img.createdAt.toISOString(),
  };
}

/** Kategorije skupaj s slikami, urejene po vrstnem redu (za izris sekcij). */
export async function getCategoriesWithImages(): Promise<CategoryWithImages[]> {
  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    include: {
      images: { orderBy: { createdAt: "desc" } },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    title_sl: cat.titleSl,
    title_hr: cat.titleHr,
    title_en: cat.titleEn,
    imageCount: cat.images.length,
    images: cat.images.map(toImageDTO),
  }));
}

/** Samo kategorije (brez slik) – za navigacijo. */
export async function getCategories(): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { images: true } } },
  });

  return categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    title_sl: cat.titleSl,
    title_hr: cat.titleHr,
    title_en: cat.titleEn,
    imageCount: cat._count.images,
  }));
}

/** Vse slike (za admin seznam). */
export async function getAllImages(): Promise<ImageDTO[]> {
  const images = await prisma.image.findMany({
    orderBy: { createdAt: "desc" },
  });
  return images.map(toImageDTO);
}
