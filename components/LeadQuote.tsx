"use client";

import type { ProofQuote } from "../data/proofQuotes";
import { useLanguage } from "../lib/LanguageContext";

type LeadQuoteProps = {
  quote: ProofQuote["quote"];
  attribution: ProofQuote["attribution"][number];
};

export default function LeadQuote({ quote, attribution }: LeadQuoteProps) {
  const { language } = useLanguage();
  const quoteText = language === "it" ? quote.it : quote.en;
  const attributionText = language === "it" ? attribution.it : attribution.en;

  return (
    <section className="max-w-4xl text-left">
      <figure className="border-l-2 border-[color:var(--accent)] pl-5 py-2">
        <blockquote className="text-xl sm:text-2xl leading-relaxed text-[color:var(--foreground)]">
          {quoteText}
        </blockquote>
        <figcaption className="mt-4 text-xs uppercase tracking-wider text-[color:var(--muted)]">
          {attributionText}
        </figcaption>
      </figure>
    </section>
  );
}
