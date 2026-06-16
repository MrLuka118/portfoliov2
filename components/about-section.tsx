"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

import { useLanguage } from "@/context/language-context";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

/**
 * ABOUT sekcija (#about) – portret fotografa ob besedilu.
 * Desktop: dvostolpčna postavitev (slika | besedilo).
 * Mobile: slika nad besedilom.
 *
 * Portret (`aboutImage`) ureja admin prek spletne strani (zavihek »Slike strani«).
 */
export function AboutSection({ aboutImage }: { aboutImage: string }) {
  const { t } = useLanguage();

  return (
    <section id="about" className="scroll-mt-24 border-t border-border/60 py-24 sm:py-32">
      <div className="container grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
        {/* Portret */}
        <Reveal>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-card">
            <Image
              src={aboutImage}
              alt={t("about.name")}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        {/* Besedilo */}
        <Reveal delay={0.1}>
          <div>
            <span className="mb-4 flex items-center gap-4 text-xs uppercase tracking-label text-accent">
              <span className="accent-rule" />
              {t("about.label")}
            </span>
            <h2 className="font-serif text-4xl font-light sm:text-5xl">
              {t("about.heading")}
            </h2>
            <p className="mt-2 font-serif text-xl italic text-muted-foreground">
              {t("about.name")}
            </p>

            <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>{t("about.p1")}</p>
              <p>{t("about.p2")}</p>
              <p>{t("about.p3")}</p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <span className="flex items-center gap-2 text-xs uppercase tracking-label text-muted-foreground">
                <MapPin className="h-4 w-4 text-accent" />
                {t("about.location")}
              </span>
              <Button asChild variant="accent">
                <a href="#contact" data-smooth>
                  {t("about.cta")}
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
