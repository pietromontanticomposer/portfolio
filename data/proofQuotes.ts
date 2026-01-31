export type ProofQuote = {
  quote: string;
  attribution: readonly string[];
};

export const proofQuoteAttribution = [
  "Tommaso Giusto",
  "Director & Producer",
  "Akeron Film",
  "Project: I Veneti antichi",
] as const;

export const proofQuotes: ProofQuote[] = [
  {
    quote:
      "\"Meeting Pietro was crucial, without him we would never have been able to accomplish it.\"",
    attribution: proofQuoteAttribution,
  },
  {
    quote: "\"We got along very well with Pietro’s workflow.\"",
    attribution: proofQuoteAttribution,
  },
  {
    quote:
      "\"Pietro is an excellent choice and an important partner for a complex project.\"",
    attribution: proofQuoteAttribution,
  },
];
