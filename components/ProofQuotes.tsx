"use client";

import type { ProofQuote } from "../data/proofQuotes";
import { useLanguage } from "../lib/LanguageContext";

type ProofQuotesProps = {
  quotes: ProofQuote[];
  heading?: string;
  variant?: "default" | "compact";
};

export default function ProofQuotes({ quotes, heading, variant = "default" }: ProofQuotesProps) {
  const { t, language } = useLanguage();
  const headingText = heading ?? t("Testimonianze", "Proof Quotes");
  const sectionPadding = variant === "compact" ? "p-5 sm:p-6" : "p-6 sm:p-8";
  const gridSpacing = variant === "compact" ? "mt-4 gap-4" : "mt-6 gap-6";
  const cardPadding = variant === "compact" ? "p-4 sm:p-5" : "p-5 sm:p-6";
  const gridCols =
    quotes.length >= 3 ? "md:grid-cols-3" : quotes.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1";
  const gridWidth =
    quotes.length === 1 ? "max-w-3xl" : quotes.length === 2 ? "max-w-5xl" : "max-w-full";
  const baseAttribution = quotes[0]?.attribution ?? [];
  const hasSharedAttribution =
    quotes.length > 1 &&
    quotes.every((quote) => quote.attribution.length === baseAttribution.length) &&
    quotes.every((quote) =>
      quote.attribution.every((line, index) => {
        const baseLine = baseAttribution[index];
        return baseLine?.it === line.it && baseLine?.en === line.en;
      })
    );

  return (
    <section className={`card-shell ${sectionPadding} text-left`}>
      {headingText ? (
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            {headingText}
          </h3>
        </div>
      ) : null}
      <div className={`${gridWidth} mx-auto`}>
        <div className={`grid ${gridSpacing} ${gridCols}`}>
          {quotes.map((quote) => (
            <figure
              key={quote.quote.en}
              className={`card-inset rounded-2xl ${cardPadding}`}
            >
              <blockquote className="text-sm leading-relaxed text-[color:var(--foreground)]">
                {language === "it" ? quote.quote.it : quote.quote.en}
              </blockquote>
              <figcaption
                className={`mt-4 text-xs text-[color:var(--muted)]${hasSharedAttribution ? " sr-only" : ""}`}
              >
                {quote.attribution.map((line, index) => (
                  <span
                    key={`${line.en}-${index}`}
                    className={index === 0 ? "block font-semibold text-[color:var(--foreground)]" : "block"}
                  >
                    {language === "it" ? line.it : line.en}
                  </span>
                ))}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      {hasSharedAttribution ? (
        <div className="mt-6 text-xs text-[color:var(--muted)]">
          {baseAttribution.map((line, index) => (
            <span
              key={`${line.en}-${index}`}
              className={index === 0 ? "block font-semibold text-[color:var(--foreground)]" : "block"}
            >
              {language === "it" ? line.it : line.en}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
