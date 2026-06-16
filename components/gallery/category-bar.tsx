"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useActiveSection } from "@/hooks/use-active-section";
import { localized, type CategoryDTO } from "@/types";
import {
  LayoutSwitcher,
  type GalleryLayout,
} from "@/components/gallery/layout-switcher";

/**
 * Fiksen horizonten meni kategorij (sticky pod glavno navigacijo).
 * Klik = smooth scroll do sekcije, aktivna kategorija je označena.
 * Na desni strani vsebuje preklopnik postavitve galerije.
 */
export function CategoryBar({
  categories,
  layout,
  onLayoutChange,
}: {
  categories: CategoryDTO[];
  layout: GalleryLayout;
  onLayoutChange: (layout: GalleryLayout) => void;
}) {
  const { locale } = useLanguage();
  const sectionIds = React.useMemo(
    () => categories.map((c) => c.slug),
    [categories]
  );
  const activeId = useActiveSection(sectionIds);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${slug}`);
    }
  };

  return (
    <div className="sticky top-16 z-30 border-y border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container flex items-center justify-between gap-4 py-3">
        <nav
          aria-label="Kategorije"
          className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto scrollbar-none"
        >
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.slug}`}
              onClick={(e) => handleClick(e, cat.slug)}
              aria-current={activeId === cat.slug ? "true" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-xs uppercase tracking-label transition-colors",
                activeId === cat.slug
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {localized(cat, locale)}
            </a>
          ))}
        </nav>
        <div className="hidden shrink-0 sm:block">
          <LayoutSwitcher value={layout} onChange={onLayoutChange} />
        </div>
      </div>
    </div>
  );
}
