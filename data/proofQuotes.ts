type LocalizedText = {
  it: string;
  en: string;
};

export type ProofQuote = {
  quote: LocalizedText;
  attribution: readonly LocalizedText[];
};

export const proofQuoteAttribution = [
  { it: "Tommaso Giusto", en: "Tommaso Giusto" },
  { it: "Regista e produttore", en: "Director & Producer" },
  { it: "Akeron Film", en: "Akeron Film" },
  { it: "Progetto: I Veneti antichi", en: "Project: I Veneti antichi" },
] as const;

export const soggettoObsoletoAttribution = [
  { it: "Nicola Pegg", en: "Nicola Pegg" },
  { it: "Regista e produttore", en: "Director & Producer" },
  { it: "Progetto: Soggetto Obsoleto", en: "Project: Soggetto Obsoleto" },
] as const;

export const claudioReAttribution = [
  { it: "Marco Martini", en: "Marco Martini" },
  { it: "Regista e produttore", en: "Director & Producer" },
  { it: "Progetto: Claudio Re", en: "Project: Claudio Re" },
] as const;

export const proofQuotesLead = {
  quote: {
    it: "\"Credo che la colonna sonora sia il 50% di un film\"",
    en: "\"I believe the soundtrack is 50% of a film.\"",
  },
  attribution: { it: "George Lucas", en: "George Lucas" },
} as const;

export const proofQuotes: ProofQuote[] = [
  {
    quote: {
      it: "\"Incontrare Pietro è stato cruciale, senza di lui non saremmo mai riusciti a farlo.\"",
      en: "\"Meeting Pietro was crucial, without him we would never have been able to accomplish it.\"",
    },
    attribution: proofQuoteAttribution,
  },
  {
    quote: {
      it: "\"Ci siamo trovati molto bene con il workflow di Pietro.\"",
      en: "\"We got along very well with Pietro’s workflow.\"",
    },
    attribution: soggettoObsoletoAttribution,
  },
  {
    quote: {
      it: "\"Pietro è una scelta eccellente e un partner importante per un progetto complesso.\"",
      en: "\"Pietro is an excellent choice and an important partner for a complex project.\"",
    },
    attribution: claudioReAttribution,
  },
];

export const soggettoObsoletoExtraQuotes: ProofQuote[] = [
  {
    quote: {
      it: "\"Pietro ha capito subito la scena e ha consegnato cue che si incastravano nel montaggio con pochissime revisioni.\"",
      en: "\"Pietro understood the scene immediately and delivered cues that fit the edit with minimal revisions.\"",
    },
    attribution: soggettoObsoletoAttribution,
  },
  {
    quote: {
      it: "\"Comunicazione rapida e precisa, consegna organizzata e puntuale.\"",
      en: "\"Fast, precise communication and an organized, on-time delivery.\"",
    },
    attribution: soggettoObsoletoAttribution,
  },
];

export const proofQuotesByProjectSlug: Record<string, ProofQuote[]> = {
  "i-veneti-antichi": [proofQuotes[0]],
  "soggetto-obsoleto": [proofQuotes[1], ...soggettoObsoletoExtraQuotes],
  "claudio-re": [proofQuotes[2]],
};

export const proofQuotesByCaseStudyId: Record<string, ProofQuote[]> = {
  "i-veneti-antichi-battle-with-the-spartans": [proofQuotes[0]],
  "soggetto-obsoleto-sitting-on-the-seashore": [
    proofQuotes[1],
    ...soggettoObsoletoExtraQuotes,
  ],
  "claudio-re-opening-titles-storm-theme": [proofQuotes[2]],
};

export const getProofQuotesForProjectSlug = (slug: string): ProofQuote[] =>
  proofQuotesByProjectSlug[slug] ?? [];

export const getProofQuotesForCaseStudyId = (id: string): ProofQuote[] =>
  proofQuotesByCaseStudyId[id] ?? [];
