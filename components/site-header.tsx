"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useActiveSection } from "@/hooks/use-active-section";
import { localized, type CategoryDTO } from "@/types";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";

/**
 * Sticky navigacija (HeroHeader).
 * - prosojna nad herojem, ob scrollu dobi backdrop-blur in ozadje
 * - povezave do kategorij + About/Contact = smooth scroll do sekcij (brez nove strani)
 * - aktivna sekcija označena prek Intersection Observerja
 * - mobilni fullscreen meni: renderiran prek Portala v <body>, da je `fixed`
 *   vedno relativen na viewport (in ne ujet v transform/filter prednika)
 */
export function SiteHeader({ categories }: { categories: CategoryDTO[] }) {
  const { locale, t } = useLanguage();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Statične sekcije (poleg kategorij) – About in Contact.
  const staticLinks = React.useMemo(
    () => [
      { slug: "about", label: t("nav.about") },
      { slug: "contact", label: t("nav.contact") },
    ],
    [t]
  );

  // Vse sekcije v meniju: kategorije + About + Contact.
  const navItems = React.useMemo(
    () => [
      ...categories.map((c) => ({ slug: c.slug, label: localized(c, locale) })),
      ...staticLinks,
    ],
    [categories, locale, staticLinks]
  );

  const sectionIds = React.useMemo(
    () => navItems.map((i) => i.slug),
    [navItems]
  );
  const activeId = useActiveSection(sectionIds);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prepreči scroll telesa, ko je mobilni meni odprt.
  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const goToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    slug: string
  ) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${slug}`);
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="Luka Photography"
        >
          <Logo />
        </a>

        {/* Namizna navigacija */}
        <ul className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <li key={item.slug}>
              <a
                href={`#${item.slug}`}
                onClick={(e) => goToSection(e, item.slug)}
                className={cn(
                  "group relative text-xs uppercase tracking-label transition-colors hover:text-foreground",
                  activeId === item.slug ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-300",
                    activeId === item.slug ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <LanguageSwitcher className="hidden sm:flex" />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:text-accent lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMenuOpen(true)}
            aria-label="Odpri meni"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Mobilni fullscreen meni – Portal v <body>, popolnoma neprosojen overlay. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                key="mobile-nav"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-background lg:hidden"
                role="dialog"
                aria-modal="true"
              >
                {/* Lastna zgornja vrstica (logo + zapri) */}
                <div className="container flex h-16 shrink-0 items-center justify-between">
                  <Logo />
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Zapri meni"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Povezave */}
                <nav className="container flex flex-1 flex-col justify-center gap-1 py-8">
                  {navItems.map((item, i) => (
                    <motion.a
                      key={item.slug}
                      href={`#${item.slug}`}
                      onClick={(e) => goToSection(e, item.slug)}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.35 }}
                      className={cn(
                        "block py-3 font-serif text-3xl transition-colors hover:text-accent",
                        activeId === item.slug ? "text-accent" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </nav>

                <div className="container shrink-0 border-t border-border py-6">
                  <LanguageSwitcher />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}
