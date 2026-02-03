"use client";

import { useState } from "react";
import Image from "next/image";
import CaseStudiesAccordion from "./CaseStudiesAccordion";
import CaseStudyVideo from "./CaseStudyVideo";
import KeepPlayingVideo from "./KeepPlayingVideo";
import LazyIframe from "./LazyIframe";
import CaseStudyDuration from "./CaseStudyDuration";
import { useLanguage, type Language } from "../lib/LanguageContext";
import { getText, getTagTranslation, formatTimingEntry } from "../lib/translations";
import { getMediaSources } from "../lib/mediaUtils";
import type { CaseStudy } from "../data/caseStudies";

const labelsData = {
  it: {
    sectionTitle: "Case Studies",
    goal: "Obiettivo",
    result: "Risultato",
    delivery: "Consegna file",
    video: "Video",
    context: "Contesto",
    timing: "Entrate/uscite della musica",
    timingIn: "Entra:",
    timingShift: "Cambio:",
    timingOut: "Esce:",
    timingNote: "Nota:",
    timingNoteDefault: "Entra per supportare la scena senza invadere.",
    brief: "Cosa serviva",
    wanted: "Desiderato:",
    avoid: "Evitare:",
    direction: "Opzioni provate",
    finalChoice: "Scelta finale:",
    musicalLanguage: "Come suona la musica",
    track: "Traccia:",
    technicalNotes: "Dettagli di consegna",
    clipLabel: "clip",
    videoFallback: "Il tuo browser non supporta il tag video.",
    embedNotSet:
      "Embed URL non impostato. Incolla l'URL HLS (.m3u8) o embed Vimeo/YouTube in data/caseStudies.ts (embedUrl).",
    loadClip: "Carica clip",
  },
  en: {
    sectionTitle: "Case Studies",
    goal: "Goal",
    result: "Result",
    delivery: "File delivery",
    video: "Video",
    context: "Context",
    timing: "Music in/out",
    timingIn: "In:",
    timingShift: "Change:",
    timingOut: "Out:",
    timingNote: "Note:",
    timingNoteDefault: "Enters to support the scene without getting in the way.",
    brief: "What was needed",
    wanted: "Wanted:",
    avoid: "Avoid:",
    direction: "Options tested",
    finalChoice: "Final choice:",
    musicalLanguage: "How the music sounds",
    track: "Track:",
    technicalNotes: "Delivery details",
    clipLabel: "clip",
    videoFallback: "Your browser does not support the video tag.",
    embedNotSet:
      "Embed URL not set yet. Paste the HLS playlist (.m3u8) or Vimeo/YouTube embed URL in data/caseStudies.ts (embedUrl).",
    loadClip: "Load clip",
  },
};

function MediaBlock({
  item,
  labels,
  language,
}: {
  item: CaseStudy;
  labels: typeof labelsData.it;
  language: Language;
}) {
  const mediaSources = getMediaSources(item.embedUrl);
  const { isHls, src, mp4Fallback, isMp4, posterUrl } = mediaSources;

  if (!src) {
    return (
      <div className="card-inset rounded-2xl p-4 text-sm text-[color:var(--muted)]">
        {labels.embedNotSet}
      </div>
    );
  }

  if (isMp4) {
    return (
      <div className="video-wrapper">
        <KeepPlayingVideo
          className="case-study-video absolute inset-0 h-full w-full rounded-xl"
          controls
          playsInline
          preload="metadata"
          poster={item.posterImage || posterUrl || undefined}
          aria-label={`${getText(item.title, language)} ${labels.clipLabel}`}
        >
          <source src={src ?? undefined} type="video/mp4" />
          {labels.videoFallback}
        </KeepPlayingVideo>
      </div>
    );
  }

  if (isHls) {
    return (
      <div className="video-wrapper">
        <CaseStudyVideo
          hlsUrl={src}
          mp4Url={mp4Fallback}
          title={`${getText(item.title, language)} ${labels.clipLabel}`}
          poster={item.posterImage}
        />
      </div>
    );
  }

  return (
    <div className="video-wrapper">
      <LazyIframe
        src={src}
        title={`${getText(item.title, language)} ${labels.clipLabel}`}
        height={360}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        autoLoad
        buttonLabel={labels.loadClip}
      />
    </div>
  );
}

function MediaThumbnail({ item, language }: { item: CaseStudy; language: Language }) {
  const { posterUrl: generatedPosterUrl } = getMediaSources(item.embedUrl);
  const posterUrl = item.posterImage || generatedPosterUrl;

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-inset-bg)]">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={`${getText(item.title, language)} thumbnail`}
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
      {item.duration ? (
        <div className="absolute bottom-3 right-3">
          <CaseStudyDuration duration={item.duration} />
        </div>
      ) : null}
    </div>
  );
}

