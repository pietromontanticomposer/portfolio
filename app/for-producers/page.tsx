"use client";

import type { ReactNode } from "react";
import ContactPopover from "../../components/ContactPopover";
import { projects } from "../../data/projects";
import { useLanguage } from "../../lib/LanguageContext";
import { getText, getTagTranslation } from "../../lib/translations";

const stepsData = {
  it: [
    {
      title: "Spotting e brief",
      detail: "Scope chiaro, cue list e aspettative di delivery dal primo giorno.",
    },
    {
      title: "Opzioni A/B/C",
      detail: "Scelte di direzione rapide che riducono il rischio di schedule.",
    },
    {
      title: "Finestra di lock",
      detail: "Breve finestra di revisione per finalizzare timing e intento.",
    },
    {
      title: "Pack di delivery",
      detail: "Export versionati con naming pulito e handoff organizzato.",
    },
  ],
  en: [
    {
      title: "Spotting and brief",
      detail: "Clear scope, cue list, and delivery expectations from day one.",
    },
    {
      title: "Options A/B/C",
      detail: "Fast direction choices that reduce schedule risk.",
    },
    {
      title: "Lock window",
      detail: "Short revision window to finalize timing and intent.",
    },
    {
      title: "Delivery pack",
      detail: "Versioned exports with clean naming and organized handoff.",
    },
  ],
};

const deliveryChecklistData = {
  it: [
    "Mix stereo più stem su richiesta",
    "Naming e versioning consistenti",
    "Varianti mix per dialogo ed effetti",
    "Cue sheet e timings",
    "Link di delivery unico con cartelle strutturate",
  ],
  en: [
    "Stereo mix plus stems on request",
    "Consistent naming and versioning",
    "Mix variants for dialogue and effects",
    "Cue sheet and timings",
    "Single delivery link with structured folders",
  ],
};

type GuideSection = {
  title: string;
  paragraphs?: ReactNode[];
  bullets?: string[];
  labeledBullets?: Array<{ label: string; text: string }>;
  blocks?: Array<{ heading: string; bullets: string[] }>;
  note?: string;
  emphasis?: string;
};

const siaeLinks = {
  moduli: "https://www.siae.it/it/moduli/",
  mod109Tf:
    "https://d2aod8qfhzlk6j.cloudfront.net/SITOIS/Mod_109_TF_versione_1_1_d69e2bd12f.xlsx",
};

