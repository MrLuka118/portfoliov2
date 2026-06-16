"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Side = "left" | "right" | "top" | "bottom";

/**
 * Postopen blur na robu (npr. ob InfiniteSlider).
 * Sestavljen iz več plasti backdrop-blur z naraščajočo intenziteto in maskami.
 */
export function ProgressiveBlur({
  className,
  direction = "left",
  blurLayers = 5,
  blurIntensity = 0.5,
}: {
  className?: string;
  direction?: Side;
  blurLayers?: number;
  blurIntensity?: number;
}) {
  const layers = Math.max(blurLayers, 2);
  const segment = 1 / layers;

  const gradientDirection: Record<Side, string> = {
    left: "to right",
    right: "to left",
    top: "to bottom",
    bottom: "to top",
  };

  return (
    <div className={cn("pointer-events-none relative", className)}>
      {Array.from({ length: layers }).map((_, index) => {
        const start = segment * index;
        const mid1 = segment * (index + 1);
        const mid2 = segment * (index + 2);
        const end = segment * (index + 3);
        const dir = gradientDirection[direction];
        const maskImage = `linear-gradient(${dir}, rgba(0,0,0,0) ${start * 100}%, rgba(0,0,0,1) ${mid1 * 100}%, rgba(0,0,0,1) ${mid2 * 100}%, rgba(0,0,0,0) ${end * 100}%)`;
        return (
          <div
            key={index}
            className="absolute inset-0 rounded-[inherit]"
            style={{
              maskImage,
              WebkitMaskImage: maskImage,
              backdropFilter: `blur(${index * blurIntensity}px)`,
              WebkitBackdropFilter: `blur(${index * blurIntensity}px)`,
            }}
          />
        );
      })}
    </div>
  );
}
