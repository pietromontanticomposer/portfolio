import type { Metadata } from "next";
import Link from "next/link";
import ContactPopover from "../components/ContactPopover";
import LazyShowreel from "../components/LazyShowreel";
import AudiencePaths from "../components/AudiencePaths";
import { heroCredits } from "../data/homeContent";

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

export default function Home() {
  const showreelEmbedUrl =
    process.env.NEXT_PUBLIC_SHOWREEL_EMBED_URL ??
    "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/Showreel%20Sito%20New/index.m3u8";
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
      <div className="pointer-events-none absolute inset-0 grain z-10" style={{ transform: 'translateZ(0)', contain: 'layout style paint' }} />
      <div className="pointer-events-none absolute -top-40 right-[-80px] h-96 w-96 rounded-full bg-[color:var(--accent)]/20 blur-3xl z-10 max-lg:right-0 max-lg:h-[70vw] max-lg:w-[70vw]" style={{ transform: 'translateZ(0)', contain: 'layout style paint' }} />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-120px] h-[30rem] w-[30rem] rounded-full bg-[color:var(--accent-2)]/70 blur-3xl z-10 max-lg:left-0 max-lg:h-[70vw] max-lg:w-[70vw]" style={{ transform: 'translateZ(0)', contain: 'layout style paint' }} />

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

        <LazyShowreel embedUrl={showreelEmbedUrl} />

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

        <section className="card-shell p-6 sm:p-8">
          <div className="section-header flex items-center justify-between">
            <h3 className="section-title text-2xl text-[color:var(--foreground)]">Portfolio</h3>
          </div>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Selected work, collaborations, and full project list.
          </p>
          <div className="mt-4">
            <Link href="/portfolio" className="hero-btn hero-btn-secondary">
              View portfolio
            </Link>
          </div>
        </section>

        <section className="card-shell p-6 sm:p-8">
          <div className="section-header flex items-center justify-between">
            <h3 className="section-title text-2xl text-[color:var(--foreground)]">About</h3>
          </div>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Bio, background, and approach to composing.
          </p>
          <div className="mt-4">
            <Link href="/about" className="hero-btn hero-btn-secondary">
              Learn more
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