const siaeGuideData: Record<"it" | "en", { title: string; subtitle: string; intro: string[]; sections: GuideSection[] }> = {
  it: {
    title: "Musiche originali e SIAE",
    subtitle: "Guida operativa per registi e produzioni",
    intro: [
      "Questa pagina serve a rendere il passaggio SIAE semplice e lineare, senza burocrazia inutile e senza rischi di errori.",
      "Il punto è uno: la SIAE deve ricevere il Programma Musicale, cioè l'elenco delle musiche effettivamente usate nell'opera.",
    ],
    sections: [
      {
        title: "1) Chi fa cosa",
        blocks: [
          {
            heading: "Io, come compositore",
            bullets: [
              "Preparo e compilo il modulo ufficiale SIAE con tutte le informazioni musicali.",
              "Vi mando il file già pronto, così non dovete occuparvi della parte tecnica.",
            ],
          },
          {
            heading: "Voi, come produzione",
            bullets: [
              "Verificate i dati generali del progetto.",
              "Firmate il modulo dove richiesto.",
              "Inviate il modulo alla SIAE via PEC, come indicato nel modello.",
              "Mi inoltrate la conferma dell'invio.",
            ],
          },
        ],
      },
      {
        title: "2) Quale modulo si usa e dove si scarica",
        paragraphs: [
          <>
            Il modulo è quello ufficiale SIAE, scaricato dalla pagina moduli:{" "}
            <a href={siaeLinks.moduli} target="_blank" rel="noreferrer">
              siae.it/it/moduli
            </a>
            .
          </>,
          "In base al progetto si usa:",
        ],
        labeledBullets: [
          {
            label: "Programma Musicale Film, Mod. 109, Excel",
            text: "per film, cortometraggi e documentari destinati a proiezione.",
          },
          {
            label: "Programma Musicale Film TV, Mod. 109 TF, Excel",
            text: "per TV, web, VOD, serie e contenuti per piattaforme.",
          },
        ],
        note: "Nota pratica: usare sempre il modulo scaricato dal sito SIAE, non copie vecchie o modificate.",
      },
      {
        title: "3) Cosa mi serve da voi per compilarlo",
        paragraphs: ["Per compilare correttamente il modulo mi bastano questi dati:"],
        bullets: [
          "Titolo definitivo dell'opera.",
          "Durata totale dell'opera.",
          "Tipologia e destinazione, per esempio proiezione, TV, piattaforma.",
          "Produzione, referente e contatti.",
          "Regia.",
          "Data prevista di prima proiezione o messa in onda, se già disponibile.",
        ],
        note:
          "La parte musicale la gestisco io: titoli dei brani, autori, eventuali editori, durate effettive in scena, tipo di utilizzo.",
      },
      {
        title: "4) Quando si finalizza",
        paragraphs: [
          "Il Programma Musicale viene finalizzato quando il montaggio è chiuso, cioè con durate definitive.",
          "Questo evita correzioni successive e rende la dichiarazione coerente con l'opera che verrà proiettata o distribuita.",
        ],
      },
      {
        title: "5) Come dovete inviarlo alla SIAE",
        paragraphs: [
          "L'invio del Programma Musicale deve essere fatto via PEC, seguendo le istruzioni riportate nel modulo.",
          <>
            Per il Mod. 109 TF nel modello è riportato l'indirizzo PEC{" "}
            <a href={siaeLinks.mod109Tf} target="_blank" rel="noreferrer">
              MUSIC.COPYRIGHT.REPERTOIRE@PEC.SIAE.IT
            </a>
            .
          </>,
          "In generale, attenetevi sempre a quanto indicato nel file che vi ho inviato.",
        ],
      },
      {
        title: "5.1) Conferma di invio, cosa significa esattamente",
        paragraphs: ["Per \"conferma dell'invio PEC\" intendo queste due ricevute:"],
        bullets: ["Ricevuta PEC di accettazione.", "Ricevuta PEC di avvenuta consegna."],
        note:
          "Suggerimento utile: se possibile, mettete in copia la mia PEC durante l'invio, così le ricevute arrivano anche a me.",
      },
      {
        title: "6) Se non avete una PEC",
        paragraphs: ["Nessun problema, succede spesso nei progetti indipendenti. Le soluzioni pratiche sono:"],
        bullets: [
          "Attivare una PEC della produzione.",
          "Usare la PEC di chi segue l'amministrazione del progetto, per esempio commercialista, production manager, società esecutiva.",
        ],
        note: "L'importante è che l'invio parta da una PEC e che restino le ricevute.",
      },
      {
        title: "7) Consegna dei file musicali, regola chiara",
        paragraphs: [
          "Durante il progetto condivido normalmente versioni di ascolto per revisione e approvazione.",
        ],
        emphasis:
          "Master finali, stems e deliverable definitivi verranno inviati dopo aver ricevuto la conferma dell'invio PEC alla SIAE, cioè le ricevute di accettazione e di avvenuta consegna.",
        note:
          "È una procedura di chiusura molto semplice che tutela il progetto e evita problemi successivi.",
      },
      {
        title: "8) Cosa conservare in produzione",
        paragraphs: ["Per archivio di progetto è buona prassi conservare:"],
        bullets: [
          "Modulo compilato e firmato.",
          "Messaggio PEC di invio.",
          "Ricevuta PEC di accettazione.",
          "Ricevuta PEC di avvenuta consegna.",
        ],
      },
    ],
  },
  en: {
    title: "Original music and SIAE",
    subtitle: "Operational guide for directors and productions",
    intro: [
      "This page is meant to make the SIAE step simple and linear, with no unnecessary bureaucracy and no risk of mistakes.",
      "The key point is this: SIAE needs the Programma Musicale, i.e. the list of music actually used in the work.",
    ],
    sections: [
      {
        title: "1) Who does what",
        blocks: [
          {
            heading: "Me, as the composer",
            bullets: [
              "I prepare and fill in the official SIAE form with all musical information.",
              "I send you the file already prepared, so you don't have to handle the technical part.",
            ],
          },
          {
            heading: "You, as the production",
            bullets: [
              "You verify the project's general details.",
              "You sign the form where required.",
              "You send the form to SIAE via PEC, as indicated in the template.",
              "You forward me the sending confirmation.",
            ],
          },
        ],
      },
      {
        title: "2) Which form to use and where to download it",
        paragraphs: [
          <>
            The form is the official SIAE one, downloaded from the forms page:{" "}
            <a href={siaeLinks.moduli} target="_blank" rel="noreferrer">
              siae.it/it/moduli
            </a>
            .
          </>,
          "Depending on the project, use:",
        ],
        labeledBullets: [
          {
            label: "Programma Musicale Film, Mod. 109, Excel",
            text: "for films, shorts, and documentaries intended for theatrical screening.",
          },
          {
            label: "Programma Musicale Film TV, Mod. 109 TF, Excel",
            text: "for TV, web, VOD, series, and platform content.",
          },
        ],
        note:
          "Practical note: always use the form downloaded from the SIAE site, not old or modified copies.",
      },
      {
        title: "3) What I need from you to fill it in",
        paragraphs: ["To fill in the form correctly, I only need these details:"],
        bullets: [
          "Final title of the work.",
          "Total duration of the work.",
          "Type and destination, e.g. theatrical, TV, platform.",
          "Production, contact person, and contacts.",
          "Director.",
          "Expected first screening or broadcast date, if already available.",
        ],
        note:
          "I handle the musical side: cue titles, authors, any publishers, actual on-screen durations, type of use.",
      },
      {
        title: "4) When it is finalized",
        paragraphs: [
          "The Programma Musicale is finalized when the edit is locked, i.e. with definitive durations.",
          "This avoids later corrections and keeps the declaration aligned with the work that will be screened or distributed.",
        ],
      },
      {
        title: "5) How to send it to SIAE",
        paragraphs: [
          "The Programma Musicale must be sent via PEC, following the instructions provided in the form.",
          <>
            For Mod. 109 TF, the template lists the PEC address{" "}
            <a href={siaeLinks.mod109Tf} target="_blank" rel="noreferrer">
              MUSIC.COPYRIGHT.REPERTOIRE@PEC.SIAE.IT
            </a>
            .
          </>,
          "In general, always follow what is indicated in the file I sent you.",
        ],
      },
      {
        title: "5.1) Sending confirmation, what it means exactly",
        paragraphs: ["By “PEC sending confirmation” I mean these two receipts:"],
        bullets: ["PEC acceptance receipt.", "PEC delivery receipt."],
        note:
          "Helpful tip: if possible, CC my PEC when sending, so the receipts reach me as well.",
      },
      {
        title: "6) If you don't have a PEC",
        paragraphs: ["No problem, it often happens in independent projects. Practical solutions are:"],
        bullets: [
          "Activate a PEC for the production.",
          "Use the PEC of whoever handles administration, e.g. accountant, production manager, or executive company.",
        ],
        note: "The important thing is that the sending comes from a PEC and the receipts are kept.",
      },
      {
        title: "7) Delivery of music files, clear rule",
        paragraphs: [
          "During the project I normally share listening versions for review and approval.",
        ],
        emphasis:
          "Final masters, stems, and definitive deliverables will be sent after I receive the PEC sending confirmation to SIAE, i.e. the acceptance and delivery receipts.",
        note:
          "It is a very simple closing procedure that protects the project and avoids problems later on.",
      },
      {
        title: "8) What to keep on the production side",
        paragraphs: ["For project archiving, it is good practice to keep:"],
        bullets: [
          "Compiled and signed form.",
          "PEC sending message.",
          "PEC acceptance receipt.",
          "PEC delivery receipt.",
        ],
      },
    ],
  },
};

