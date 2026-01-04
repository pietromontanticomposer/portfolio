"use client";

import Link from "next/link";

export default function AudiencePaths() {
  return (
    <section className="w-full">
      <div className="card-shell p-6 sm:p-8">
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            How I work
          </h3>
        </div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          One workflow. Two emphases.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Link
            href="/for-directors"
            className="card-inset rounded-2xl p-8 flex flex-col gap-2 text-center transition hover:brightness-110"
          >
            <span className="section-title text-2xl text-[color:var(--foreground)]">
              Creative
            </span>
            <p className="text-sm text-[color:var(--muted)]">
              Narrative-first scoring with flexible options and fast revisions.
            </p>
          </Link>
          <Link
            href="/for-producers"
            className="card-inset rounded-2xl p-8 flex flex-col gap-2 text-center transition hover:brightness-110"
          >
            <span className="section-title text-2xl text-[color:var(--foreground)]">
              Delivery
            </span>
            <p className="text-sm text-[color:var(--muted)]">
              Organized stems, naming, versioning and cue-ready exports.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
