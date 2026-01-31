"use client";

import type { ProofQuote } from "../data/proofQuotes";
import { useLanguage } from "../lib/LanguageContext";

type ProofQuotesProps = {
  quotes: ProofQuote[];
  heading?: string;
  variant?: "default" | "compact";
};

export default function ProofQuotes({ quotes, heading, variant = "default" }: ProofQuotesProps) {
  const { t } = useLanguage();
  const headingText = heading ?? t("Testimonianze", "Proof Quotes");
  const sectionPadding = variant === "compact" ? "p-5 sm:p-6" : "p-6 sm:p-8";
  const gridSpacing = variant === "compact" ? "mt-4 gap-4" : "mt-6 gap-6";
  const cardPadding = variant === "compact" ? "p-4 sm:p-5" : "p-5 sm:p-6";

  return (
    <section className={`card-shell ${sectionPadding} text-left`}>
      {headingText ? (
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            {headingText}
          </h3>
        </div>
      ) : null}
      <div className={`grid ${gridSpacing} md:grid-cols-3`}>
        {quotes.map((quote) => (
          <figure key={quote.quote} className={`card-inset rounded-2xl ${cardPadding}`}>
            <blockquote className="text-sm leading-relaxed text-[color:var(--foreground)]">
              {quote.quote}
            </blockquote>
            <figcaption className="mt-4 text-xs text-[color:var(--muted)]">
              {quote.attribution.map((line, index) => (
                <span
                  key={`${line}-${index}`}
                  className={index === 0 ? "block font-semibold text-[color:var(--foreground)]" : "block"}
                >
                  {line}
                </span>
              ))}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