const caseStudyProjects = projects.filter((project) => project.description).slice(2, 4);
const fallbackCaseStudies = projects.slice(0, 2);
const producerCaseStudies =
  caseStudyProjects.length > 0 ? caseStudyProjects : fallbackCaseStudies;

export default function ForProducersPage() {
  const { t, language } = useLanguage();
  const steps = language === "it" ? stepsData.it : stepsData.en;
  const deliveryChecklist = language === "it" ? deliveryChecklistData.it : deliveryChecklistData.en;
  const guide = siaeGuideData[language];
  const caseStudies = producerCaseStudies.map((project) => {
    const description = getText(project.description, language);
    const lines = description
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const tagLabel = project.tag ? getTagTranslation(project.tag, language) : t("Progetto", "Project");
    const briefFallback = t(
      `${project.title} (${tagLabel}) con perimetro di consegna chiaro.`,
      `${project.title} (${tagLabel}) with clear delivery scope.`
    );
    const musicalChoiceFallback = t(
      "Focus su timing stabile e dinamiche pulite per workflow di post prevedibili.",
      "Focused on stable timing and clean dynamics for predictable post workflows."
    );
    const deliverablesFallback = t(
      "Export versionati, naming, stem su richiesta, cue sheet.",
      "Versioned exports, naming, stems on request, cue sheet."
    );

    return {
      title: project.title,
      brief: lines[0] || briefFallback,
      musicalChoice: lines[1] || musicalChoiceFallback,
      deliverables: deliverablesFallback,
    };
  });

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <section className="card-shell p-8">
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          {t("Per Produttori", "For Producers")}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          {t(
            "Scoring sicuro per la schedule con delivery pulita e handoff prevedibile. Tengo le revisioni strette e gli export organizzati per far muovere la post velocemente.",
            "Schedule-safe scoring with clean delivery and predictable handoff. I keep revisions tight and exports organized so post can move fast."
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
          {guide.title}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {guide.subtitle}
        </p>
        <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)] leading-relaxed">
          {guide.intro.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="mt-6 space-y-6">
          {guide.sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
                {section.title}
              </h3>
              {section.paragraphs && (
                <div className="space-y-2 text-sm text-[color:var(--muted)] leading-relaxed">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${section.title}-p-${index}`}>{paragraph}</p>
                  ))}
                </div>
              )}
              {section.labeledBullets && (
                <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
                  {section.labeledBullets.map((item) => (
                    <li key={item.label}>
                      <span className="font-semibold text-[color:var(--foreground)]">
                        {item.label}
                      </span>{" "}
                      {item.text}
                    </li>
                  ))}
                </ul>
              )}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.blocks && (
                <div className="space-y-4">
                  {section.blocks.map((block) => (
                    <div key={block.heading}>
                      <div className="text-sm font-semibold text-[color:var(--foreground)]">
                        {block.heading}
                      </div>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
                        {block.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {section.emphasis && (
                <p className="text-sm font-semibold text-[color:var(--foreground)] leading-relaxed">
                  {section.emphasis}
                </p>
              )}
              {section.note && (
                <p className="text-sm text-[color:var(--muted)] leading-relaxed">
                  {section.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {t("Case study delivery", "Delivery case studies")}
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {caseStudies.map((study) => (
            <div key={study.title}>
              <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                {study.title}
              </h3>
              <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    Brief
                  </span>
                  <p className="mt-1">{study.brief}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {t("Scelta musicale", "Musical choice")}
                  </span>
                  <p className="mt-1">{study.musicalChoice}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    Deliverables
                  </span>
                  <p className="mt-1">{study.deliverables}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {t("Hai bisogno di un pack di delivery pulito?", "Need a clean delivery pack?")}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t(
            "Condividi la schedule, i formati e i requisiti post. Ti risponderò con un piano di delivery.",
            "Share the schedule, formats, and post requirements. I will reply with a delivery plan."
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
