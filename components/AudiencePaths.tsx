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
            className="card-inset rounded-2xl p-8 text-center transition hover:-translate-y-[1px] hover:border-[color:rgba(255,255,255,0.26)] hover:bg-[color:rgba(5,8,14,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          >
            <span className="section-title text-2xl text-[color:var(--foreground)]">
              {t("Creativo", "Creative")}
            </span>
            <p className="text-sm text-[color:var(--muted)]">
              {t(
                "Colonne sonore narrative-first con opzioni flessibili e revisioni rapide.",
                "Narrative-first scoring with flexible options and fast revisions."
              )}
            </p>
          </Link>
          <Link
            href="/for-producers"
            prefetch={false}
            className="card-inset rounded-2xl p-8 text-center transition hover:-translate-y-[1px] hover:border-[color:rgba(255,255,255,0.26)] hover:bg-[color:rgba(5,8,14,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          >
            <span className="section-title text-2xl text-[color:var(--foreground)]">
              {t("Delivery", "Delivery")}
            </span>
            <p className="text-sm text-[color:var(--muted)]">
              {t(
                "Stem organizzati, naming, versioning e export pronti per il cue.",
                "Organized stems, naming, versioning and cue-ready exports."
              )}
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default memo(AudiencePaths);
