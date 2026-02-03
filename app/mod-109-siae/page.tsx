"use client";

import type { ReactNode } from "react";
import { useLanguage } from "../../lib/LanguageContext";

type GuideBlock = {
  heading: string;
  paragraphs?: ReactNode[];
  bullets?: string[];
  variant?: "warning";
};

type GuideSection = {
  title: string;
  paragraphs?: ReactNode[];
  bullets?: string[];
  ordered?: boolean;
  blocks?: GuideBlock[];
  closing?: ReactNode[];
};

type GuideFooter = {
  heading: string;
  lines: ReactNode[];
};

type GuideHighlight = {
  heading: string;
  lines: ReactNode[];
};

type GuideContent = {
  title: string;
  subtitle: string;
  intro?: ReactNode[];
  highlight: GuideHighlight;
  sections: GuideSection[];
  footer: GuideFooter;
};

const moduliUrl =
  "https://drive.google.com/drive/folders/1CRbEA4gRUjnmiTKNlgZZkGX4l_4QOcmv?usp=sharing";

const guideData: Record<"it" | "en", GuideContent> = {
  it: {
    title: "Guida SIAE ai Mod. 109 e Mod. 109TF (programma musicale opere audiovisive)",
    subtitle:
      "Per produzioni e registi. Spiegazione chiara e corretta per evitare errori che bloccano o deviano i compensi.",
    intro: [],
    highlight: {
      heading: "Prima regola",
      lines: [
        <>
          Moduli (usa solo questo link):{" "}
          <a href={moduliUrl} target="_blank" rel="noreferrer">
            {moduliUrl}
          </a>
          .
        </>,
        "Se usi un template vecchio, rischi di compilare campi sbagliati.",
      ],
    },
    sections: [
      {
        title: "Checklist veloce (10 minuti)",
        ordered: true,
        bullets: [
          "Scegli il modulo giusto: Mod. 109 (opera cinematografica) oppure Mod. 109TF (opera televisiva e/o Video On Demand).",
          "Compila il foglio \"Dichiarazione\" con i dati certi.",
          "Compila il foglio \"All.1 - Elenco composizioni\" con TUTTI i brani presenti nell'opera.",
          "Le durate devono essere in secondi interi.",
          "Esporta e invia via PEC in Excel oppure PDF digitale (non scansione) a MUSIC.COPYRIGHT.REPERTOIRE@PEC.SIAE.IT.",
          "Archivia: file inviato + ricevuta accettazione PEC + ricevuta consegna PEC.",
        ],
      },
      {
        title: "Download moduli (fonte primaria)",
        paragraphs: [
          <>
            Moduli (usa solo questo link):{" "}
            <a href={moduliUrl} target="_blank" rel="noreferrer">
              {moduliUrl}
            </a>
            .
          </>,
        ],
      },
      {
        title: "Chi fa cosa",
        blocks: [
          {
            heading: "Produzione",
            bullets: [
              "Compila e invia il modulo via PEC.",
              "E' responsabilita' della produzione.",
            ],
          },
          {
            heading: "Compositore",
            bullets: [
              "Fornisce un elenco pulito dei brani e i dati corretti (titoli, nomi, durate, editore se esiste).",
            ],
          },
        ],
      },
      {
        title: "Quando farlo",
        paragraphs: [
          "Fallo quando montaggio e musica sono definitivi, e comunque prima della prima uscita o diffusione.",
        ],
      },
      {
        title: "Come compilare \"Dichiarazione\" (solo i campi importanti)",
        paragraphs: ["Campi tipici (compila solo quelli richiesti):"],
        bullets: [
          "Titolo dell'opera.",
          "Genere.",
          "Dati della produzione e contatti.",
          "Prima diffusione: se non disponibile, lascia vuoto o compila solo cio' che e' certo.",
          "Responsabile della sincronizzazione: la persona che ha gestito autorizzazioni o la parte musica lato produzione.",
          "Compositore o editore della musica: nominativo e contatti.",
        ],
        closing: [
          "Nota importante: la \"Durata musica\" non va scritta a mano. Si calcola automaticamente sommando le durate in All.1.",
          "Nota Mod. 109 (cinema): la \"Lunghezza\" del film va inserita come ore, minuti, secondi, oppure solo in secondi (numero intero).",
        ],
      },
      {
        title: "B) Allegato 1: elenco musiche",
        paragraphs: [
          "E' il foglio dove elenchi tutte le musiche usate (originali e preesistenti).",
          "Compila solo le colonne presenti nel file ufficiale SIAE (Mod. 109 o Mod. 109TF). Non aggiungere campi.",
          "Per ogni musica inserisci una riga. La durata va inserita in secondi, come numero.",
        ],
        blocks: [
          {
            heading: "Esempio conversione durata",
            bullets: ["2:00 = 120", "0:35 = 35"],
          },
          {
            heading: "Esempio riga Allegato 1",
            bullets: [
              'Scena 12 | "Braga Theme" | Pietro Montanti | (vuoto) | 34',
            ],
          },
        ],
      },
      {
        title: "Regole anti errore",
        bullets: [
          'Non scrivere "2:00". Scrivi "120".',
          "Se un dato non e' noto, lascia vuoto.",
          "\"To be defined\" solo nei campi testuali. Mai nelle durate, perche' devono essere numeri.",
          "Non cambiare i nomi dei fogli. Non rompere le formule.",
          'Se usi brani preesistenti, inserisci titolo e autore reali, non "track 3".',
        ],
      },
      {
        title: "Per non perdere soldi",
        bullets: [
          "Titoli e nominativi devono combaciare tra deposito SIAE e Mod. 109 (All.1).",
          "Le quote (percentuali) depositate devono essere corrette e coerenti con i crediti reali.",
          "Chiedi sempre alla produzione copia del Mod. 109 inviato e delle ricevute PEC.",
          "Se la produzione compila, chiedi un controllo incrociato prima dell'invio (titoli, autori, editore, durate).",
        ],
        blocks: [
          {
            heading: "Link utili (moduli SIAE)",
            paragraphs: [
              <>
                Moduli SIAE:{" "}
                <a href={moduliUrl} target="_blank" rel="noreferrer">
                  {moduliUrl}
                </a>
                .
              </>,
            ],
          },
        ],
      },
      {
        title: "Invio (solo PEC)",
        paragraphs: [
          "Il modello va trasmesso dal produttore esclusivamente via PEC (non email normale).",
        ],
        bullets: [
          "File finale inviato.",
          "Ricevuta accettazione PEC.",
          "Ricevuta consegna PEC.",
        ],
      },
      {
        title: "Errori che ti fanno perdere soldi",
        ordered: true,
        bullets: [
          "Titoli in All.1 diversi dai titoli depositati in SIAE.",
          "Brani non depositati (original score) oppure depositati con quote sbagliate.",
          "Durate non in secondi, o con testo invece di numeri.",
          "Mancano brani presenti nel film, quindi non risultano dichiarati.",
          "Invio non via PEC o invio di scansione (file \"immagine\").",
          "Produzione non conserva le ricevute PEC, poi non prova l'invio.",
        ],
      },
      
    ],
    footer: {
      heading: "Chiusura breve",
      lines: [
        "Se vuoi, posso fornire alla produzione un file All.1 gia' pronto (titoli e durate in secondi). Loro devono solo copiare e inviare via PEC.",
        <>
          Contatto:{" "}
          <a href="mailto:pietromontanticomposer@gmail.com">
            pietromontanticomposer@gmail.com
          </a>
        </>,
      ],
    },
  },
  en: {
    title: "SIAE Guide to Mod. 109 and Mod. 109TF (music program for audiovisual works)",
    subtitle:
      "For productions and directors. Clear, correct instructions to avoid errors that block or divert royalties.",
    intro: [],
    highlight: {
      heading: "First rule",
      lines: [
        <>
          Forms (use only this link):{" "}
          <a href={moduliUrl} target="_blank" rel="noreferrer">
            {moduliUrl}
          </a>
          .
        </>,
        "If you use an old template, you may fill the wrong fields.",
      ],
    },
    sections: [
      {
        title: "Quick checklist (10 minutes)",
        ordered: true,
        bullets: [
          "Choose the right form: Mod. 109 (cinema) or Mod. 109TF (TV and/or Video On Demand).",
          "Fill in the \"Declaration\" sheet with confirmed data.",
          "Fill in the \"Annex 1 - List of compositions\" sheet with ALL the tracks used in the work.",
          "Durations must be whole seconds.",
          "Export and send via PEC in Excel or digital PDF (not scanned) to MUSIC.COPYRIGHT.REPERTOIRE@PEC.SIAE.IT.",
          "Archive: sent file + PEC acceptance receipt + PEC delivery receipt.",
        ],
      },
      {
        title: "Download the forms (primary source)",
        paragraphs: [
          <>
            Forms (use only this link):{" "}
            <a href={moduliUrl} target="_blank" rel="noreferrer">
              {moduliUrl}
            </a>
            .
          </>,
        ],
      },
      {
        title: "Who does what",
        blocks: [
          {
            heading: "Production",
            bullets: [
              "Completes and submits the form via PEC.",
              "Responsibility stays with the production.",
            ],
          },
          {
            heading: "Composer",
            bullets: [
              "Provides a clean list of tracks and correct data (titles, names, durations, publisher if any).",
            ],
          },
        ],
      },
      {
        title: "When to do it",
        paragraphs: [
          "Do it when the edit and the music are final, and in any case before the first release or broadcast.",
        ],
      },
      {
        title: "How to fill \"Declaration\" (only the key fields)",
        paragraphs: ["Typical fields (fill only what is required):"],
        bullets: [
          "Title of the work.",
          "Genre.",
          "Production details and contacts.",
          "First release: if not available, leave blank or fill only what is certain.",
          "Synchronization manager: the person who handled clearances or the music on the production side.",
          "Composer or publisher of the music: name and contacts.",
        ],
        closing: [
          "Important note: the \"Music duration\" must not be typed manually. It is calculated automatically by summing the durations in Annex 1.",
          "Mod. 109 (cinema) note: the film \"Length\" should be entered as hours, minutes, seconds, or only seconds (whole number).",
        ],
      },
      {
        title:
          "B) Annex 1: music list",
        paragraphs: [
          "This is the sheet where you list all the music used (original and pre-existing).",
          "Fill only the columns present in the official SIAE file (Mod. 109 or Mod. 109TF). Do not add fields.",
          "One row per music cue. Duration must be seconds, numbers only.",
        ],
        blocks: [
          {
            heading: "Example duration conversion",
            bullets: ["2:00 = 120", "0:35 = 35"],
          },
          {
            heading: "Example Annex 1 row",
            bullets: [
              'Scene 12 | "Braga Theme" | Pietro Montanti | (blank) | 34',
            ],
          },
        ],
      },
      {
        title: "Anti-error rules",
        bullets: [
          'Do not write "2:00". Write "120".',
          "If a field is unknown, leave it blank.",
          "\"To be defined\" only for text fields. Never in durations, because they must be numbers.",
          "Do not rename the sheets. Do not break the formulas.",
          'If you use pre-existing tracks, enter the real title and author, not "track 3".',
        ],
      },
      {
        title: "To avoid losing money",
        bullets: [
          "Titles and names must match between the SIAE deposit and Mod. 109 (Annex 1).",
          "The deposited splits (percentages) must be correct and consistent with the actual credits.",
          "Always ask the production for a copy of the submitted Mod. 109 and the PEC receipts.",
          "If production fills it out, ask for a cross-check before sending (titles, authors, publisher, durations).",
        ],
        blocks: [
          {
            heading: "Useful links (SIAE forms)",
            paragraphs: [
              <>
                Moduli SIAE:{" "}
                <a href={moduliUrl} target="_blank" rel="noreferrer">
                  {moduliUrl}
                </a>
                .
              </>,
            ],
          },
        ],
      },
      {
        title: "Submission (PEC only)",
        paragraphs: ["The form must be submitted by the producer exclusively via PEC (not regular email)."],
        bullets: [
          "Final file sent.",
          "PEC acceptance receipt.",
          "PEC delivery receipt.",
        ],
      },
      {
        title: "Errors that make you lose money",
        ordered: true,
        bullets: [
          "Titles in Annex 1 differ from titles filed with SIAE.",
          "Tracks not deposited (original score) or deposited with wrong splits.",
          "Durations not in seconds, or text instead of numbers.",
          "Missing tracks used in the film, so they are not declared.",
          "Submission not via PEC or a scanned submission (image file).",
          "Production does not keep PEC receipts and cannot prove submission.",
        ],
      },
      
    ],
    footer: {
      heading: "Short closing",
      lines: [
        "If you want, I can provide the production with an All.1 file already filled (titles and durations in seconds). They only need to copy and send via PEC.",
        <>
          Contact:{" "}
          <a href="mailto:pietromontanticomposer@gmail.com">
            pietromontanticomposer@gmail.com
          </a>
        </>,
      ],
    },
  },
};

