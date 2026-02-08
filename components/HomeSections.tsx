"use client";

import { memo } from "react";
import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";

function HomeSections() {
  const { t } = useLanguage();

  return (
    <>
      <section className="card-shell p-6 sm:p-8">
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            {t("Casi studio", "Case Studies")}
          </h3>
        </div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t(
            "Analisi scena per scena: obiettivi, momenti chiave, opzioni testate e consegna.",
            "Scene-by-scene breakdowns: goals, key moments, options tested, and delivery."
          )}
        </p>
        <div className="mt-4">
          <a href="/case-studies" className="hero-btn hero-btn-secondary">
            {t("Vedi casi studio", "View case studies")}
          </a>
        </div>
      </section>

      <section className="card-shell p-6 sm:p-8">
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            {t("Portfolio", "Portfolio")}
          </h3>
        </div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t(
            "Lavori selezionati, collaborazioni e lista completa dei progetti.",
            "Selected work, collaborations, and full project list."
          )}
        </p>
        <div className="mt-4">
          <Link href="/portfolio" prefetch={false} className="hero-btn hero-btn-secondary">
            {t("Vedi portfolio", "View portfolio")}
          </Link>
        </div>
      </section>

      <section id="about" className="card-shell p-6 sm:p-8">
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">{t("Chi sono", "About")}</h3>
        </div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t(
            "Bio, background e approccio alla composizione.",
            "Bio, background, and approach to composing."
          )}
        </p>
        <div className="mt-4">
          <Link href="/about" prefetch={false} className="hero-btn hero-btn-secondary">
            {t("Scopri di più", "Learn more")}
          </Link>
        </div>
      </section>
    </>
  );
}

export default memo(HomeSections);
