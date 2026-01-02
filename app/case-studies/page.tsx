import type { Metadata } from "next";
import CaseStudiesAccordion from "../../components/CaseStudiesAccordion";
import CaseStudyVideo from "../../components/CaseStudyVideo";
import ContactPopover from "../../components/ContactPopover";
import LazyIframe from "../../components/LazyIframe";
import TrackPlayerClient from "../../components/TrackPlayerClient";
import { caseStudies, type CaseStudy } from "../../data/caseStudies";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "What was asked, what I chose, what changed in the scene.",
};

function TagPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
      {label}
    </span>
  );
}

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

function MediaBlock({ item }: { item: CaseStudy }) {
  const trimmedUrl = item.embedUrl?.trim();

  if (!trimmedUrl || trimmedUrl.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[color:var(--muted)]">
        Embed URL not set yet. Paste the HLS playlist (.m3u8) or Vimeo/YouTube embed URL in data/caseStudies.ts (embedUrl).
      </div>
    );
  }

  const isHls = trimmedUrl.endsWith(".m3u8") || trimmedUrl.includes("/_hls/");
  const src = trimmedUrl.startsWith("/") ? encodeURI(trimmedUrl) : trimmedUrl;
  const mp4Fallback =
    trimmedUrl.startsWith("/uploads/video/_hls/") && trimmedUrl.endsWith("/index.m3u8")
      ? trimmedUrl
          .replace("/uploads/video/_hls/", "/uploads/video/")
          .replace("/index.m3u8", ".mp4")
      : null;

  if (isHls) {
    return (
      <div>
        <div className="card-shell p-4">
          <div className="video-wrapper">
            <CaseStudyVideo
              hlsUrl={src}
              mp4Url={mp4Fallback}
              title={`${item.title} clip`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card-shell p-4">
        <div className="video-wrapper">
          <LazyIframe
            src={src}
            title={`${item.title} clip`}
            height={360}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            autoLoad={false}
            buttonLabel="Load clip"
          />
        </div>
      </div>
    </div>
  );
}

function CaseStudyCard({ item }: { item: CaseStudy }) {
  const hasResult = item.result && item.result.trim().length > 0;

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
              {item.projectLabel} · {item.sceneType} · {item.duration}
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

        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <TagPill key={`${item.id}-${tag}`} label={tag} />
          ))}
        </div>

        <div
          className={`mt-4 grid gap-3 ${hasResult ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Goal
            </div>
            <div className="mt-2 text-sm text-[color:var(--foreground)]">
              {item.goal}
            </div>
          </div>
          {hasResult ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Result
              </div>
              <div className="mt-2 text-sm text-[color:var(--foreground)]">
                {item.result}
              </div>
            </div>
          ) : null}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Delivery
            </div>
            <div className="mt-2 text-sm text-[color:var(--foreground)]">
              {item.delivered}
            </div>
          </div>
        </div>
      </summary>

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="section-divider mx-auto w-24" aria-hidden="true" />
        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Context</div>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              {item.context}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              Timing
            </div>
            <div className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <div>
                <span className="font-semibold text-[color:var(--foreground)]">In:</span>{" "}
                {formatTimingEntry(item.timing.in)}
              </div>
              <div>
                <span className="font-semibold text-[color:var(--foreground)]">Turn:</span>{" "}
                {formatTimingEntry(item.timing.turn)}
              </div>
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

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">What I tried</div>
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

          <div>
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Video</div>
            <div className="mt-3">
              <MediaBlock item={item} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Delivery</div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">{item.delivered}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                Track: Sitting on the Seashore
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "/uploads/tracks/musiche%20soggetto%20obsoleto/Sitting%20On%20The%20Seashore.mp3",
                      context: "Sitting on the Seashore"
                    }
                  ]}
                  coverSrc="/optimized/uploads/copertina%20album/copertina%20soggetto%20obsoleto.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ContactPopover
            buttonLabel="Contact"
            buttonClassName="hero-btn hero-btn-secondary"
            panelId={`contact-popover-${item.id}`}
          />
        </div>
      </div>
    </details>
  );
}

export default function CaseStudiesPage() {
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
          {caseStudies.map((item) => (
            <CaseStudyCard key={item.id} item={item} />
          ))}
        </CaseStudiesAccordion>
      </section>
    </main>
  );
}
