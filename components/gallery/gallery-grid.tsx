"use client";

import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { ImageDTO } from "@/types";
import { ImageCard } from "@/components/gallery/image-card";
import type { GalleryLayout } from "@/components/gallery/layout-switcher";

/**
 * Izriše seznam slik v izbrani postavitvi (masonry / grid / stacked).
 * Mehek prehod med postavitvami prek AnimatePresence.
 */
export function GalleryGrid({
  images,
  layout,
  onOpen,
}: {
  images: ImageDTO[];
  layout: GalleryLayout;
  onOpen: (index: number) => void;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={layout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {layout === "masonry" && (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {images.map((image, i) => (
              <div key={image.id} className="break-inside-avoid">
                <ImageCard image={image} onOpen={() => onOpen(i)} priority={i < 3} />
              </div>
            ))}
          </div>
        )}

        {layout === "grid" && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {images.map((image, i) => (
              <ImageCard
                key={image.id}
                image={image}
                onOpen={() => onOpen(i)}
                priority={i < 3}
                className="aspect-square"
                imageClassName="h-full"
              />
            ))}
          </div>
        )}

        {layout === "stacked" && (
          <div className="flex flex-col gap-6">
            {images.map((image, i) => (
              <ImageCard
                key={image.id}
                image={image}
                onOpen={() => onOpen(i)}
                priority={i < 2}
                className={cn("h-[78vh] min-h-[420px]")}
                imageClassName="h-full"
                sizes="100vw"
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