export default function Mod109SiaePage() {
  const { language } = useLanguage();
  const guide = guideData[language];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16 lg:px-20">
      <section className="card-shell p-8">
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          {guide.title}
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {guide.subtitle}
        </p>
        {guide.intro && guide.intro.length > 0 && (
          <div className="mt-5 space-y-3 text-sm text-[color:var(--muted)] leading-relaxed">
            {guide.intro.map((line, index) => (
              <p key={`intro-${index}`}>{line}</p>
            ))}
          </div>
        )}
        <div className="mt-6 card-inset rounded-2xl p-4">
          <div className="text-sm font-semibold text-[color:var(--foreground)]">
            {guide.highlight.heading}
          </div>
          <div className="mt-2 space-y-2 text-sm text-[color:var(--muted)] leading-relaxed">
            {guide.highlight.lines.map((line, index) => (
              <p key={`highlight-${index}`}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      {guide.sections.map((section, sectionIndex) => (
        <section key={`${section.title}-${sectionIndex}`} className="card-shell p-8">
          <h2 className="section-title text-2xl text-[color:var(--foreground)]">
            {section.title}
          </h2>
          {section.paragraphs && (
            <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)] leading-relaxed">
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.title}-p-${index}`}>{paragraph}</p>
              ))}
            </div>
          )}
          {section.bullets &&
            (section.ordered ? (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[color:var(--muted)]">
                {section.bullets.map((item, index) => (
                  <li key={`${section.title}-o-${index}`}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
                {section.bullets.map((item, index) => (
                  <li key={`${section.title}-b-${index}`}>{item}</li>
                ))}
              </ul>
            ))}
          {section.blocks && (
            <div className="mt-4 space-y-4">
              {section.blocks.map((block, blockIndex) => {
                const isWarning = block.variant === "warning";
                return (
                  <div
                    key={`${block.heading}-${blockIndex}`}
                    className={isWarning ? "card-inset rounded-2xl p-4" : undefined}
                    style={
                      isWarning
                        ? {
                            borderColor: "#ff5a5a",
                            background: "rgba(255, 90, 90, 0.08)",
                          }
                        : undefined
                    }
                  >
                    <div className="text-sm font-semibold text-[color:var(--foreground)]">
                      {block.heading}
                    </div>
                    {block.paragraphs && (
                      <div className="mt-2 space-y-2 text-sm text-[color:var(--muted)] leading-relaxed">
                        {block.paragraphs.map((line, lineIndex) => (
                          <p key={`${block.heading}-p-${lineIndex}`}>{line}</p>
                        ))}
                      </div>
                    )}
                    {block.bullets && (
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
                        {block.bullets.map((item, itemIndex) => (
                          <li key={`${block.heading}-b-${itemIndex}`}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {section.closing && (
            <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)] leading-relaxed">
              {section.closing.map((line, index) => (
                <p key={`${section.title}-c-${index}`}>{line}</p>
              ))}
            </div>
          )}
        </section>
      ))}

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {guide.footer.heading}
        </h2>
        <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)] leading-relaxed">
          {guide.footer.lines.map((line, index) => (
            <p key={`footer-${index}`}>{line}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
