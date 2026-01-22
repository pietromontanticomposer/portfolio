"use client";

import StripToggle from "../../components/StripToggle";
import { projects } from "../../data/projects";
import { comingSoonPosters } from "../../data/placeholders";
import { useLanguage } from "../../lib/LanguageContext";

const normalizeTitle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, "");
const isComingSoonProject = (tag?: string, year?: string | number) =>
  [tag, year].filter(Boolean).some((value) => String(value).toLowerCase().includes("coming"));
const projectTitles = new Set(projects.map((p) => normalizeTitle(p.title)));
const comingSoonByTitle = new Map(comingSoonPosters.map((p) => [normalizeTitle(p.title), p]));

const postersFromProjects = projects
  .map((p) => {
    const comingSoonPoster = comingSoonByTitle.get(normalizeTitle(p.title));
    const isComingSoon = isComingSoonProject(p.tag, (p as { year?: string | number }).year);
    return {
      slug: p.slug,
      title: isComingSoon && comingSoonPoster?.title ? comingSoonPoster.title : p.title,
      year: p.year,
      tag: p.tag || comingSoonPoster?.tag || "Poster",
      image: p.image ?? comingSoonPoster?.image,
      href: `/portfolio/${p.slug}`,
    };
  })
  .filter((poster): poster is typeof poster & { image: string } => Boolean(poster.image));

const posters = [
  ...postersFromProjects,
  ...comingSoonPosters
    .filter((p) => !projectTitles.has(normalizeTitle(p.title)))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      year: (p as { year?: string }).year ?? "",
      tag: p.tag || "Poster",
      image: p.image,
      href: undefined,
    }))
    .filter((poster): poster is typeof poster & { image: string } => Boolean(poster.image)),
];

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
