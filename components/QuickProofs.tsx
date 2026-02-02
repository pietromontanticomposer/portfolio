"use client";

import { useLanguage } from "../lib/LanguageContext";

const proofs = {
  it: [
    {
      title: "Prima la scena, poi la musica",
      description: "Spotting guidato dalla funzione, non dal gusto.",
    },
    {
      title: "Opzioni rapide, revisioni pulite",
      description: "2–3 alternative, poi si decide in modo chiaro.",
    },
    {
      title: "Pronto per la post-produzione",
      description: "File ordinati, versioni chiare, tracce separate se servono.",
    },
  ],
  en: [
    {
      title: "Scene first, music second",
      description: "Spotting driven by function, not taste.",
    },
    {
      title: "Fast options, clean revisions",
      description: "2–3 options, then a clear final decision.",
    },
    {
      title: "Delivery ready for post",
      description: "Clean files, clear versions, separate tracks if needed.",
    },
  ],
};

export default function QuickProofs() {
  const { t, language } = useLanguage();
  const currentProofs = language === "it" ? proofs.it : proofs.en;

  return (
    <section className="card-shell p-6 sm:p-8" aria-label={t("Cosa ottieni", "What you get")}>
      <div className="section-header flex items-center justify-between">
        <h3 className="section-title text-2xl text-[color:var(--foreground)]">
          {t("Cosa ottieni", "What you get")}
        </h3>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {currentProofs.map((proof) => (
          <div key={proof.title} className="card-inset rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-[color:var(--foreground)]">
              {proof.title}
            </h4>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              {proof.description}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
        {t(
          "Processo: Spotting · Mockup · Revisioni · Lock · Delivery",
          "Process: Spotting · Mockup · Revisions · Lock · Delivery"
        )}
      </p>
    </section>
  );
}
