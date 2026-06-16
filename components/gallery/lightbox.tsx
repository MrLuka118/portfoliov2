"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { useLanguage } from "@/context/language-context";
import { localized, type ImageDTO } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Lightbox prek shadcn Dialog komponente.
 * Temen overlay (črna 0.9+), fade/scale animacija, navigacija med slikami.
 */
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: ImageDTO[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const { t, locale } = useLanguage();
  const open = index !== null;
  const current = open ? images[index] : null;

  const goPrev = React.useCallback(() => {
    if (index === null) return;
    onIndexChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onIndexChange]);

  const goNext = React.useCallback(() => {
    if (index === null) return;
    onIndexChange((index + 1) % images.length);
  }, [index, images.length, onIndexChange]);

  // Tipkovnična navigacija (levo / desno).
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, goNext]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        hideClose
        className="flex h-[100dvh] max-h-none w-screen max-w-none items-center justify-center border-0 bg-transparent p-0 shadow-none sm:rounded-none"
      >
        {current && (
          <>
            <DialogTitle className="sr-only">
              {localized(current, locale)}
            </DialogTitle>

            {/* Zapri */}
            <button
              type="button"
              onClick={onClose}
              aria-label={t("gallery.close")}
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-5 w-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label={t("gallery.prev")}
                  className="absolute left-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-6"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label={t("gallery.next")}
                  className="absolute right-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-6"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            {/* Slika */}
            <div className="relative flex h-full w-full items-center justify-center px-4 py-16">
              <div className="relative h-full w-full">
                <Image
                  key={current.id}
                  src={current.imageUrl}
                  alt={localized(current, locale)}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Naslov + števec */}
            <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center">
              <p className="font-serif text-lg text-white">
                {localized(current, locale)}
              </p>
              {images.length > 1 && (
                <p className="mt-1 text-xs tracking-label text-white/60">
                  {t("gallery.imageOf", {
                    current: index! + 1,
                    total: images.length,
                  })}
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
