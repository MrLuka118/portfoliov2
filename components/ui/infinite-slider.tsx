"use client";

import * as React from "react";
import {
  motion,
  useAnimationControls,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import useMeasure from "react-use-measure";

import { cn } from "@/lib/utils";

/**
 * Neskončni horizontalni (ali vertikalni) drsnik vsebine.
 * Podvoji otroke in jih animira v zanki; ob hoverju lahko upočasni.
 */
export function InfiniteSlider({
  children,
  gap = 16,
  duration = 30,
  durationOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
}) {
  const [ref, { width, height }] = useMeasure();
  const controls = useAnimationControls();
  const [activeDuration, setActiveDuration] = React.useState(duration);

  React.useEffect(() => {
    const size = direction === "horizontal" ? width : height;
    if (size === 0) return;

    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;
    const transition: Transition = {
      duration: activeDuration,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    };
    // Konkretni ključi (x / y) namesto računanega, da TS pravilno tipizira cilj.
    const animation: TargetAndTransition =
      direction === "horizontal"
        ? { x: [from, to], transition }
        : { y: [from, to], transition };
    controls.start(animation);
  }, [width, height, gap, activeDuration, direction, reverse, controls]);

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => setActiveDuration(durationOnHover),
        onHoverEnd: () => setActiveDuration(duration),
      }
    : {};

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        className="flex w-max"
        style={{
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        ref={ref}
        animate={controls}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
