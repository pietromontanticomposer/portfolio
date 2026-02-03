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
    title: "Guida alla compilazione e all'invio del Mod. 109 e Mod. 109 TF",
    subtitle:
      "Questa guida descrive come compilare correttamente i moduli Mod. 109 e Mod. 109 TF per la dichiarazione delle musiche utilizzate in un'opera audiovisiva presso SIAE.",
    intro: [],
    highlight: {
      heading: "Principio fondamentale di compilazione",
      lines: [
        "Ogni utilizzo effettivo di una composizione musicale deve essere indicato con una riga separata nell'elenco musiche.",
        "Se la stessa composizione compare piu' volte nell'opera, deve essere inserita piu' volte, una per ciascun utilizzo, con la relativa durata.",
      ],
    },
    sections: [
      {
        title: "1. A cosa servono i moduli",
        paragraphs: [
          "Il Mod. 109 e il Mod. 109 TF costituiscono il programma musicale ufficiale dell'opera audiovisiva.",
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
          <>
            I moduli ufficiali Mod. 109 e Mod. 109 TF in formato Excel possono essere scaricati da questo link:{" "}
            <a href={moduliUrl} target="_blank" rel="noreferrer">
              {moduliUrl}
            </a>
            .
          </>,
          "E' necessario utilizzare esclusivamente i file Excel originali, senza modificarne la struttura, e verificare di avere la versione aggiornata prima della compilazione.",
        ],
      },
      {
        title: "4. Principio fondamentale di compilazione",
        paragraphs: [
          "Ogni utilizzo effettivo di una composizione musicale deve essere indicato con una riga separata nell'elenco musiche.",
          "Se la stessa composizione compare piu' volte nell'opera, deve essere inserita piu' volte, una per ciascun utilizzo, con la relativa durata.",
        ],
      },
      {
        title: "5. Materiale necessario prima della compilazione",
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
          "Il modulo deve essere inviato dal produttore.",
          "L'invio deve avvenire esclusivamente tramite PEC.",
          "Il file deve essere in formato Excel originale o PDF digitale, non scannerizzato.",
          "Le durate delle musiche devono essere indicate solo in secondi, come numeri interi.",
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
          <>
            Il produttore deve inviare il modulo compilato via PEC all&apos;indirizzo indicato nel modello SIAE:{" "}
            <a href="mailto:music.copyright.repertoire@pec.siae.it">
              music.copyright.repertoire@pec.siae.it
            </a>
            .
          </>,
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
  },
  en: {
    title: "Guide to filling out and submitting Mod. 109 and Mod. 109 TF",
    subtitle:
      "This guide explains how to correctly fill in Mod. 109 and Mod. 109 TF to declare the music used in an audiovisual work with SIAE.",
    intro: [],
    highlight: {
      heading: "Fundamental principle of compilation",
      lines: [
        "Each actual use of a musical composition must be listed with a separate row in the music list.",
        "If the same composition appears more than once in the work, it must be listed multiple times, one per use, with its duration.",
      ],
    },
    sections: [
      {
        title: "1. What the forms are for",
        paragraphs: [
          "Mod. 109 and Mod. 109 TF are the official music program of the audiovisual work.",
          "They are used to declare:",
        ],
        bullets: [
          "the musical compositions used,",
          "the number of uses,",
          "the actual duration of each use.",
        ],
        closing: [
          "This information is the basis for the correct attribution and distribution of authors' rights.",
        ],
      },
      {
        title: "2. Which form to use",
        bullets: [
          "Mod. 109: films and cinematic works.",
          "Mod. 109 TF: television works, series, episodes, programs, and content for TV or VOD platforms.",
        ],
      },
      {
        title: "3. Where to download the forms",
        paragraphs: [
          <>
            The official Mod. 109 and Mod. 109 TF Excel forms can be downloaded from this link:{" "}
            <a href={moduliUrl} target="_blank" rel="noreferrer">
              {moduliUrl}
            </a>
            .
          </>,
          "You must use only the original Excel files, without changing their structure, and make sure you have the latest version before filling them out.",
        ],
      },
      {
        title: "4. Fundamental principle of compilation",
        paragraphs: [
          "Each actual use of a musical composition must be listed with a separate row in the music list.",
          "If the same composition appears more than once in the work, it must be listed multiple times, one per use, with its duration.",
        ],
      },
      {
        title: "5. What you need before filling out",
        bullets: [
          "a version of the work with a final edit or operational picture lock,",
          "the complete list of music used,",
          "the duration in seconds of each musical use,",
          "full production details,",
          "for Mod. 109 TF, data related to first broadcast or publication.",
        ],
      },
      {
        title: "6. General technical rules",
        bullets: [
          "The form must be submitted by the producer.",
          "Submission must be exclusively via PEC.",
          "The file must be the original Excel format or a digital PDF, not scanned.",
          "Music durations must be indicated only in seconds, as whole numbers.",
          "Total music duration is calculated automatically by the form.",
        ],
      },
      {
        title: "7. Filling in the \"Declaration\" sheet",
        paragraphs: [
          "In the \"Declaration\" sheet, the following must be filled in as required by the form:",
        ],
        bullets: [
          "title of the audiovisual work,",
          "genre,",
          "total duration of the work,",
          "producer details and contacts,",
          "any distributor,",
          "director's name,",
          "for Mod. 109 TF, data related to first broadcast or publication.",
        ],
        closing: [
          "The sheet must be signed and dated by the people indicated in the form.",
        ],
      },
      {
        title: "8. Filling in the \"Annex 1 - List of compositions\" sheet",
        paragraphs: ["For each musical use, fill one row indicating:"],
        bullets: [
          "progressive number or scene reference,",
          "title of the musical composition,",
          "composer's first and last name,",
          "publisher, if any,",
          "duration of the use in seconds,",
          "any additional fields required by the form, such as type of use.",
        ],
        closing: [
          "Rows must follow the order in which the music appears in the work.",
        ],
      },
      {
        title: "9. Calculating durations",
        paragraphs: [
          "The duration of each use must match the real time the music is audible in the work.",
          "Recommended procedure:",
        ],
        ordered: true,
        bullets: [
          "identify the music entry point,",
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
          "It is recommended to use titles consistent with those of the works deposited in the repertoire, to avoid attribution errors or delays in distribution.",
        ],
      },
      {
        title: "11. PEC submission",
        paragraphs: [
          <>
            The producer must send the completed form via PEC to the address indicated in the SIAE form:{" "}
            <a href="mailto:music.copyright.repertoire@pec.siae.it">
              music.copyright.repertoire@pec.siae.it
            </a>
            .
          </>,
          "Attach the original Excel file or the digital PDF and keep the PEC acceptance and delivery receipts.",
        ],
      },
      {
        title: "12. Final checks",
        paragraphs: ["Before sending, verify that:"],
        bullets: [
          "all music used has been entered,",
          "each use has its own dedicated row,",
          "all durations are expressed in seconds,",
          "the file is in the correct digital format,",
          "required signatures and data are present,",
          "a copy of the sent file and the PEC receipts is archived.",
        ],
      },
      {
        title: "13. Additional forms",
        paragraphs: [
          "If the requirements are met, additional forms for requests for \"maggiorazione\" or \"provvidenze\" related to soundtracks can also be filled out, available in the SIAE forms.",
        ],
      },
    ],
    footer: {
      heading: "",
      lines: [],
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
