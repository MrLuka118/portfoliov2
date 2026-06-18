"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { useLanguage } from "@/context/language-context";
import { localized, type CategoryDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollIndicator } from "@/components/scroll-indicator";

/**
 * HERO sekcija – polnoekransko (100vh) ozadje z eno izrazito fotografijo
 * in temnim overlay-em za berljivost. Naslov "Capturing *moments* that matter",
 * kjer je "moments" v serif kurzivi z akcentno barvo.
 *
 * Naslovno fotografijo (`heroImage`) ureja admin prek spletne strani — ni je
 * treba spreminjati v kodi.
 */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 * i },
  }),
};

export function HeroSection({
  categories,
  heroImage,
}: {
  categories: CategoryDTO[];
  heroImage: string;
}) {
  const { t, locale } = useLanguage();

  // Naslov je en sam prevedljiv niz s poudarjenim delom med *zvezdicama*,
  // npr. "Ujemam *trenutke*, ki štejejo". Tako so ločila (vejice) pravilna
  // v vseh jezikih, brez vsiljenih presledkov okoli poudarka.
  const [headingBefore, headingEmphasis = "", headingAfter = ""] =
    t("hero.heading").split("*");

  // Smooth scroll do sekcije kategorije (brez nove strani).
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    slug: string
  ) => {
    e.preventDefault();
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${slug}`);
    }
  };

  return (
    <section
      id="top"
      className="relative flex h-svh min-h-[640px] w-full flex-col overflow-hidden"
    >
      {/* Polnoekransko foto ozadje */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Temni overlay za berljivost (gradient + globalni zatemnitveni sloj) */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-background/30" />
      </div>

      {/* Glavna vsebina heroja */}
      <div className="container flex flex-1 flex-col justify-center pt-20">
        <div className="max-w-3xl">
          <motion.p
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 flex items-center gap-4 text-xs uppercase tracking-label text-accent"
          >
            <span className="accent-rule" />
            {t("hero.subtitle")}
          </motion.p>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-serif text-3xl font-light leading-[1.12] text-foreground sm:text-4xl md:text-5xl"
          >
            {headingBefore}
            <span className="italic text-accent">{headingEmphasis}</span>
            {headingAfter}
          </motion.h1>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button asChild variant="accent" size="lg">
              <a href="#portfolio">{t("hero.ctaPrimary")}</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "contact")}
              >
                {t("hero.ctaSecondary")}
              </a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Spodnji pas: levo poravnan horizontalen meni kategorij + scroll indikator.
          Vse je v container-ju in v normalnem flow-u (brez prekrivanja s heroju). */}
      <div className="container pb-10">
        {categories.length > 0 && (
          <motion.nav
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            aria-label="Kategorije"
            className="scrollbar-none flex items-center gap-x-7 gap-y-2 overflow-x-auto border-t border-border/30 py-5"
          >
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.slug}`}
                onClick={(e) => handleNavClick(e, cat.slug)}
                className="whitespace-nowrap text-xs uppercase tracking-label text-muted-foreground transition-colors hover:text-accent"
              >
                {localized(cat, locale)}
              </a>
            ))}
          </motion.nav>
        )}
        <ScrollIndicator targetId="portfolio" className="mt-2 items-start" />
      </div>
    </section>
  );
}
