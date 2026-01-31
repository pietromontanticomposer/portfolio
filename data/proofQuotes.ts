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
