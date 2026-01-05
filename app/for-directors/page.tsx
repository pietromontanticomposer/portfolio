import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ContactPopover from "../../components/ContactPopover";
import CaseStudyVideo from "../../components/CaseStudyVideo";
import LazyIframe from "../../components/LazyIframe";
import CaseStudyDuration from "../../components/CaseStudyDuration";
import TrackPlayerClient from "../../components/TrackPlayerClient";
import CaseStudiesAccordion from "../../components/CaseStudiesAccordion";
import { caseStudiesNormalized, type CaseStudy } from "../../data/caseStudies";

export const metadata: Metadata = {
  title: "For Directors",
  description:
    "Director-led scoring for picture and performance. Fast A/B/C options, clean revisions, and post-ready delivery.",
  openGraph: {
    title: "For Directors",
    description:
      "Director-led scoring for picture and performance. Fast A/B/C options, clean revisions, and post-ready delivery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Directors",
    description:
      "Director-led scoring for picture and performance. Fast A/B/C options, clean revisions, and post-ready delivery.",
  },
};

const steps = [
  {
    title: "Spotting",
    detail:
      "Define cue in/out, hit points, and the scene's job, plus what to avoid.",
  },
  {
    title: "Options A/B/C",
    detail:
      "2–3 distinct directions on the same cut, so decisions stay fast and clean.",
  },
  {
    title: "Lock",
    detail:
      "Timing and intent approved first, then orchestration and mix without moving targets.",
  },
  {
    title: "Delivery",
    detail:
      "Organized exports and versions for post, with stems when needed.",
  },
];

const deliveryChecklist = [
  "Main stereo mix",
  "Dialogue-friendly alternate when needed",
  "Stems on request, clearly named",
  "Cue sheet timings for the cut",
  "One clean delivery folder, versioned",
];

function formatTimingEntry(entry: { time: string; label: string }) {
  const label = entry.label?.trim();
  return label ? `${entry.time} ${label}` : entry.time;
}

function parseDurationToSeconds(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const minutes = Number.parseInt(match[1], 10);
  const seconds = Number.parseInt(match[2], 10);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null;
  return minutes * 60 + seconds;
}

function getMediaSources(embedUrl?: string) {
  const trimmedUrl = embedUrl?.trim();
  if (!trimmedUrl) {
    return {
      isHls: false,
      src: null as string | null,
      mp4Fallback: null as string | null,
      posterUrl: null as string | null,
    };
  }

  const isHls = trimmedUrl.endsWith(".m3u8") || trimmedUrl.includes("/_hls/");
  const src = trimmedUrl; // URLs are already encoded from blob storage
  const mp4Fallback =
    trimmedUrl.startsWith("/uploads/video/_hls/") && trimmedUrl.endsWith("/index.m3u8")
      ? trimmedUrl
          .replace("/uploads/video/_hls/", "/uploads/video/")
          .replace("/index.m3u8", ".mp4")
      : null;
  const posterUrl = mp4Fallback ? mp4Fallback.replace(/\.mp4$/i, ".jpg") : null;

  return { isHls, src, mp4Fallback, posterUrl };
}

function MediaBlock({ item }: { item: CaseStudy }) {
  const { isHls, src, mp4Fallback } = getMediaSources(item.embedUrl);

  if (!src) {
    return (
      <div className="card-inset rounded-2xl p-4 text-sm text-[color:var(--muted)]">
        Embed URL not set yet. Paste the HLS playlist (.m3u8) or Vimeo/YouTube embed URL in data/caseStudies.ts (embedUrl).
      </div>
    );
  }

  if (isHls) {
    return (
      <div>
        <div className="video-wrapper">
          <CaseStudyVideo
            hlsUrl={src}
            mp4Url={mp4Fallback}
            title={`${item.title} clip`}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="video-wrapper">
        <LazyIframe
          src={src}
          title={`${item.title} clip`}
          height={360}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          autoLoad
          buttonLabel="Load clip"
        />
      </div>
    </div>
  );
}

function MediaThumbnail({ item }: { item: CaseStudy }) {
  const { posterUrl: generatedPosterUrl } = getMediaSources(item.embedUrl);
  const posterUrl = item.posterImage || generatedPosterUrl;

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-inset-bg)]">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={`${item.title} thumbnail`}
          fill
          className="absolute inset-0 h-full w-full object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="absolute inset-0 bg-[color:var(--card-inset-bg)]" />
      )}
      <div className="absolute inset-0 card-overlay" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div className="case-study-play-button flex h-12 w-12 items-center justify-center rounded-full">
          <svg className="h-5 w-5 text-white" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 3.5v9l7-4.5-7-4.5z" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3 right-3">
        <CaseStudyDuration duration={item.duration} />
      </div>
    </div>
  );
}