function CaseStudyCard({
  item,
  labels,
  language,
}: {
  item: CaseStudy;
  labels: typeof labelsData.it;
  language: Language;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const videoAnchorId = `video-${item.id}`;
  const musicalLanguageText = getText(item.musicalLanguage ?? item.musicChoices, language)?.trim();
  const trackTitle = item.trackTitle?.trim();
  const durationMarkup = item.duration ? <CaseStudyDuration duration={item.duration} /> : null;
  const timingInText = formatTimingEntry(item.timing.in, language);
  const timingTurnText = item.timing.turn ? formatTimingEntry(item.timing.turn, language) : "";
  const timingOutText = formatTimingEntry(item.timing.out, language);

  return (
    <details
      className="group overflow-hidden case-study-card card-inset rounded-[20px]"
      suppressHydrationWarning
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer select-none list-none p-6 sm:p-8 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="section-title text-2xl text-[color:var(--foreground)]">
              {getText(item.title, language)}
            </h2>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              {item.projectLabel} · {item.sceneType}
              {durationMarkup ? <> · {durationMarkup}</> : null}
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
          <MediaThumbnail item={item} language={language} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={`${item.id}-${tag}`}
              className="rounded-full border border-[color:var(--card-border)] bg-[color:var(--card-inset-bg)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted)]"
            >
              {getTagTranslation(tag, language)}
            </span>
          ))}
        </div>
      </summary>

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="section-divider mx-auto w-24" aria-hidden="true" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.goal}
            </div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              {getText(item.goal, language)}
            </div>
          </div>

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.result}
            </div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              {getText(item.result, language)}
            </div>
          </div>

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.delivery}
            </div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              {getText(item.delivered, language)}
            </div>
          </div>
        </div>

        <div className="mt-6" id={videoAnchorId}>
          <div className="text-sm font-semibold text-[color:var(--foreground)]">
            {labels.video}
          </div>
          <div className="mt-3 overflow-hidden rounded-2xl">
            {isOpen ? <MediaBlock item={item} labels={labels} language={language} /> : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.context}
            </div>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              {getText(item.context, language)}
            </p>
          </div>

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.timing}
            </div>
            <div className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              {timingInText ? (
                <div>
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {labels.timingIn}
                  </span>{" "}
                  {timingInText}
                </div>
              ) : null}
              {item.timing.turn && timingTurnText ? (
                <div>
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {labels.timingShift}
                  </span>{" "}
                  {timingTurnText}
                </div>
              ) : null}
              {timingOutText ? (
                <div>
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {labels.timingOut}
                  </span>{" "}
                  {timingOutText}
                </div>
              ) : null}
            </div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              <span className="font-semibold text-[color:var(--foreground)]">
                {labels.timingNote}
              </span>{" "}
              {getText(item.spottingNote, language) || labels.timingNoteDefault}
            </div>
          </div>

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.brief}
            </div>
            <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)]">
              <div>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {labels.wanted}
                </span>{" "}
                {getText(item.directorWanted, language)}
              </div>
              <div>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {labels.avoid}
                </span>{" "}
                {getText(item.directorAvoid, language)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.direction}
            </div>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                <span className="font-semibold text-[color:var(--foreground)]">A:</span>{" "}
                {getText(item.versionsTested.A, language)}
              </li>
              <li>
                <span className="font-semibold text-[color:var(--foreground)]">B:</span>{" "}
                {getText(item.versionsTested.B, language)}
              </li>
              <li>
                <span className="font-semibold text-[color:var(--foreground)]">C:</span>{" "}
                {getText(item.versionsTested.C, language)}
              </li>
            </ul>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              <span className="font-semibold text-[color:var(--foreground)]">
                {labels.finalChoice}
              </span>{" "}
              {getText(item.finalChoice, language)}
            </div>
          </div>

          {musicalLanguageText || trackTitle ? (
            <div className="rounded-2xl card-inset p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.musicalLanguage}
              </div>
              {musicalLanguageText ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[color:var(--muted)]">
                  {musicalLanguageText}
                </p>
              ) : null}
              {trackTitle ? (
                <div className="mt-3 text-sm text-[color:var(--muted)]">
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {labels.track}
                  </span>{" "}
                  &ldquo;{trackTitle}&rdquo;
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-2xl card-inset p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.technicalNotes}
            </div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              <ul className="list-disc space-y-1 pl-5">
                {item.technicalNotes.map((line, idx) => (
                  <li key={`${item.id}-tech-${idx}`}>{getText(line, language)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

export default function ProjectCaseStudies({ items }: { items: CaseStudy[] }) {
  const { language } = useLanguage();
  const labels = labelsData[language];

  if (items.length === 0) return null;

  return (
    <section className="card-shell p-6 sm:p-8">
      <h3 className="section-title text-2xl text-[color:var(--foreground)]">
        {labels.sectionTitle}
      </h3>
      <div className="mt-6">
        <CaseStudiesAccordion className="case-studies-grid grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <CaseStudyCard key={item.id} item={item} labels={labels} language={language} />
          ))}
        </CaseStudiesAccordion>
      </div>
    </section>
  );
}
