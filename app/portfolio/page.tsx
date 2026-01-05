import type { Metadata } from "next";
import PosterCard from "../../components/PosterCard";
import { projects } from "../../data/projects";
import { comingSoonPosters } from "../../data/placeholders";

export const metadata: Metadata = {
  title: "Portfolio",
};

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

export default function PortfolioPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <header>
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          Portfolio
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          Full list of projects and curated poster work.
        </p>
      </header>

      <section className="w-full overflow-visible">
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
    </main>
  );
}
