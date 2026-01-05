"use client";

import { useState } from "react";
import PosterCard from "../../components/PosterCard";
import AutoScrollStrip from "../../components/AutoScrollStrip";
import CollaborationsSection from "../../components/CollaborationsSection";
import { projects, featuredProjects } from "../../data/projects";
import { comingSoonPosters } from "../../data/placeholders";
import { partners } from "../../data/homeContent";

const postersFromProjects = projects.map((p) => ({
  slug: p.slug,
  title: p.title,
  year: (p as { year?: string }).year ?? '',
  tag: p.tag || "Poster",
  image: p.image,
  href: `/portfolio/${p.slug}`,
})).filter((poster): poster is typeof poster & { image: string } => Boolean(poster.image));

const posters = [
  ...postersFromProjects,
  ...comingSoonPosters.map((p) => ({
    slug: p.slug,
    title: p.title,
    year: (p as { year?: string }).year ?? '',
    tag: p.tag || "Poster",
    image: p.image,
    href: `/portfolio/${p.slug}`,
  })).filter((poster): poster is typeof poster & { image: string } => Boolean(poster.image)),
];

// Selected work section data
const selectedProjects = featuredProjects.slice(0, 6);
const selectedPosterTiles = selectedProjects.map((project) => ({
  slug: project.slug,
  title: project.title,
  year: project.year,
  tag: project.tag,
  image: project.image,
  href: `/portfolio/${project.slug}`,
}));
const comingSoonStrip = comingSoonPosters.map((poster) => ({
  slug: poster.slug,
  title: poster.title,
  year: (poster as { year?: string }).year ?? '',
  tag: poster.tag,
  image: poster.image,
}));
const selectedWorkPosters = [...selectedPosterTiles, ...comingSoonStrip];

export default function PortfolioPage() {
  const [showAllProjects, setShowAllProjects] = useState(false);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <header>
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          Portfolio
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          Curated highlights and full project list.
        </p>
      </header>

      <section id="selected-work" className="card-shell p-6 sm:p-8">
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            Selected Work
          </h3>
        </div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Curated highlights. Full list below.
        </p>
        <AutoScrollStrip posters={selectedWorkPosters} />
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src="https://www.youtube.com/embed/uyxIoQIE-cM"
            title="Video"
            width="100%"
            height="100%"
            frameBorder="0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Role: Arranger</p>
        <div className="mt-4">
          <button
            onClick={() => setShowAllProjects(!showAllProjects)}
            className="text-sm text-[color:var(--muted)] transition hover:text-[color:var(--foreground)] underline"
          >
            {showAllProjects ? "Hide all projects" : "View all projects"}
          </button>
        </div>
      </section>

      <CollaborationsSection partners={partners} />

      {showAllProjects && (
        <section id="all-projects" className="w-full overflow-visible">
          <div className="section-header flex items-center justify-between mb-6">
            <h3 className="section-title text-2xl text-[color:var(--foreground)]">
              All Projects
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
