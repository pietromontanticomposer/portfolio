import type { Metadata } from "next";
import Link from "next/link";
import ContactPopover from "../components/ContactPopover";
import ShowreelSection from "../components/ShowreelSection";
import AudiencePaths from "../components/AudiencePaths";
import AutoScrollStrip from "../components/AutoScrollStrip";
import MediaPreload from "../components/MediaPreload";
import ChiSonoSection from "../components/ChiSonoSection";
import CollaborationsSection from "../components/CollaborationsSection";
import { featuredProjects } from "../data/projects";
import { heroCredits, partners } from "../data/homeContent";
import { bioFull, bioQuote, bioStats, bioSkills } from "../data/bio";
import { comingSoonPosters } from "../data/placeholders";

export const metadata: Metadata = {
  title: "Pietro Montanti",
  description:
    "Composer for Film and Media. Music that supports edit, tension, and character.",
  openGraph: {
    title: "Pietro Montanti",
    description:
      "Composer for Film and Media. Music that supports edit, tension, and character.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pietro Montanti",
    description:
      "Composer for Film and Media. Music that supports edit, tension, and character.",
  },
};

// Use pre-computed featured projects (avoids runtime filter on full projects array)
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

const posters = [...selectedPosterTiles, ...comingSoonStrip];

const PORTRAIT_SRC = "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/foto-sito.jpg";

export default function Home() {
  const preloadImages = [
    ...posters.map((p) => p.image).filter(Boolean),
  ] as string[];
  const showreelEmbedUrl =
    process.env.NEXT_PUBLIC_SHOWREEL_EMBED_URL ??
    "/uploads/video/_hls/Showreel Sito New/index.m3u8";
  const resolvedSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  const siteUrl = resolvedSiteUrl ?? "http://localhost:3000";

  if (!resolvedSiteUrl && process.env.NODE_ENV !== "production") {
    console.warn(
      "NEXT_PUBLIC_SITE_URL is not set. Using http://localhost:3000 for structured data."
    );
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Pietro Montanti",
      url: siteUrl,
      description:
        "Composer for Film and Media. Music that supports edit, tension, and character.",
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Pietro Montanti",
      jobTitle: "Composer for Film and Media",
      url: siteUrl,
      description: "Music that supports edit, tension, and character.",
    },
  ];

  return (
    <div className="relative min-h-screen page-root">
      <MediaPreload images={preloadImages} />
      <div className="pointer-events-none absolute inset-0 grain z-10" />
      <div className="pointer-events-none absolute -top-40 right-[-80px] h-96 w-96 rounded-full bg-[color:var(--accent)]/20 blur-3xl float z-10 max-lg:right-0 max-lg:h-[70vw] max-lg:w-[70vw]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-120px] h-[30rem] w-[30rem] rounded-full bg-[color:var(--accent-2)]/70 blur-3xl z-10 max-lg:left-0 max-lg:h-[70vw] max-lg:w-[70vw]" />

      <main className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-12 lg:px-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className="relative z-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-20 text-center fade-in">
            <div className="hero-kicker">
              <span className="hero-kicker-line" aria-hidden="true" />
              <span className="hero-kicker-text">
                Original Scores · Sound Design · Narrative Music
              </span>
              <span className="hero-kicker-line" aria-hidden="true" />
            </div>
            <h1 className="display-name hero-title text-5xl leading-tight text-[color:var(--foreground)] sm:text-6xl lg:text-7xl">
              Pietro Montanti
            </h1>
            <p className="hero-subtitle mt-4 max-w-2xl mx-auto text-lg md:text-xl text-[color:var(--foreground)] font-semibold tracking-wide">
              Composer for Film and Media
            </p>
            <p className="hero-logline mt-3 max-w-2xl mx-auto text-sm md:text-base text-[color:var(--muted)]">
              Music that supports edit, tension, and character.
            </p>
            <div className="hero-actions">
              <a href="#showreel" className="hero-btn hero-btn-primary">
                Watch showreel
              </a>
              <ContactPopover
                buttonLabel="Contact"
                buttonClassName="hero-btn hero-btn-secondary"
                panelId="contact-popover-hero"
              />
            </div>
            <div className="hero-credits" aria-label="Credits">
              <span className="hero-credits-line" aria-hidden="true" />
              <p className="hero-credits-text">{heroCredits}</p>
              <span className="hero-credits-line" aria-hidden="true" />
            </div>
          </div>
        </header>

        <ShowreelSection
          embedUrl={showreelEmbedUrl}
          previewImage="/showreel-preview.jpg"
        />

        <AudiencePaths />

        <section className="card-shell p-6 sm:p-8">
          <div className="section-header flex items-center justify-between">
            <h3 className="section-title text-2xl text-[color:var(--foreground)]">Case Studies</h3>
          </div>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Scene-by-scene breakdowns: goals, key moments, options tested, and delivery.
          </p>
          <div className="mt-4">
            <a href="/case-studies" className="hero-btn hero-btn-secondary">
              View case studies
            </a>
          </div>
        </section>

        <section id="selected-work" className="card-shell p-6 sm:p-8">
          <div className="section-header flex items-center justify-between">
            <h3 className="section-title text-2xl text-[color:var(--foreground)]">
              Selected Work
            </h3>
          </div>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Curated highlights. Full list in Portfolio.
          </p>
          <AutoScrollStrip posters={posters} />
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
            <Link
              href="/portfolio"
              className="text-sm text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
            >
              View all projects
            </Link>
          </div>
        </section>

        <ChiSonoSection
          id="about"
          imageSrc={PORTRAIT_SRC}
          bio={bioFull}
          quote={bioQuote}
          stats={bioStats}
          skills={bioSkills}
        />

        <CollaborationsSection partners={partners} />

      </main>
    </div>
  );
}
