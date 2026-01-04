import type { Metadata } from "next";
import StripToggle from "../../components/StripToggle";
import { projects } from "../../data/projects";
import { placeholderProjects } from "../../data/placeholders";

export const metadata: Metadata = {
  title: "Projects",
  description: "All projects and selected poster work by Pietro Montanti.",
  openGraph: {
    title: "Projects",
    description: "All projects and selected poster work by Pietro Montanti.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects",
    description: "All projects and selected poster work by Pietro Montanti.",
  },
};

const posters = projects.map((p, index) => {
  const fallback = placeholderProjects[index % placeholderProjects.length];
  return {
    slug: p.slug,
    title: p.title,
    year: p.year,
    tag: p.tag || "Poster",
    image: p.image || fallback.image,
  };
});

export default function ProjectsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <header>
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          Projects
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          Full list of projects and curated poster work.
        </p>
      </header>

      <section className="w-full overflow-visible">
        <StripToggle posters={posters} />
      </section>
    </main>
  );
}
