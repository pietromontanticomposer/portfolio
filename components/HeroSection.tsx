"use client";

import { memo } from "react";
import { useLanguage } from "../lib/LanguageContext";
import ContactPopover from "./ContactPopover";

type HeroSectionProps = {
  heroCredits: { it: string; en: string };
};

function HeroSection({ heroCredits }: HeroSectionProps) {
  const { t, language } = useLanguage();
  const openShowreel = () => {
    window.dispatchEvent(new Event("showreel:open"));
  };

  return (
    <header className="relative z-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-20 text-center fade-in">
        <div className="hero-kicker">
          <span className="hero-kicker-line" aria-hidden="true" />
          <span className="hero-kicker-text">
            {t(
              "Composizione per film, documentari e teatro · Sound design",
              "Scoring for film, documentaries, and theatre · Sound design"
            )}
          </span>
          <span className="hero-kicker-line" aria-hidden="true" />
        </div>
        <h1 className="display-name hero-title text-5xl leading-tight text-[color:var(--foreground)] sm:text-6xl lg:text-7xl">
          Pietro Montanti
        </h1>
        <p className="hero-subtitle mt-4 max-w-2xl mx-auto text-lg md:text-xl text-[color:var(--foreground)] font-semibold tracking-wide">
          {t("Compositore per film, documentari e teatro", "Composer for film, documentaries, and theatre")}
        </p>
        <p className="hero-logline mt-3 max-w-2xl mx-auto text-sm md:text-base text-[color:var(--muted)]">
          {t(
            "Composizione su cut con consegna professionale: stems ordinati, versioni dialogue-safe e file cue-ready.",
            "Scoring on cut with professional delivery: ordered stems, dialogue-safe versions, and cue-ready files."
          )}
        </p>
        <div className="hero-actions">
          <button type="button" onClick={openShowreel} className="hero-btn hero-btn-primary">
            {t("Guarda showreel", "Watch showreel")}
          </button>
          <ContactPopover
            buttonLabel={t("Contatti", "Contact")}
            buttonClassName="hero-btn hero-btn-secondary"
            panelId="contact-popover-hero"
          />
        </div>
        <div className="hero-credits" aria-label={t("Crediti", "Credits")}>
          <span className="hero-credits-line" aria-hidden="true" />
          <p className="hero-credits-text">{language === "it" ? heroCredits.it : heroCredits.en}</p>
          <span className="hero-credits-line" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}

export default memo(HeroSection);
