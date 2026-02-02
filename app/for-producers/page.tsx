"use client";

import Link from "next/link";
import ContactPopover from "../../components/ContactPopover";
import { useLanguage } from "../../lib/LanguageContext";

const stepsData = {
  it: [
    {
      title: "Brief e momenti musicali",
      detail: "Definiamo cosa serve scena per scena e come sarà la consegna.",
    },
    {
      title: "2–3 proposte",
      detail: "Ti mando 2–3 proposte, poi scegliamo quella giusta.",
    },
    {
      title: "Revisione finale",
      detail: "Breve finestra di revisione per chiudere tempi e decisioni.",
    },
    {
      title: "Consegna finale",
      detail: "File ordinati, versioni chiare e consegna organizzata.",
    },
  ],
  en: [
    {
      title: "Brief and music moments",
      detail: "We define what each scene needs and how delivery will work.",
    },
    {
      title: "2–3 proposals",
      detail: "I send 2–3 proposals, then we pick the right one.",
    },
    {
      title: "Final revision",
      detail: "Short revision window to lock timing and decisions.",
    },
    {
      title: "Final delivery",
      detail: "Organized files with clear versions.",
    },
  ],
};

const deliveryChecklistData = {
  it: [
    "Mix principale",
    "Tracce separate su richiesta",
    "Versioni per dialogo/effetti quando servono",
    "Lista brani con entrate/uscite",
    "Un solo link di consegna con cartelle ordinate",
  ],
  en: [
    "Main mix",
    "Separate tracks on request",
    "Mix variants for dialogue/effects when needed",
    "Music list with in/out times",
    "Single delivery link with organized folders",
  ],
};

const mod109CtaData = {
  it: {
    title: "Mod. 109 SIAE",
    description:
      "Guida pratica per registi e produzioni: cosa serve, chi compila, e dove scaricare i moduli.",
    buttonLabel: "Apri la guida",
  },
  en: {
    title: "SIAE Mod. 109",
    description:
      "Practical guide for directors and productions: what’s needed, who fills it in, and where to get the forms.",
    buttonLabel: "Open the guide",
  },
};

export default function ForProducersPage() {
  const { t, language } = useLanguage();
  const steps = language === "it" ? stepsData.it : stepsData.en;
  const deliveryChecklist = language === "it" ? deliveryChecklistData.it : deliveryChecklistData.en;
  const mod109Cta = mod109CtaData[language];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <section className="card-shell p-8">
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          {t("Per Produttori", "For Producers")}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          {t(
            "Musica solida nei tempi, consegna pulita e passaggio semplice alla post-produzione. Revisioni chiare e file organizzati.",
            "On-time scoring, clean delivery, and a smooth handoff to post-production. Clear revisions and organized files."
          )}
        </p>
        <div className="mt-6">
          <ContactPopover
            buttonLabel={t("Contattami", "Contact")}
            buttonClassName="hero-btn hero-btn-primary"
            panelId="contact-popover-producers-hero"
          />
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {t("Come lavoro", "How I work")}
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title}>
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
                {i + 1}. {step.title}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {t("Delivery pronta per la post", "Delivery ready for post")}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
          {deliveryChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {mod109Cta.title}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {mod109Cta.description}
        </p>
        <div className="mt-5">
          <Link href="/mod-109-siae" prefetch={false} className="hero-btn hero-btn-secondary">
            {mod109Cta.buttonLabel}
          </Link>
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {t("Hai bisogno di un pack di delivery pulito?", "Need a clean delivery pack?")}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t(
            "Condividi tempistiche, formati e requisiti della post-produzione. Ti risponderò con un piano di consegna.",
            "Share timeline, formats, and post requirements. I will reply with a delivery plan."
          )}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <ContactPopover
            buttonLabel={t("Contattami", "Contact")}
            buttonClassName="hero-btn hero-btn-primary"
            panelId="contact-popover-producers-cta"
          />
        </div>
      </section>
    </main>
  );
}
