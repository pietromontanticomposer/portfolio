"use client";

import { memo } from "react";
import { useLanguage } from "../lib/LanguageContext";
import ContactPopover from "./ContactPopover";

type HeroSectionProps = {
  heroCredits: { it: string; en: string };
};

function HeroSection({ heroCredits }: HeroSectionProps) {
  const { t, language } = useLanguage();

  return (
    <header className="relative z-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-20 text-center fade-in">
        <div className="hero-kicker">
          <span className="hero-kicker-line" aria-hidden="true" />
          <span className="hero-kicker-text">
            {t(
              "Colonne Sonore Originali · Sound Design · Musica Narrativa",
              "Original Scores · Sound Design · Narrative Music"
            )}
          </span>
          <span className="hero-kicker-line" aria-hidden="true" />
        </div>
        <h1 className="display-name hero-title text-5xl leading-tight text-[color:var(--foreground)] sm:text-6xl lg:text-7xl">
          Pietro Montanti
        </h1>
        <p className="hero-subtitle mt-4 max-w-2xl mx-auto text-lg md:text-xl text-[color:var(--foreground)] font-semibold tracking-wide">
          {t("Compositore per Film e Media", "Composer for Film and Media")}
        </p>
        <p className="hero-logline mt-3 max-w-2xl mx-auto text-sm md:text-base text-[color:var(--muted)]">
          {t(
            "Musica che supporta montaggio, tensione e personaggio.",
            "Music that supports edit, tension, and character."
          )}
        </p>
        <div className="hero-actions">
          <a href="#showreel" className="hero-btn hero-btn-primary">
            {t("Guarda showreel", "Watch showreel")}
          </a>
          <ContactPopover
            buttonLabel={t("Contatti", "Contact")}
            buttonClassName="hero-btn hero-btn-secondary"
            panelId="contact-popover-hero"
          />
        </div>
        <div className="hero-credits" aria-label="Credits">
          <span className="hero-credits-line" aria-hidden="true" />
          <p className="hero-credits-text">{language === "it" ? heroCredits.it : heroCredits.en}</p>
          <span className="hero-credits-line" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}

export default memo(HeroSection);
