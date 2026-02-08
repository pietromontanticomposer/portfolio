"use client";

import type { ReactNode } from "react";
import { useLanguage } from "../../lib/LanguageContext";

type GuideBlock = {
  heading: string;
  paragraphs?: ReactNode[];
  bullets?: ReactNode[];
  variant?: "warning";
};

type GuideSection = {
  title: string;
  paragraphs?: ReactNode[];
  bullets?: ReactNode[];
  ordered?: boolean;
  blocks?: GuideBlock[];
  closing?: ReactNode[];
};

type GuideFooter = {
  heading?: string;
  lines: ReactNode[];
};

type GuideHighlight = {
  heading: string;
  lines: ReactNode[];
};

type GuideContent = {
  title: string;
  subtitle: ReactNode;
  intro?: ReactNode[];
  highlight?: GuideHighlight;
  sections: GuideSection[];
  footer: GuideFooter;
};

const moduliUrl =
  "https://drive.google.com/drive/folders/1CRbEA4gRUjnmiTKNlgZZkGX4l_4QOcmv";
const pecEmail = "music.copyright.repertoire@pec.siae.it";

const itGuide: GuideContent = {
  title: "Guida alla compilazione e all'invio del Mod. 109 e Mod. 109 TF",
  subtitle: (
    <>
      {"Questa guida descrive come compilare correttamente i moduli "}
      <strong>Mod. 109</strong>
      {" e "}
      <strong>Mod. 109 TF</strong>
      {" per la dichiarazione delle musiche utilizzate in un'opera audiovisiva presso "}
      <strong>SIAE</strong>
      {"."}
    </>
  ),
  highlight: {
    heading: "Prassi professionale standard",
    lines: [
      <span key="highlight-1">
        {"La compilazione conforme del Mod. 109 / Mod. 109 TF e' una "}
        <strong>prassi professionale standard</strong>
        {" per regie e produzioni audiovisive."}
      </span>,
      "Seguirla riduce richieste di integrazione, ritardi di lavorazione e contestazioni.",
      "Scostarsi dalle procedure ufficiali non e' in linea con gli standard professionali attesi dalla filiera.",
    ],
  },
  intro: [],
  sections: [
    {
      title: "1. A cosa servono i moduli",
      paragraphs: [
        <span key="sec-1-para-1">
          {"Il Mod. 109 e il Mod. 109 TF costituiscono il "}
          <strong>programma musicale ufficiale</strong>
          {" dell'opera audiovisiva."}
        </span>,
        "Servono a dichiarare:",
      ],
      bullets: [
        "le composizioni musicali utilizzate,",
        "il numero di utilizzi,",
        "la durata effettiva di ciascun utilizzo.",
      ],
      closing: [
        "Queste informazioni sono la base per la corretta attribuzione e ripartizione dei diritti d'autore.",
      ],
    },
    {
      title: "2. Quale modulo utilizzare",
      bullets: [
        "Mod. 109: film e opere cinematografiche.",
        "Mod. 109 TF: opere televisive, serie, episodi, programmi e contenuti destinati a TV o piattaforme VOD.",
      ],
    },
    {
      title: "3. Dove scaricare i moduli",
      paragraphs: [
        "I moduli ufficiali Mod. 109 e Mod. 109 TF in formato Excel possono essere scaricati da questo link:",
        <span key="sec-3-link" className="inline-flex">
          <button
            type="button"
            className="hero-btn hero-btn-secondary btn-compact"
            onClick={() => window.open(moduliUrl, "_blank", "noopener,noreferrer")}
          >
            Scarica moduli
          </button>
        </span>,
        "E' necessario utilizzare esclusivamente i file Excel originali, senza modificarne la struttura, e verificare di avere la versione aggiornata prima della compilazione.",
      ],
    },
    {
      title: "4. Principio fondamentale di compilazione",
      paragraphs: [
        <span key="sec-4-para-1">
          {"Ogni "}
          <strong>utilizzo effettivo</strong>
          {" di una composizione musicale deve essere indicato con "}
          <strong>una riga separata</strong>
          {" nell'elenco musiche."}
        </span>,
        "Se la stessa composizione compare piu' volte nell'opera, deve essere inserita piu' volte, una per ciascun utilizzo, con la relativa durata.",
      ],
    },
    {
      title: "5. Materiale necessario prima della compilazione",
      paragraphs: ["Prima di compilare il modulo e' necessario disporre di:"],
      bullets: [
        "una versione dell'opera con montaggio definitivo o picture lock operativo,",
        "l'elenco completo delle musiche utilizzate,",
        "la durata in secondi di ogni utilizzo musicale,",
        "i dati completi della produzione,",
        "per il Mod. 109 TF, i dati relativi alla prima diffusione o pubblicazione.",
      ],
    },
    {
      title: "6. Regole tecniche generali",
      bullets: [
        <span key="sec-6-bullet-1">
          {"Il modulo deve essere inviato "}
          <strong>dal produttore</strong>
          {"."}
        </span>,
        <span key="sec-6-bullet-2">
          {"L'invio deve avvenire "}
          <strong>esclusivamente tramite PEC</strong>
          {"."}
        </span>,
        <span key="sec-6-bullet-3">
          {"Il file deve essere in formato "}
          <strong>Excel originale o PDF digitale</strong>
          {", non scannerizzato."}
        </span>,
        <span key="sec-6-bullet-4">
          {"Le durate delle musiche devono essere indicate "}
          <strong>solo in secondi</strong>
          {", come numeri interi."}
        </span>,
        "La durata totale della musica viene calcolata automaticamente dal modulo.",
      ],
    },
    {
      title: "7. Compilazione del foglio \"Dichiarazione\"",
      paragraphs: [
        "Nel foglio \"Dichiarazione\" devono essere compilati, secondo quanto richiesto dal modulo:",
      ],
      bullets: [
        "titolo dell'opera audiovisiva,",
        "genere,",
        "durata totale dell'opera,",
        "dati del produttore e contatti,",
        "eventuale distributore,",
        "nome del regista,",
        "per il Mod. 109 TF, dati relativi alla prima diffusione o pubblicazione.",
      ],
      closing: ["Il foglio deve essere firmato e datato dai soggetti indicati nel modello."],
    },
    {
      title: "8. Compilazione del foglio \"All. 1 - Elenco composizioni\"",
      paragraphs: ["Per ogni utilizzo musicale compilare una riga indicando:"],
      bullets: [
        "numero progressivo o riferimento di scena,",
        "titolo della composizione musicale,",
        "nome e cognome del compositore,",
        "editore, se presente,",
        "durata dell'utilizzo in secondi,",
        "eventuali ulteriori campi richiesti dal modulo, come il tipo di utilizzazione.",
      ],
      closing: ["Le righe devono seguire l'ordine di apparizione delle musiche nell'opera."],
    },
    {
      title: "9. Calcolo delle durate",
      paragraphs: [
        "La durata di ciascun utilizzo deve corrispondere al tempo reale in cui la musica e' udibile nell'opera.",
        "Procedura consigliata:",
      ],
      ordered: true,
      bullets: [
        "individuare il punto di ingresso della musica,",
        "individuare il punto di uscita,",
        "calcolare la differenza temporale,",
        "convertire il valore in secondi.",
      ],
      closing: [
        "Utilizzi separati, anche della stessa composizione, devono essere indicati separatamente.",
      ],
    },
    {
      title: "10. Coerenza dei titoli musicali",
      paragraphs: [
        "E' consigliato utilizzare, nell'elenco composizioni, titoli coerenti con quelli delle opere musicali depositate nel repertorio, per evitare errori di attribuzione o ritardi nella ripartizione.",
      ],
    },
    {
      title: "11. Invio tramite PEC",
      paragraphs: [
        "Il produttore deve inviare il modulo compilato via PEC all'indirizzo indicato nel modello SIAE:",
        <span key="sec-11-pec" className="inline-flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-[color:var(--foreground)]">
            {pecEmail}
          </span>
          <button
            type="button"
            className="inline-flex text-xs uppercase tracking-wider text-[color:var(--muted)] transition hover:text-[color:var(--foreground)] underline underline-offset-4"
            onClick={() => {
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(pecEmail).catch(() => {});
              }
            }}
          >
            Copia mail
          </button>
        </span>,
        "Allegare il file Excel originale o il PDF digitale e conservare le ricevute PEC di accettazione e consegna.",
      ],
    },
    {
      title: "12. Controlli finali",
      paragraphs: ["Prima dell'invio verificare che:"],
      bullets: [
        "tutte le musiche utilizzate siano state inserite,",
        "ogni utilizzo abbia una riga dedicata,",
        "tutte le durate siano espresse in secondi,",
        "il file sia in formato digitale corretto,",
        "firme e dati richiesti siano presenti,",
        "una copia del file inviato e delle ricevute PEC sia archiviata.",
      ],
    },
    {
      title: "13. Moduli aggiuntivi",
      paragraphs: [
        "In presenza dei requisiti previsti, possono essere compilati anche moduli specifici per richieste di maggiorazione o provvidenze relative alle colonne sonore, disponibili nella modulistica SIAE.",
      ],
    },
  ],
  footer: {
    heading: "",
    lines: [],
  },
};

