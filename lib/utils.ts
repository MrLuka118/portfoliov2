import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Združi pogojne Tailwind razrede in razreši konflikte. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Pretvori besedilo v URL-prijazno oznako (slug) za anchor sekcije. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // odstrani diakritiko
    .replace(/[čć]/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
