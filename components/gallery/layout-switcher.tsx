"use client";

import { LayoutGrid, Rows3, Square } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

export type GalleryLayout = "masonry" | "stacked" | "grid";

const OPTIONS: { value: GalleryLayout; icon: typeof LayoutGrid; labelKey: string }[] = [
  { value: "masonry", icon: LayoutGrid, labelKey: "gallery.layoutMasonry" },
  { value: "grid", icon: Square, labelKey: "gallery.layoutGrid" },
  { value: "stacked", icon: Rows3, labelKey: "gallery.layoutStacked" },
];

/** Preklopnik postavitve galerije (majhne ikone). */
export function LayoutSwitcher({
  value,
  onChange,
}: {
  value: GalleryLayout;
  onChange: (value: GalleryLayout) => void;
}) {
  const { t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("gallery.viewLayout")}
      className="flex items-center gap-1 rounded-md border border-border bg-card/60 p-1"
    >
      {OPTIONS.map(({ value: option, icon: Icon, labelKey }) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          title={t(labelKey)}
          aria-label={t(labelKey)}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === option
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