function CaseStudyCard({ item }: { item: CaseStudy }) {
  const videoAnchorId = `video-${item.id}`;
  const musicalLanguage = (item.musicalLanguage ?? item.musicChoices)?.trim();
  const trackTitle = item.trackTitle?.trim();

  return (
    <details
      className="group overflow-hidden case-study-card card-inset rounded-[20px]"
      suppressHydrationWarning
    >
      <summary className="cursor-pointer select-none list-none p-6 sm:p-8 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="section-title text-2xl text-[color:var(--foreground)]">
              {item.title}
            </h2>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              {item.projectLabel} · {item.sceneType} ·{" "}
                <CaseStudyDuration duration={item.duration} />
            </p>
          </div>
          <svg
            className="h-5 w-5 shrink-0 text-[color:var(--muted)] transition-transform group-open:rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="mt-4 group-open:hidden">
          <MediaThumbnail item={item} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={`${item.id}-${tag}`}
              className="rounded-full border border-[color:var(--card-border)] bg-[color:var(--card-inset-bg)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </summary>

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="section-divider mx-auto w-24" aria-hidden="true" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Goal</div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">{item.goal}</div>
          </div>

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Result</div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">{item.result}</div>
          </div>

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Delivery</div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">{item.delivered}</div>
          </div>
        </div>

        <div className="mt-6" id={videoAnchorId}>
          <div className="text-sm font-semibold text-[color:var(--foreground)]">Video</div>
          <div className="mt-3 overflow-hidden rounded-2xl">
            <MediaBlock item={item} />
          </div>
        </div>

        <div className="mt-6 grid gap-4">

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Context</div>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              {item.context}
            </p>
          </div>

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              Timing
            </div>
            <div className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <div>
                <span className="font-semibold text-[color:var(--foreground)]">In:</span>{" "}
                {formatTimingEntry(item.timing.in)}
              </div>
              {item.timing.turn ? (
                <div>
                  <span className="font-semibold text-[color:var(--foreground)]">Shift:</span>{" "}
                  {formatTimingEntry(item.timing.turn)}
                </div>
              ) : null}
              <div>
                <span className="font-semibold text-[color:var(--foreground)]">Out:</span>{" "}
                {formatTimingEntry(item.timing.out)}
              </div>
            </div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              <span className="font-semibold text-[color:var(--foreground)]">Note:</span>{" "}
              {item.spottingNote ?? "Enters to support the scene without getting in the way."}
            </div>
          </div>

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Brief</div>
            <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)]">
              <div>
                <span className="font-semibold text-[color:var(--foreground)]">Wanted:</span>{" "}
                {item.directorWanted}
              </div>
              <div>
                <span className="font-semibold text-[color:var(--foreground)]">Avoid:</span>{" "}
                {item.directorAvoid}
              </div>
            </div>
          </div>

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Direction</div>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <li><span className="font-semibold text-[color:var(--foreground)]">A:</span> {item.versionsTested.A}</li>
              <li><span className="font-semibold text-[color:var(--foreground)]">B:</span> {item.versionsTested.B}</li>
              <li><span className="font-semibold text-[color:var(--foreground)]">C:</span> {item.versionsTested.C}</li>
            </ul>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              <span className="font-semibold text-[color:var(--foreground)]">Final choice:</span>{" "}
              {item.finalChoice}
            </div>
          </div>

          {musicalLanguage || trackTitle ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Musical language
              </div>
              {musicalLanguage ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[color:var(--muted)]">
                  {musicalLanguage}
                </p>
              ) : null}
              {trackTitle ? (
                <div className="mt-3 text-sm text-[color:var(--muted)]">
                  <span className="font-semibold text-[color:var(--foreground)]">Track:</span>{" "}
                  &ldquo;{trackTitle}&rdquo;
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              Technical notes (post)
            </div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              <ul className="list-disc space-y-1 pl-5">
                {item.technicalNotes.map((line) => (
                  <li key={`${item.id}-${line}`}>{line}</li>
                ))}
              </ul>
            </div>
          </div>

          {item.id === "soggetto-obsoleto-sitting-on-the-seashore" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: Sitting on the Seashore
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20soggetto%20obsoleto/Sitting%20On%20The%20Seashore.mp3",
                      context: "Sitting on the Seashore"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20soggetto%20obsoleto.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-03" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: Something Threatening
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/tracks/musiche%20la%20sonata%20del%20caos/Something%20Threatening.mp3",
                      context: "Something Threatening"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20la%20sonata%20del%20caos.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ContactPopover
            buttonLabel="Contact"
            buttonClassName="hero-btn hero-btn-secondary min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
            panelId={`contact-popover-${item.id}`}
          />
        </div>
      </div>
    </details>
  );
}

export default function ForDirectorsPage() {
  // Get first two case studies
  const featuredCaseStudies = caseStudiesNormalized.slice(0, 2);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <section className="card-shell p-8">
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          For Directors
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          I score to picture, performance, and point of view. You get fast
          A/B/C options early, clear revision passes, and cues that support your
          cut without competing with it.
        </p>
        <div className="mt-6">
          <ContactPopover
            buttonLabel="Contact"
            buttonClassName="hero-btn hero-btn-primary"
            panelId="contact-popover-directors-hero"
          />
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          How I work
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="card-inset rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          Delivery ready for post
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
          {deliveryChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          Scene case studies
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Scene-by-scene breakdowns: goals, key moments, options tested, and delivery.
        </p>
        <div className="mt-6">
          <CaseStudiesAccordion className="case-studies-grid grid gap-6 md:grid-cols-2">
            {featuredCaseStudies.map((item) => (
              <CaseStudyCard key={item.id} item={item} />
            ))}
          </CaseStudiesAccordion>
        </div>
        <div className="mt-6">
          <Link
            href="/case-studies"
            className="hero-btn hero-btn-secondary"
          >
            View all case studies
          </Link>
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          Ready to send a cut?
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Send the scene, your references, and what it must do. I will reply with
          options, timings, and next steps.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <ContactPopover
            buttonLabel="Contact"
            buttonClassName="hero-btn hero-btn-primary"
            panelId="contact-popover-directors-cta"
          />
        </div>
      </section>
    </main>
  );
}
