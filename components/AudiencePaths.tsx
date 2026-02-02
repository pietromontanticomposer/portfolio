"use client";

import Link from "next/link";
import { memo } from "react";
import { useLanguage } from "../lib/LanguageContext";

function AudiencePaths() {
  const { t } = useLanguage();

  return (
    <section className="w-full">
      <div className="card-shell p-6 sm:p-8">
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            {t("Come lavoro", "How I work")}
          </h3>
        </div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t("Un workflow. Due enfasi.", "One workflow. Two emphases.")}
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Link
            href="/for-directors"
            prefetch={false}
            className="group relative overflow-hidden card-inset rounded-2xl p-8 text-center transition hover:border-[color:rgba(255,255,255,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          >
            <span
              className="pointer-events-none absolute inset-0 card-overlay opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col gap-2">
              <span className="section-title text-2xl text-[color:var(--foreground)]">
                {t("Creativo", "Creative")}
              </span>
              <p className="text-sm text-[color:var(--muted)]">
                {t(
                  "Colonne sonore narrative-first con opzioni flessibili e revisioni rapide.",
                  "Narrative-first scoring with flexible options and fast revisions."
                )}
              </p>
            </div>
          </Link>
          <Link
            href="/for-producers"
            prefetch={false}
            className="group relative overflow-hidden card-inset rounded-2xl p-8 text-center transition hover:border-[color:rgba(255,255,255,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          >
            <span
              className="pointer-events-none absolute inset-0 card-overlay opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col gap-2">
              <span className="section-title text-2xl text-[color:var(--foreground)]">
                {t("Delivery", "Delivery")}
              </span>
              <p className="text-sm text-[color:var(--muted)]">
                {t(
                  "Stem organizzati, naming, versioning e export pronti per il cue.",
                  "Organized stems, naming, versioning and cue-ready exports."
                )}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default memo(AudiencePaths);
