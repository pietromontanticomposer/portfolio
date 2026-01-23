"use client";

import StripToggle from "../../components/StripToggle";
import { projects } from "../../data/projects";
import { useLanguage } from "../../lib/LanguageContext";

const activeProjects = projects.filter((p) => !p.isDraft);
const posters = activeProjects
  .map((p) => ({
    slug: p.slug,
    title: p.title,
    year: p.year,
    tag: p.tag || "Poster",
    image: p.image,
    href: `/portfolio/${p.slug}`,
  }))
  .filter((poster): poster is typeof poster & { image: string } => Boolean(poster.image));

export default function ProjectsPage() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <header>
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          {t("Progetti", "Projects")}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          {t("Lista completa dei progetti e poster selezionati.", "Full list of projects and curated poster work.")}
        </p>
      </header>

      <section className="w-full overflow-visible">
        <StripToggle posters={posters} />
      </section>
    </main>
  );
}
