"use client";

import { ArrowUpRight, Instagram, Mail } from "lucide-react";

import { useLanguage } from "@/context/language-context";
import { Reveal } from "@/components/reveal";
import { Logo } from "@/components/logo";

// Kontaktni podatki.
const EMAIL = "bozicluka013@gmail.com";
const GMAIL_COMPOSE = `https://mail.google.com/mail/?view=cm&to=${EMAIL}`;
const INSTAGRAM_HANDLE = "mrluka118";
const INSTAGRAM_URL = "https://www.instagram.com/mrluka118/";

/**
 * CONTACT sekcija (#contact) – povabilo k stiku in minimalistični kontaktni linki
 * (podčrtaj ob hoverju v akcentni barvi). Pod njo footer z avtorskimi pravicami.
 */
export function ContactSection() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border/60">
      <div className="container py-24 sm:py-32">
        <Reveal>
          <span className="accent-rule mb-5 block" />
          <h2 className="font-serif text-4xl font-light sm:text-5xl">
            {t("contact.heading")}
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("contact.intro")}
          </p>
        </Reveal>

        {/* Kontaktni linki – minimalistični, podčrtaj v akcentni barvi ob hoverju */}
        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-col gap-px">
            <ContactLink
              href={GMAIL_COMPOSE}
              icon={Mail}
              label={t("contact.email")}
              value={EMAIL}
            />
            <ContactLink
              href={INSTAGRAM_URL}
              icon={Instagram}
              label={t("contact.instagram")}
              value={`@${INSTAGRAM_HANDLE}`}
            />
          </div>
        </Reveal>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-6 py-8 sm:flex-row">
          <p className="text-xs tracking-label text-muted-foreground">
            © {year} Luka Photography. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-6 text-xs uppercase tracking-label">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              Instagram
            </a>
            <a
              href={GMAIL_COMPOSE}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              {t("contact.email")}
            </a>
            <a
              href="#contact"
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              {t("footer.contact")}
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}

/** Posamezen kontaktni link z ikono, oznako in vrednostjo. */
function ContactLink({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-4 border-b border-border/60 py-5 transition-colors hover:border-accent/60"
    >
      <span className="flex items-center gap-4">
        <Icon className="h-5 w-5 text-accent" />
        <span className="flex flex-col">
          <span className="text-[10px] uppercase tracking-label text-muted-foreground">
            {label}
          </span>
          <span className="font-serif text-lg text-foreground decoration-accent/70 underline-offset-4 group-hover:underline sm:text-xl">
            {value}
          </span>
        </span>
      </span>
      <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
    </a>
  );
}
