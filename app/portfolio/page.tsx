"use client";

import { useState } from "react";
import PosterCard from "../../components/PosterCard";
import AutoScrollStrip from "../../components/AutoScrollStrip";
import CollaborationsSection from "../../components/CollaborationsSection";
import TrackPlayerSection from "../../components/TrackPlayerSection";
import { projects } from "../../data/projects";
import { comingSoonPosters } from "../../data/placeholders";
import { partners, selectedTracks } from "../../data/homeContent";
import { useLanguage } from "../../lib/LanguageContext";

const normalizeTitle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, "");
const isComingSoonProject = (tag?: string, year?: string | number) =>
  [tag, year].filter(Boolean).some((value) => String(value).toLowerCase().includes("coming"));
const projectTitles = new Set(projects.map((p) => normalizeTitle(p.title)));
const comingSoonByTitle = new Map(comingSoonPosters.map((p) => [normalizeTitle(p.title), p]));
const postersFromProjects = projects.map((p) => {
  const comingSoonPoster = comingSoonByTitle.get(normalizeTitle(p.title));
  const isComingSoon = isComingSoonProject(p.tag, (p as { year?: string | number }).year);
  return {
    slug: p.slug,
    title: isComingSoon && comingSoonPoster?.title ? comingSoonPoster.title : p.title,
    year: (p as { year?: string }).year ?? '',
    tag: p.tag || comingSoonPoster?.tag || "Poster",
    image: p.image ?? comingSoonPoster?.image,
    href: `/portfolio/${p.slug}`,
  };
}).filter((poster): poster is typeof poster & { image: string } => Boolean(poster.image));

const posters = [
  ...postersFromProjects,
  ...comingSoonPosters
    .filter((p) => !projectTitles.has(normalizeTitle(p.title)))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      year: (p as { year?: string }).year ?? '',
      tag: p.tag || "Poster",
      image: p.image,
      href: undefined,
    }))
    .filter((poster): poster is typeof poster & { image: string } => Boolean(poster.image)),
];

export default function PortfolioPage() {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const { t } = useLanguage();

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:px-20">
      <header>
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          {t("Portfolio", "Portfolio")}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          {t("Lavori in evidenza e lista completa dei progetti.", "Curated highlights and full project list.")}
        </p>
      </header>

      <section id="selected-work" className="card-shell p-6 sm:p-8">
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            {t("Lavori selezionati", "Selected Work")}
          </h3>
        </div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t("Lavori in evidenza. Lista completa sotto.", "Curated highlights. Full list below.")}
        </p>
        <AutoScrollStrip posters={posters} />
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src="https://www.youtube.com/embed/uyxIoQIE-cM"
            title={t("Video", "Video")}
            width="100%"
            height="100%"
            frameBorder="0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{t("Ruolo: Arrangiatore", "Role: Arranger")}</p>
        <div className="mt-4">
          <button
            onClick={() => setShowAllProjects(!showAllProjects)}
            className="text-sm text-[color:var(--muted)] transition hover:text-[color:var(--foreground)] underline"
          >
            {showAllProjects ? t("Nascondi tutti i progetti", "Hide all projects") : t("Vedi tutti i progetti", "View all projects")}
          </button>
        </div>
      </section>

      <TrackPlayerSection tracks={selectedTracks} />

      <CollaborationsSection partners={partners} />

      {showAllProjects && (
        <section id="all-projects" className="w-full overflow-visible">
          <div className="section-header flex items-center justify-between mb-6">
            <h3 className="section-title text-2xl text-[color:var(--foreground)]">
              {t("Tutti i progetti", "All Projects")}
            </h3>
          </div>
          <div className="poster-grid-gridview">
            {posters.map((poster) => (
              <div key={`${poster.slug}-${poster.year}-${poster.tag}`}>
                <PosterCard
                  title={poster.title}
                  year={poster.year}
                  tag={poster.tag}
                  image={poster.image}
                  href={poster.href}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
