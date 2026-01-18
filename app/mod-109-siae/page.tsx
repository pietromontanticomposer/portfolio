"use client";

import type { ReactNode } from "react";
import { useLanguage } from "../../lib/LanguageContext";

const guideData: Record<
  "it" | "en",
  {
    title: string;
    subtitle: string;
    intro: string[];
    download: { label: string; linkLabel: string; url: string };
    sections: Array<{
      title: string;
      paragraphs?: ReactNode[];
      bullets?: string[];
      blocks?: Array<{ heading: string; bullets: string[] }>;
      closing?: ReactNode[];
    }>;
    faq: Array<{ question: string; answer: ReactNode[] }>;
    summary: string[];
  }
> = {
  it: {
    title: "Guida SIAE per registi e produttori",
    subtitle: "Mod. 109 e Mod. 109 TF – Programma Musicale per opere audiovisive",
    intro: [
      "Questa guida e' pensata per registi e produzioni, in particolare indipendenti, per gestire in modo semplice e corretto gli adempimenti SIAE legati alle musiche di un'opera audiovisiva.",
      "L'obiettivo e' lavorare bene, senza complicazioni inutili, tutelando tutti.",
    ],
    download: {
      label: "Scarica i moduli",
      linkLabel: "Cartella Drive con i moduli pronti all'uso",
      url: "https://drive.google.com/drive/folders/1CRbEA4gRUjnmiTKNlgZZkGX4l_4QOcmv?usp=sharing",
    },
    sections: [
      {
        title: "1) Cos'e' il Mod. 109",
        paragraphs: [
          "Il Mod. 109 e' il documento con cui la produzione comunica alla SIAE:",
        ],
        bullets: [
          "Quale opera audiovisiva e' stata realizzata.",
          "Quali musiche sono utilizzate al suo interno.",
        ],
        closing: [
          "E' una procedura standard che permette la corretta gestione dei diritti d'autore.",
        ],
      },
      {
        title: "2) Quale modulo usare",
        bullets: [
          "Mod. 109: film cinematografici, cortometraggi, documentari.",
          "Mod. 109 TF: film TV, serie, episodi, contenuti destinati a TV o piattaforme.",
        ],
        closing: [
          "Se la destinazione cambia in seguito, il deposito puo' essere aggiornato.",
        ],
      },
      {
        title: "3) Chi compila e chi fornisce i dati",
        bullets: [
          "La produzione o il regista produttore compila e invia il Mod. 109.",
          "Il compositore fornisce l'elenco completo delle musiche e i relativi dati tecnici.",
        ],
        closing: [
          "La responsabilita' dell'invio resta sempre della produzione.",
        ],
      },
      {
        title: "4) Come compilare il modulo (passo per passo)",
        blocks: [
          {
            heading: "A) Dichiarazione",
            bullets: [
              "Titolo.",
              "Tipologia (film, corto, documentario, serie, ecc.).",
              "Durata totale.",
              "Dati della produzione e contatti.",
              "Regia e informazioni richieste nel modulo.",
            ],
          },
          {
            heading: "B) Allegato 1 - Elenco musiche",
            bullets: [
              "Titolo del brano.",
              "Autore o autori.",
              "Percentuali.",
              "Durata effettiva in scena, in secondi.",
              "Tipo di utilizzo (sottofondo, in scena, sigla, ecc.).",
            ],
          },
          {
            heading: "C) Controllo finale",
            bullets: [
              "Titolo e durata dell'opera.",
              "Elenco musiche completo.",
              "Durate coerenti.",
              "Nomi degli autori corretti.",
            ],
          },
          {
            heading: "D) Firma e invio",
            bullets: [
              "Il modulo va inviato dalla produzione.",
              "Una volta compilati, i moduli vanno inviati tramite PEC a MUSIC.COPYRIGHT.REPERTOIRE@PEC.SIAE.IT.",
              "In formato Excel o PDF digitale (non scansione).",
            ],
          },
        ],
        closing: [
          "Dopo l'invio, conservare il file inviato e le ricevute PEC di accettazione e consegna.",
        ],
      },
      {
        title: "5) Se non e' ancora chiara la distribuzione",
        paragraphs: [
          "Nei progetti indipendenti e' normale non sapere subito:",
        ],
        bullets: [
          "Dove verra' distribuito il film.",
          "Se passera' da festival, TV o piattaforme.",
          "Le date di uscita.",
        ],
        closing: [
          "In questi casi: compilare tutti i dati certi su opera e musiche.",
          "Indicare i campi non noti come " +
            "\"da definire\" (o lasciarli vuoti se il modulo lo consente).",
          "Il deposito resta valido e puo' essere aggiornato in seguito.",
        ],
      },
    ],
    faq: [
      {
        question: "Devo compilare tutti i campi del Mod. 109?",
        answer: [
          "No.",
          "E' necessario compilare correttamente i campi essenziali: dati dell'opera, dati della produzione ed elenco musiche.",
          "Gli altri possono essere \"da definire\".",
        ],
      },
      {
        question: "Se non sappiamo ancora dove andra' distribuito il film, e' un problema?",
        answer: [
          "No.",
          "Il Mod. 109 e' valido anche se la distribuzione non e' ancora definita.",
          "Potra' essere aggiornata in seguito.",
        ],
      },
      {
        question: "Chi deve inviare il Mod. 109 alla SIAE?",
        answer: [
          "La produzione o il regista produttore.",
          "Il compositore non invia il modulo.",
        ],
      },
      {
        question: "Il compositore puo' compilarlo al posto nostro?",
        answer: [
          "Il compositore puo' preparare l'elenco delle musiche, ma la compilazione finale e l'invio restano a carico della produzione.",
        ],
      },
      {
        question: "Se ci accorgiamo di un errore dopo l'invio?",
        answer: [
          "Nessun problema.",
          "Il modulo puo' essere corretto e reinviato.",
        ],
      },
      {
        question: "Cosa succede se la distribuzione cambia?",
        answer: [
          "E' normale.",
          "Si aggiorna o si reinvia il Mod. 109 con le nuove informazioni.",
        ],
      },
      {
        question: "In che formato va inviato il modulo?",
        answer: [
          "In formato Excel o PDF digitale, non scansionato, tramite PEC.",
        ],
      },
      {
        question: "Dobbiamo comunicare qualcosa anche al compositore?",
        answer: [
          "Si'. E' buona prassi condividere:",
          "Una copia del Mod. 109 inviato.",
          "Le ricevute PEC di accettazione e consegna.",
        ],
      },
      {
        question: "Quando e' il momento giusto per compilarlo?",
        answer: [
          "Quando il montaggio e' stabile e le musiche sono definite, e comunque prima di qualunque distribuzione o pubblicazione.",
        ],
      },
    ],
    summary: [
      "Non serve avere tutto chiaro sul futuro del progetto.",
      "E' sufficiente dichiarare correttamente che opera e' e quali musiche contiene.",
      "Per qualsiasi dubbio operativo, il dialogo tra produzione e compositore rende il processo semplice, fluido e senza complicazioni.",
    ],
  },
  en: {
    title: "SIAE Guide for Directors and Producers",
    subtitle: "Mod. 109 and Mod. 109 TF – Music Program for audiovisual works",
    intro: [
      "This guide is meant for directors and productions, especially independent ones, to handle SIAE obligations related to music in an audiovisual work in a simple and correct way.",
      "The goal is to work well, without unnecessary complications, protecting everyone.",
    ],
    download: {
      label: "Download the forms",
      linkLabel: "Drive folder with ready-to-use forms",
      url: "https://drive.google.com/drive/folders/1CRbEA4gRUjnmiTKNlgZZkGX4l_4QOcmv?usp=sharing",
    },
    sections: [
      {
        title: "1) What Mod. 109 is",
        paragraphs: [
          "Mod. 109 is the document through which the production communicates to SIAE:",
        ],
        bullets: [
          "Which audiovisual work has been made.",
          "Which music is used inside it.",
        ],
        closing: [
          "It is a standard procedure that enables proper copyright management.",
        ],
      },
      {
        title: "2) Which form to use",
        bullets: [
          "Mod. 109: feature films, shorts, documentaries.",
          "Mod. 109 TF: TV films, series, episodes, content for TV or platforms.",
        ],
        closing: [
          "If the destination changes later, the filing can be updated.",
        ],
      },
      {
        title: "3) Who completes it and who provides the data",
        bullets: [
          "The production or director-producer completes and submits Mod. 109.",
          "The composer provides the full list of music and the related technical data.",
        ],
        closing: [
          "Responsibility for submission always stays with the production.",
        ],
      },
      {
        title: "4) How to fill the form (step by step)",
        blocks: [
          {
            heading: "A) Declaration",
            bullets: [
              "Title.",
              "Type (film, short, documentary, series, etc.).",
              "Total duration.",
              "Production details and contacts.",
              "Direction and information required in the form.",
            ],
          },
          {
            heading: "B) Annex 1 - Music list",
            bullets: [
              "Track title.",
              "Author or authors.",
              "Percentages.",
              "Actual on-screen duration, in seconds.",
              "Type of use (background, on-screen, main title, etc.).",
            ],
          },
          {
            heading: "C) Final check",
            bullets: [
              "Title and duration of the work.",
              "Complete music list.",
              "Consistent durations.",
              "Correct author names.",
            ],
          },
          {
            heading: "D) Signature and submission",
            bullets: [
              "The form must be sent by the production.",
              "Once completed, the forms must be sent via PEC to MUSIC.COPYRIGHT.REPERTOIRE@PEC.SIAE.IT.",
              "In Excel or digital PDF format (not scanned).",
            ],
          },
        ],
        closing: [
          "After sending, keep the file sent and the PEC acceptance and delivery receipts.",
        ],
      },
      {
        title: "5) If distribution is not yet clear",
        paragraphs: [
          "In independent projects it is normal not to know right away:",
        ],
        bullets: [
          "Where the film will be distributed.",
          "Whether it will go through festivals, TV, or platforms.",
          "Release dates.",
        ],
        closing: [
          "In these cases: fill in all the certain data about the work and the music.",
          "Mark unknown fields as \"to be defined\" (or leave them blank if the form allows).",
          "The filing remains valid and can be updated later.",
        ],
      },
    ],
    faq: [
      {
        question: "Do I have to fill in every field in Mod. 109?",
        answer: [
          "No.",
          "You must correctly fill the essential fields: work details, production details, and music list.",
          "The others can be marked as \"to be defined\".",
        ],
      },
      {
        question: "If we do not yet know where the film will be distributed, is it a problem?",
        answer: [
          "No.",
          "Mod. 109 is valid even if distribution is not yet defined.",
          "It can be updated later.",
        ],
      },
      {
        question: "Who must submit Mod. 109 to SIAE?",
        answer: [
          "The production or director-producer.",
          "The composer does not submit the form.",
        ],
      },
      {
        question: "Can the composer fill it in for us?",
        answer: [
          "The composer can prepare the music list, but the final completion and submission remain the production's responsibility.",
        ],
      },
      {
        question: "What if we notice a mistake after submission?",
        answer: [
          "No problem.",
          "The form can be corrected and resubmitted.",
        ],
      },
      {
        question: "What happens if distribution changes?",
        answer: [
          "That is normal.",
          "You update or resend Mod. 109 with the new information.",
        ],
      },
      {
        question: "In what format should the form be sent?",
        answer: [
          "In Excel or digital PDF format, not scanned, via PEC.",
        ],
      },
      {
        question: "Should we communicate anything to the composer?",
        answer: [
          "Yes. It is good practice to share:",
          "A copy of the submitted Mod. 109.",
          "The PEC acceptance and delivery receipts.",
        ],
      },
      {
        question: "When is the right time to complete it?",
        answer: [
          "When the edit is stable and the music is defined, and in any case before any distribution or publication.",
        ],
      },
    ],
    summary: [
      "You do not need to have everything clear about the project's future.",
      "It is enough to declare correctly what the work is and which music it contains.",
      "For any operational question, dialogue between production and composer keeps the process simple, smooth, and complication-free.",
    ],
  },
};

export default function Mod109SiaePage() {
  const { language, t } = useLanguage();
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
        <div className="mt-5 space-y-3 text-sm text-[color:var(--muted)] leading-relaxed">
          {guide.intro.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {guide.download.label}
        </h2>
        <p className="mt-4 text-sm text-[color:var(--muted)]">
          <a href={guide.download.url} target="_blank" rel="noreferrer">
            {guide.download.linkLabel}
          </a>
        </p>
      </section>

      {guide.sections.map((section) => (
        <section key={section.title} className="card-shell p-8">
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
          {section.bullets && (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.blocks && (
            <div className="mt-4 space-y-4">
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
          FAQ - {t("Domande frequenti", "Frequently asked questions")}
        </h2>
        <div className="mt-4 space-y-6">
          {guide.faq.map((item) => (
            <div key={item.question} className="space-y-2">
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
                {item.question}
              </h3>
              <div className="space-y-2 text-sm text-[color:var(--muted)] leading-relaxed">
                {item.answer.map((line, index) => (
                  <p key={`${item.question}-a-${index}`}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {t("In sintesi", "In summary")}
        </h2>
        <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)] leading-relaxed">
          {guide.summary.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
