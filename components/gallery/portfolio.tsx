"use client";

import * as React from "react";

import { useLanguage } from "@/context/language-context";
import { localized, type CategoryWithImages, type ImageDTO } from "@/types";
import { Reveal } from "@/components/reveal";
import { CategoryBar } from "@/components/gallery/category-bar";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Lightbox } from "@/components/gallery/lightbox";
import type { GalleryLayout } from "@/components/gallery/layout-switcher";

/**
 * Glavni del portfolia: fiksen meni kategorij + sekcije z galerijami.
 * Vsaka kategorija je svoja sekcija z anchor ID (= slug) za smooth scroll.
 * Postavitev (layout) je skupna vsem galerijam in se preklaplja brez reloada.
 */
export function Portfolio({ categories }: { categories: CategoryWithImages[] }) {
  const { t, locale } = useLanguage();
  const [layout, setLayout] = React.useState<GalleryLayout>("masonry");

  // Stanje lightboxa: katera kategorija in kateri indeks slike je odprt.
  const [lightbox, setLightbox] = React.useState<{
    images: ImageDTO[];
    index: number | null;
  }>({ images: [], index: null });

  const openLightbox = (images: ImageDTO[], index: number) =>
    setLightbox({ images, index });
  const closeLightbox = () =>
    setLightbox((prev) => ({ ...prev, index: null }));

  if (categories.length === 0) {
    return (
      <section id="portfolio" className="container py-32 text-center">
        <p className="text-muted-foreground">{t("gallery.emptyAll")}</p>
      </section>
    );
  }

  return (
    <div id="portfolio" className="scroll-mt-16">
      <CategoryBar
        categories={categories}
        layout={layout}
        onLayoutChange={setLayout}
      />

      <div className="space-y-24 py-16 sm:py-24">
        {categories.map((cat) => (
          <section
            key={cat.id}
            id={cat.slug}
            className="container scroll-mt-32"
            aria-label={localized(cat, locale)}
          >
            <Reveal className="mb-10 flex items-end justify-between gap-6">
              <div>
                <span className="accent-rule mb-4 block" />
                <h2 className="font-serif text-3xl font-light sm:text-4xl">
                  {localized(cat, locale)}
                </h2>
              </div>
              <span className="hidden text-xs tracking-label text-muted-foreground sm:block">
                {String(cat.imageCount).padStart(2, "0")}
              </span>
            </Reveal>

            {cat.images.length > 0 ? (
              <GalleryGrid
                images={cat.images}
                layout={layout}
                onOpen={(index) => openLightbox(cat.images, index)}
              />
            ) : (
              <p className="py-8 text-sm text-muted-foreground">
                {t("gallery.empty")}
              </p>
            )}
          </section>
        ))}
      </div>

      <Lightbox
        images={lightbox.images}
        index={lightbox.index}
        onIndexChange={(index) => setLightbox((prev) => ({ ...prev, index }))}
        onClose={closeLightbox}
      />
    </div>
  );
}
