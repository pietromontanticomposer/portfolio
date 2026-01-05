import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CaseStudiesAccordion from "../../components/CaseStudiesAccordion";
import CaseStudyVideo from "../../components/CaseStudyVideo";
import ContactPopover from "../../components/ContactPopover";
import CaseStudyDuration from "../../components/CaseStudyDuration";
import LazyIframe from "../../components/LazyIframe";
import TrackPlayerClient from "../../components/TrackPlayerClient";
import { caseStudiesNormalized, type CaseStudy } from "../../data/caseStudies";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "What was asked, what I chose, what changed in the scene.",
};

const claudioRePosterSrc = "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/posters/poster%20claudio%20re.avif";
const claudioReHref = "/portfolio/claudio-re";

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

  const lower = trimmedUrl.toLowerCase();
  const isHls = lower.endsWith(".m3u8") || trimmedUrl.includes("/_hls/");
  const isMp4 = lower.endsWith(".mp4") || lower.includes(".mp4");
  const src = trimmedUrl; // URLs are already encoded from blob storage
  const mp4Fallback =
    trimmedUrl.startsWith("/uploads/video/_hls/") && trimmedUrl.endsWith("/index.m3u8")
      ? trimmedUrl
          .replace("/uploads/video/_hls/", "/uploads/video/")
          .replace("/index.m3u8", ".mp4")
      : null;
  // Don't auto-derive poster, use explicit posterImage from case study data
  const posterUrl = null;

  // If the embed is a direct mp4 URL, provide isMp4 so caller can render a native video tag.
  return { isHls, isMp4, src, mp4Fallback, posterUrl } as const;
}

function MediaBlock({ item }: { item: CaseStudy }) {
  const { isHls, src, mp4Fallback, isMp4 } = getMediaSources(item.embedUrl);
  // debug: log embedUrl and detected types during SSR to diagnose rendering path
  if (typeof window === "undefined") {
    // eslint-disable-next-line no-console
    console.log("[media-debug] embedUrl:", item.embedUrl, "->", { isHls, isMp4, src, mp4Fallback });
  }

  if (!src) {
    return (
      <div className="rounded-2xl card-inset p-4 text-sm text-[color:var(--muted)]">
        Embed URL not set yet. Paste the HLS playlist (.m3u8) or Vimeo/YouTube embed URL in data/caseStudies.ts (embedUrl).
      </div>
    );
  }

  // If the source is an HLS playlist, render the HLS player; if it's a plain MP4, render a native video tag.
  const maybeMp4 = (getMediaSources(item.embedUrl) as any).isMp4 as boolean | undefined;
  if (maybeMp4) {
    return (
      <div>
        <div className="video-wrapper">
          <video
            className="case-study-video absolute inset-0 h-full w-full rounded-xl"
            controls
            playsInline
            preload="metadata"
            poster={item.posterImage || undefined}
            aria-label={`${item.title} clip`}
          >
            <source src={src ?? undefined} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
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
            poster={item.posterImage}
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
    <div className="relative aspect-video overflow-hidden rounded-2xl card-inset">
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
        <CaseStudyDuration embedUrl={item.embedUrl} />
      </div>
    </div>
  );
}

function CaseStudyCard({
  item,
  showClaudioRePoster,
}: {
  item: CaseStudy;
  showClaudioRePoster?: boolean;
}) {
  const videoAnchorId = `video-${item.id}`;
  const musicalLanguage = (item.musicalLanguage ?? item.musicChoices)?.trim();
  const trackTitle = item.trackTitle?.trim();

  return (
    <details
      className="card-shell group overflow-hidden case-study-card"
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
              <CaseStudyDuration embedUrl={item.embedUrl} />
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
                  “{trackTitle}”
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

          {item.id === "la-sonata-del-chaos-mothers-tale-banshee" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: The Mother&apos;s Tale
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/musiche-la-sonata-del-caos/The-Mothers-Tale-alt.mp3",
                      context: "The Mother's Tale"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20la%20sonata%20del%20caos.webp"
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

          {item.id === "scene-05" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: A Close Encounter in the Wood
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20la%20sonata%20del%20caos/A%20Close%20Encounter%20In%20The%20Wood.mp3",
                      context: "A Close Encounter in the Wood"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20la%20sonata%20del%20caos.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-04" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: Talia&apos;s Farewell
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20la%20sonata%20del%20caos/Talias%20Farewell.mp3",
                      context: "Talia's Farewell"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20la%20sonata%20del%20caos.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "claudio-re-opening-titles-storm-theme" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: The Storm
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20claudio%20re/The%20Storm.mp3",
                      context: "The Storm"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-08" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: My Sin Is Rotten
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20claudio%20re/My%20Sin%20Is%20Rotten.mp3",
                      context: "My Sin Is Rotten"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-09" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: My Crown, My Ambition, My Queen
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20claudio%20re/My%20Crown%2C%20My%20Ambition%2C%20My%20Queen.mp3",
                      context: "My Crown, My Ambition, My Queen"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-07" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: The Spectre
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20claudio%20re/The%20Spectre.mp3",
                      context: "The Spectre"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-10" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: What If A Man Can&apos;t Regret
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20claudio%20re/What%20If%20A%20Man%20Can%27t%20Regret.mp3",
                      context: "What If A Man Can't Regret"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "i-veneti-antichi-battle-with-the-spartans" ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: The Battle
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/tracks/musiche-i-veneti-antichi/The-Battle.mp3",
                      context: "The Battle"
                    }
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/copertina%20album/copertina%20i%20veneti%20antichi.png"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}
        </div>

        {showClaudioRePoster ? (
          <section className="mt-6 rounded-2xl card-inset p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] md:items-center">
              <div className="flex flex-col gap-4 text-left">
                <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--muted)]">
                  Per maggiori info sul corto
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <ContactPopover
                    buttonLabel="Contact"
                    buttonClassName="hero-btn hero-btn-primary min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
                    panelId={`contact-popover-${item.id}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href={claudioReHref}
                  className="group relative overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-inset-bg)] p-3 shadow-[0_18px_45px_var(--shadow)] transition hover:border-[color:rgba(255,255,255,0.3)] hover:shadow-[0_22px_55px_var(--shadow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
                  aria-label="View Claudio Re case study"
                >
                  <Image
                    src={claudioRePosterSrc}
                    alt="Claudio Re poster"
                    width={400}
                    height={600}
                    className="h-auto w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    sizes="(max-width: 640px) 100vw, 400px"
                  />
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ContactPopover
              buttonLabel="Contact"
              buttonClassName="hero-btn hero-btn-secondary min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
              panelId={`contact-popover-${item.id}`}
            />
          </div>
        )}
      </div>
    </details>
  );
}

export default function CaseStudiesPage() {
  const lastFiveStartIndex = Math.max(caseStudiesNormalized.length - 5, 0);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:px-20">
      <header className="max-w-3xl">
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          Case Studies
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
          What was asked, what I chose, what changed in the scene.
        </p>
      </header>

      <section className="space-y-6" aria-label="Case studies">
        <CaseStudiesAccordion className="case-studies-grid grid gap-6 md:grid-cols-2">
          {caseStudiesNormalized.map((item, index) => (
            <CaseStudyCard
              key={item.id}
              item={item}
              showClaudioRePoster={index >= lastFiveStartIndex}
            />
          ))}
        </CaseStudiesAccordion>
      </section>
    </main>
  );
}
