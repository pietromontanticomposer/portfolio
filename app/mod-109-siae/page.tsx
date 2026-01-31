"use client";

import type { ReactNode } from "react";
import { useLanguage } from "../../lib/LanguageContext";

type GuideBlock = {
  heading: string;
  paragraphs?: ReactNode[];
  bullets?: string[];
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

const driveUrl =
  "https://drive.google.com/drive/folders/1CRbEA4gRUjnmiTKNlgZZkGX4l_4QOcmv?usp=sharing";
const moduliUrl = "https://www.siae.it/it/moduli/";
const videoCinemaTvUrl =
  "https://www.siae.it/it/utilizzatori/chiedere-licenza/servizi/cd-dvd/video-cinema-tv";

const guideData: Record<"it" | "en", GuideContent> = {
  it: {
    title: "Guida SIAE. Mod. 109 e Mod. 109TF (programma musicale opere audiovisive)",
    subtitle:
      "Per produzioni e registi. Compilazione semplice, corretta, senza errori che bloccano o deviano i compensi.",
    intro: [],
    highlight: {
      heading: "Prima regola",
      lines: [
        <>
          Usa sempre l'ultima versione ufficiale dei moduli SIAE. Pagina Moduli
          SIAE (Deposito Opere Audiovisive: Mod. 109 e Mod. 109TF):{" "}
          <a href={moduliUrl} target="_blank" rel="noreferrer">
            {moduliUrl}
          </a>
          .
        </>,
        <>
          Pagina Video cinema-tv SIAE (stessi modelli linkati nel contesto
          video):{" "}
          <a href={videoCinemaTvUrl} target="_blank" rel="noreferrer">
            {videoCinemaTvUrl}
          </a>
          .
        </>,
        <>
          Copia di comodo (opzionale, potrebbe non essere aggiornato):{" "}
          <a href={driveUrl} target="_blank" rel="noreferrer">
            Cartella Drive
          </a>
          .
        </>,
        "Se usi un Drive o un template salvato mesi fa, rischi di compilare campi sbagliati.",
      ],
    },
    sections: [
      {
        title: "Checklist veloce (10 minuti)",
        ordered: true,
        bullets: [
          "Scegli il modulo: Mod. 109 (opera cinematografica) o Mod. 109TF (opera televisiva e/o Video On Demand).",
          "Compila il foglio \"Dichiarazione\" con i dati certi.",
          "Compila il foglio \"All.1 - Elenco composizioni\" con TUTTI i brani presenti nell'opera.",
          "Controlla che le durate siano in secondi interi.",
          "Esporta e invia via PEC in Excel oppure PDF digitale (non scansione) a MUSIC.COPYRIGHT.REPERTOIRE@PEC.SIAE.IT.",
          "Archivia: File finale inviato. Ricevuta accettazione PEC. Ricevuta consegna PEC.",
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
        title: "Come compilare \"Dichiarazione\" (solo quello che conta)",
        paragraphs: ["Campi tipici:"],
        bullets: [
          "Titolo dell'opera.",
          "Genere.",
          "Dati produzione e contatti.",
          "Prima diffusione: se non disponibile, lascia vuoto o compila solo cio' che e' certo.",
          "Responsabile della sincronizzazione: la persona che ha gestito le autorizzazioni o la parte musica lato produzione.",
          "Compositore o editore della musica: nominativo e contatti.",
        ],
        closing: [
          "Nota importante: la \"Durata musica\" non va inserita a mano. Si calcola automaticamente sommando le durate in All.1.",
          "Nota specifica Mod. 109 (cinema): la \"Lunghezza\" del film va inserita come ore, minuti, secondi, oppure solo in secondi (numero intero).",
        ],
      },
      {
        title:
          "Come compilare \"All.1 - Elenco composizioni\" (questa e' la parte che decide i compensi)",
        paragraphs: ["In All.1 devi inserire, una riga per brano:"],
        bullets: [
          "N° d'ordine delle scene (un numero progressivo).",
          "Titolo della composizione (come risulta dal deposito, se gia' depositata).",
          "Compositore (ed eventuale elaboratore solo per pubblico dominio).",
          "Editore (se esiste, altrimenti lascia vuoto).",
          "Durata in secondi (solo numero intero, niente testo).",
        ],
        blocks: [
          {
            heading: "Esempio conversione durata",
            bullets: ["2:00 = 120", "0:35 = 35", "3:12 = 192"],
          },
          {
            heading: "Esempio riga All.1",
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
          "TBD va bene solo nei campi testuali dove ha senso.",
          "Mai nella durata: deve essere un numero intero in secondi.",
          "Non cambiare i nomi dei fogli. Non rompere le formule.",
          'Se usi brani preesistenti, inserisci titolo e autore reali, non "track 3".',
        ],
      },
      {
        title: "Cosa determina che la musica venga pagata",
        bullets: [
          "Ogni brano originale deve essere depositato correttamente a SIAE (titolo, autori, eventuale editore, quote in percentuale).",
          "Prima di compilare l'Allegato 1, verifica i dati nel Repertorio (titolo, autori, editore, codici).",
          "Il cue list deve usare gli stessi nomi del deposito, non varianti creative.",
        ],
      },
      {
        title: "Invio (blindato)",
        paragraphs: ["Il modello va trasmesso dal produttore esclusivamente via PEC."],
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
      {
        title: "Massimizzare i compensi (senza fantasia)",
        ordered: true,
        bullets: [
          "Deposita le opere musicali in SIAE con titoli coerenti al cue list e quote corrette (percentuali nei depositi).",
          "Verifica nel Repertorio SIAE che titolo, autori, editore siano corretti prima dell'invio del Mod. 109.",
          "Bonus: esistono richieste SIAE di \"maggiorazione\" e \"provvidenze\" per musiche da film. Non e' automatico ne' garantito, ma se hai i requisiti e' una leva concreta.",
        ],
        blocks: [
          {
            heading: "Link moduli (nei moduli SIAE)",
            paragraphs: [
              <>
                Moduli SIAE (Deposito Opere Audiovisive):{" "}
                <a href={moduliUrl} target="_blank" rel="noreferrer">
                  Moduli SIAE
                </a>
                .
              </>,
            ],
            bullets: [
              "Domanda di attribuzione della maggiorazione per opere musicali composte per film, telefilm e opere drammatiche.",
              "Domanda di attribuzione delle provvidenze per opere musicali inserite nelle colonne sonore di film di produzione o coproduzione italiana.",
              "Domanda di attribuzione delle provvidenze per l'identita' culturale italiana.",
            ],
          },
        ],
      },
    ],
    footer: {
      heading: "Footer breve",
      lines: [
        "Se vuoi, posso fornire alla produzione un file All.1 gia' pronto con titoli e durate in secondi, cosi' devono solo copiare e inviare via PEC.",
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
    title: "SIAE Guide. Mod. 109 and Mod. 109TF (music program for audiovisual works)",
    subtitle:
      "For productions and directors. Simple, correct completion, without errors that block or divert royalties.",
    intro: [],
    highlight: {
      heading: "First rule",
      lines: [
        <>
          Always use the latest official SIAE forms. Moduli SIAE page (Deposito
          Opere Audiovisive: Mod. 109 and Mod. 109TF):{" "}
          <a href={moduliUrl} target="_blank" rel="noreferrer">
            {moduliUrl}
          </a>
          .
        </>,
        <>
          Video cinema-tv SIAE page (same forms linked in the video context):{" "}
          <a href={videoCinemaTvUrl} target="_blank" rel="noreferrer">
            {videoCinemaTvUrl}
          </a>
          .
        </>,
        <>
          Convenience copy (optional, may be out of date):{" "}
          <a href={driveUrl} target="_blank" rel="noreferrer">
            Drive folder
          </a>
          .
        </>,
        "If you use an old Drive or a template saved months ago, you risk filling the wrong fields.",
      ],
    },
    sections: [
      {
        title: "Quick checklist (10 minutes)",
        ordered: true,
        bullets: [
          "Choose the form: Mod. 109 (cinema) or Mod. 109TF (TV and/or Video On Demand).",
          "Fill in the \"Declaration\" sheet with confirmed data.",
          "Fill in the \"Annex 1 - List of compositions\" sheet with ALL the tracks used in the work.",
          "Make sure durations are whole seconds.",
          "Export and send via PEC in Excel or digital PDF (not scanned) to MUSIC.COPYRIGHT.REPERTOIRE@PEC.SIAE.IT.",
          "Archive: Final file sent. PEC acceptance receipt. PEC delivery receipt.",
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
        title: "How to fill \"Declaration\" (only what matters)",
        paragraphs: ["Typical fields:"],
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
          "How to fill \"Annex 1 - List of compositions\" (this is what decides royalties)",
        paragraphs: ["In Annex 1 you must enter one row per track:"],
        bullets: [
          "Scene order number (progressive number).",
          "Title of the composition (as filed in the deposit, if already deposited).",
          "Composer (and arranger only for public domain works).",
          "Publisher (if any, otherwise leave blank).",
          "Duration in seconds (whole number only, no text).",
        ],
        blocks: [
          {
            heading: "Example duration conversion",
            bullets: ["2:00 = 120", "0:35 = 35", "3:12 = 192"],
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
          "TBD is only for text fields where it makes sense.",
          "Never in duration: it must be a whole number in seconds.",
          "Do not rename the sheets. Do not break the formulas.",
          'If you use pre-existing tracks, enter the real title and author, not "track 3".',
        ],
      },
      {
        title: "What determines whether music gets paid",
        bullets: [
          "Every original track must be correctly deposited with SIAE (title, authors, publisher if any, percentage splits).",
          "Before filling Annex 1, verify the data in the Repertoire (title, authors, publisher, codes).",
          "The cue list must use the same names as the deposit, not creative variants.",
        ],
      },
      {
        title: "Submission (locked down)",
        paragraphs: ["The form must be submitted by the producer exclusively via PEC."],
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
      {
        title: "Maximize royalties (no hype)",
        ordered: true,
        bullets: [
          "Deposit the musical works with SIAE using titles consistent with the cue list and correct splits (percentages in deposits).",
          "Check in the SIAE Repertoire that title, authors, publisher are correct before sending Mod. 109.",
          "Bonus: there are SIAE requests for \"maggiorazione\" and \"provvidenze\" for film music. It is not automatic or guaranteed, but if you meet the requirements it is a real lever.",
        ],
        blocks: [
          {
            heading: "Forms link (within SIAE forms)",
            paragraphs: [
              <>
                SIAE forms (Deposito Opere Audiovisive):{" "}
                <a href={moduliUrl} target="_blank" rel="noreferrer">
                  SIAE forms
                </a>
                .
              </>,
            ],
            bullets: [
              "Domanda di attribuzione della maggiorazione per opere musicali composte per film, telefilm e opere drammatiche.",
              "Domanda di attribuzione delle provvidenze per opere musicali inserite nelle colonne sonore di film di produzione o coproduzione italiana.",
              "Domanda di attribuzione delle provvidenze per l'identita' culturale italiana.",
            ],
          },
        ],
      },
    ],
    footer: {
      heading: "Footer",
      lines: [
        "If you want, I can provide the production with an All.1 file already filled with titles and durations in seconds, so they only need to copy and send via PEC.",
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
              {section.blocks.map((block, blockIndex) => (
                <div key={`${block.heading}-${blockIndex}`}>
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
