"use client";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

/** Scroll indikator pod herojem – animirana puščica/črta navzdol. */
export function ScrollIndicator({
  targetId = "portfolio",
  className,
}: {
  targetId?: string;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <a
      href={`#${targetId}`}
      aria-label={t("hero.scroll")}
      className={cn(
        "group inline-flex flex-col items-center gap-3 text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span className="text-[10px] uppercase tracking-label">
        {t("hero.scroll")}
      </span>
      <span className="relative flex h-12 w-px overflow-hidden bg-border">
        <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-bounce_1.8s_ease-in-out_infinite] bg-accent" />
      </span>
      <ChevronDown className="h-4 w-4 animate-scroll-bounce" />
    </a>
  );
}
