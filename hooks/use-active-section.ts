"use client";

import * as React from "react";

/**
 * Vrne ID trenutno vidne sekcije (kategorije) prek Intersection Observerja.
 * Uporabljeno za označevanje aktivne kategorije v navigaciji med scrollanjem.
 */
export function useActiveSection(sectionIds: string[]): string | null {
  const [activeId, setActiveId] = React.useState<string | null>(
    sectionIds[0] ?? null
  );

  React.useEffect(() => {
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Med vidnimi sekcijami izberi tisto, ki je najvišje na zaslonu.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Sredinski pas zaslona šteje kot "aktiven".
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      }
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
