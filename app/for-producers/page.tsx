"use client";

import Link from "next/link";
import ContactPopover from "../../components/ContactPopover";
import { useLanguage } from "../../lib/LanguageContext";

const stepsData = {
  it: [
    {
      title: "Spotting e brief",
      detail: "Perimetro chiaro, elenco dei brani/scene e aspettative di consegna dal primo giorno.",
    },
    {
      title: "Opzioni A/B/C",
      detail: "Scelte di direzione rapide che riducono il rischio di schedule.",
    },
    {
      title: "Finestra di lock",
      detail: "Breve finestra di revisione per chiudere tempi e intento.",
    },
    {
      title: "Pack di delivery",
      detail: "File ordinati, versioni chiare e consegna organizzata per la post.",
    },
  ],
  en: [
    {
      title: "Spotting and brief",
      detail: "Clear scope, list of cues, and delivery expectations from day one.",
    },
    {
      title: "Options A/B/C",
      detail: "Fast direction choices that reduce schedule risk.",
    },
    {
      title: "Lock window",
      detail: "Short revision window to lock timing and intent.",
    },
    {
      title: "Delivery pack",
      detail: "Organized files with clear versions and handoff to post.",
    },
  ],
};

const deliveryChecklistData = {
  it: [
    "Mix stereo + tracce separate (stems) su richiesta",
    "Nomi file chiari e versioni coerenti",
    "Varianti mix per dialogo ed effetti quando servono",
    "Lista brani con timing (entrate/uscite)",
    "Un solo link di consegna con cartelle ordinate",
  ],
  en: [
    "Stereo mix plus separate stems on request",
    "Clear file names and versioning",
    "Mix variants for dialogue and effects when needed",
    "Cue sheet with in/out timings",
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
            "Musica solida sulle tempistiche, con consegna pulita e passaggio semplice alla post. Revisioni chiare e file organizzati per far lavorare la post senza rallentamenti.",
            "Schedule-safe scoring with clean delivery and a smooth handoff to post. Clear revisions and organized files so post can move fast."
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
            "Condividi tempistiche, formati e requisiti della post. Ti risponderò con un piano di consegna.",
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