const enGuide: GuideContent = {
  title: "Guide to completing and submitting Mod. 109 and Mod. 109 TF",
  subtitle: (
    <>
      {"This guide explains how to correctly complete the "}
      <strong>Mod. 109</strong>
      {" and "}
      <strong>Mod. 109 TF</strong>
      {" forms for declaring the music used in an audiovisual work with "}
      <strong>SIAE</strong>
      {"."}
    </>
  ),
  highlight: {
    heading: "Standard professional practice",
    lines: [
      <span key="highlight-1-en">
        {"Proper completion of Mod. 109 / Mod. 109 TF is "}
        <strong>standard professional practice</strong>
        {" for directors and audiovisual productions."}
      </span>,
      "Following it reduces requests for additional information, processing delays, and disputes.",
      "Deviating from the official procedures is not aligned with the professional standards expected across the production chain.",
    ],
  },
  intro: [],
  sections: [
    {
      title: "1. What the forms are for",
      paragraphs: [
        <span key="sec-1-para-1-en">
          {"Mod. 109 and Mod. 109 TF are the "}
          <strong>official music cue sheet</strong>
          {" for the audiovisual work."}
        </span>,
        "They are used to declare:",
      ],
      bullets: [
        "the musical compositions used,",
        "the number of uses,",
        "the effective duration of each use.",
      ],
      closing: [
        "This information is the basis for the correct attribution and distribution of authors' rights.",
      ],
    },
    {
      title: "2. Which form to use",
      bullets: [
        "Mod. 109: films and cinematic works.",
        "Mod. 109 TF: television works, series, episodes, programs, and content intended for TV or VOD platforms.",
      ],
    },
    {
      title: "3. Where to download the forms",
      paragraphs: [
        "The official Mod. 109 and Mod. 109 TF Excel forms can be downloaded from this link:",
        <span key="sec-3-link-en" className="inline-flex">
          <button
            type="button"
            className="hero-btn hero-btn-secondary btn-compact"
            onClick={() => window.open(moduliUrl, "_blank", "noopener,noreferrer")}
          >
            Download forms
          </button>
        </span>,
        "You must use only the original Excel files, without altering their structure, and make sure you have the latest version before filling them in.",
      ],
    },
    {
      title: "4. Core completion principle",
      paragraphs: [
        <span key="sec-4-para-1-en">
          {"Each "}
          <strong>actual use</strong>
          {" of a musical composition must be listed on "}
          <strong>a separate line</strong>
          {" in the music list."}
        </span>,
        "If the same composition appears multiple times in the work, it must be entered multiple times, one for each use, with the corresponding duration.",
      ],
    },
    {
      title: "5. Materials needed before filling in",
      paragraphs: ["Before filling in the form, you must have:"],
      bullets: [
        "a version of the work with final edit or an operational picture lock,",
        "the complete list of music used,",
        "the duration in seconds of each music use,",
        "full production details,",
        "for Mod. 109 TF, details of the first broadcast or publication.",
      ],
    },
    {
      title: "6. General technical rules",
      bullets: [
        <span key="sec-6-bullet-1-en">
          {"The form must be submitted "}
          <strong>by the producer</strong>
          {"."}
        </span>,
        <span key="sec-6-bullet-2-en">
          {"Submission must be "}
          <strong>exclusively via PEC</strong>
          {"."}
        </span>,
        <span key="sec-6-bullet-3-en">
          {"The file must be in "}
          <strong>original Excel format or a digital PDF</strong>
          {", not scanned."}
        </span>,
        <span key="sec-6-bullet-4-en">
          {"Music durations must be indicated "}
          <strong>only in seconds</strong>
          {", as whole numbers."}
        </span>,
        "Total music duration is calculated automatically by the form.",
      ],
    },
    {
      title: "7. Completing the \"Declaration\" sheet",
      paragraphs: [
        "In the \"Declaration\" sheet, according to the form, you must fill in:",
      ],
      bullets: [
        "title of the audiovisual work,",
        "genre,",
        "total duration of the work,",
        "producer details and contacts,",
        "any distributor,",
        "director name,",
        "for Mod. 109 TF, details of the first broadcast or publication.",
      ],
      closing: ["The sheet must be signed and dated by the parties indicated in the form."],
    },
    {
      title: "8. Completing the \"Annex 1 - List of compositions\" sheet",
      paragraphs: ["For each music use, fill in a row indicating:"],
      bullets: [
        "progressive number or scene reference,",
        "title of the musical composition,",
        "composer first and last name,",
        "publisher, if present,",
        "duration of the use in seconds,",
        "any additional fields required by the form, such as the type of use.",
      ],
      closing: ["Rows must follow the order in which the music appears in the work."],
    },
    {
      title: "9. Calculating durations",
      paragraphs: [
        "The duration of each use must match the actual time the music is audible in the work.",
        "Recommended procedure:",
      ],
      ordered: true,
      bullets: [
        "identify the entry point of the music,",
        "identify the exit point,",
        "calculate the time difference,",
        "convert the value into seconds.",
      ],
      closing: [
        "Separate uses, even of the same composition, must be listed separately.",
      ],
    },
    {
      title: "10. Consistency of music titles",
      paragraphs: [
        "It is recommended to use, in the list of compositions, titles consistent with those of musical works registered in the repertoire, to avoid attribution errors or delays in distribution.",
      ],
    },
    {
      title: "11. Submission via PEC",
      paragraphs: [
        "The producer must send the completed form via PEC to the address indicated in the SIAE form:",
        <span key="sec-11-pec-en" className="inline-flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-[color:var(--foreground)]">
            {pecEmail}
          </span>
          <button
            type="button"
            className="inline-flex text-xs uppercase tracking-wider text-[color:var(--muted)] transition hover:text-[color:var(--foreground)] underline underline-offset-4"
            onClick={() => {
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(pecEmail).catch(() => {});
              }
            }}
          >
            Copy email
          </button>
        </span>,
        "Attach the original Excel file or the digital PDF and keep the PEC acceptance and delivery receipts.",
      ],
    },
    {
      title: "12. Final checks",
      paragraphs: ["Before sending, verify that:"],
      bullets: [
        "all music used has been entered,",
        "each use has its own row,",
        "all durations are expressed in seconds,",
        "the file is in the correct digital format,",
        "signatures and required data are present,",
        "a copy of the submitted file and PEC receipts is archived.",
      ],
    },
    {
      title: "13. Additional forms",
      paragraphs: [
        "If the requirements apply, specific forms can also be completed for requests for increases or grants related to soundtracks, available in the SIAE forms.",
      ],
    },
  ],
  footer: {
    heading: "",
    lines: [],
  },
};

const guideData: Record<"it" | "en", GuideContent> = {
  it: itGuide,
  en: enGuide,
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
        {guide.highlight && guide.highlight.lines.length > 0 ? (
          <div className="mt-6 card-inset rounded-2xl p-4">
            {guide.highlight.heading ? (
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {guide.highlight.heading}
              </div>
            ) : null}
            <div className="mt-2 space-y-2 text-sm text-[color:var(--muted)] leading-relaxed">
              {guide.highlight.lines.map((line, index) => (
                <p key={`highlight-${index}`}>{line}</p>
              ))}
            </div>
          </div>
        ) : null}
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

      {guide.footer.lines.length > 0 ? (
        <section className="card-shell p-8">
          {guide.footer.heading ? (
            <h2 className="section-title text-2xl text-[color:var(--foreground)]">
              {guide.footer.heading}
            </h2>
          ) : null}
          <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)] leading-relaxed">
            {guide.footer.lines.map((line, index) => (
              <p key={`footer-${index}`}>{line}</p>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
