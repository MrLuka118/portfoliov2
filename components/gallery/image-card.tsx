"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { localized, type ImageDTO } from "@/types";

/**
 * Posamezna slika v galeriji z hover zoomom in overlay naslovom.
 * Klik odpre lightbox (preko onOpen).
 */
export function ImageCard({
  image,
  onOpen,
  priority = false,
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
}: {
  image: ImageDTO;
  onOpen: () => void;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}) {
  const { locale } = useLanguage();
  const title = localized(image, locale);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative block w-full overflow-hidden rounded-sm bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      aria-label={title}
    >
      <Image
        src={image.imageUrl}
        alt={title}
        width={image.width ?? 1200}
        height={image.height ?? 800}
        sizes={sizes}
        priority={priority}
        className={cn(
          "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]",
          imageClassName
        )}
      />
      {/* Overlay z naslovom */}
      <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="p-5">
          <span className="block h-px w-8 bg-accent" />
          <p className="mt-3 font-serif text-lg text-white">{title}</p>
        </div>
      </div>
    </button>
  );
}
