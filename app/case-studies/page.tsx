"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CaseStudiesAccordion from "../../components/CaseStudiesAccordion";
import CaseStudyVideo from "../../components/CaseStudyVideo";
import ContactPopover from "../../components/ContactPopover";
import CaseStudyDuration from "../../components/CaseStudyDuration";
import LazyIframe from "../../components/LazyIframe";
import TrackPlayerClient from "../../components/TrackPlayerClient";
import { caseStudiesNormalized, type CaseStudy } from "../../data/caseStudies";
import { useLanguage, type Language } from "../../lib/LanguageContext";
import { getText, getTagTranslation, formatTimingEntry } from "../../lib/translations";
import { parseDurationToSeconds, getMediaSources } from "../../lib/mediaUtils";

const claudioRePosterSrc =
  "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/posters/poster%20claudio%20re.avif";
const claudioReHref = "/portfolio/claudio-re";

const labelsData = {
  it: {
    pageTitle: "Case Studies",
    pageDescription:
      "Cosa è stato chiesto, cosa ho scelto, cosa è cambiato nella scena.",
    goal: "Obiettivo",
    result: "Risultato",
    delivery: "Consegna",
    video: "Video",
    context: "Contesto",
    timing: "Timing",
    timingIn: "Entra:",
    timingShift: "Shift:",
    timingOut: "Esce:",
    timingNote: "Nota:",
    timingNoteDefault: "Entra per supportare la scena senza invadere.",
    brief: "Brief",
    wanted: "Desiderato:",
    avoid: "Evitare:",
    direction: "Direzione",
    finalChoice: "Scelta finale:",
    musicalLanguage: "Linguaggio musicale",
    track: "Traccia:",
    technicalNotes: "Note tecniche (post)",
    contact: "Contattami",
    moreInfoShort: "Per maggiori info sul corto",
    loadClip: "Carica clip",
    clipLabel: "clip",
    videoFallback: "Il tuo browser non supporta il tag video.",
    caseStudiesAria: "Case studies",
    claudioReAria: "Vedi case study di Claudio Re",
    claudioReAlt: "Poster di Claudio Re",
    embedNotSet:
      "Embed URL non impostato. Incolla l'URL HLS (.m3u8) o embed Vimeo/YouTube in data/caseStudies.ts (embedUrl).",
  },
  en: {
    pageTitle: "Case Studies",
    pageDescription:
      "What was asked, what I chose, what changed in the scene.",
    goal: "Goal",
    result: "Result",
    delivery: "Delivery",
    video: "Video",
    context: "Context",
    timing: "Timing",
    timingIn: "In:",
    timingShift: "Shift:",
    timingOut: "Out:",
    timingNote: "Note:",
    timingNoteDefault: "Enters to support the scene without getting in the way.",
    brief: "Brief",
    wanted: "Wanted:",
    avoid: "Avoid:",
    direction: "Direction",
    finalChoice: "Final choice:",
    musicalLanguage: "Musical language",
    track: "Track:",
    technicalNotes: "Technical notes (post)",
    contact: "Contact",
    moreInfoShort: "For more info on the short",
    loadClip: "Load clip",
    clipLabel: "clip",
    videoFallback: "Your browser does not support the video tag.",
    caseStudiesAria: "Case studies",
    claudioReAria: "View Claudio Re case study",
    claudioReAlt: "Claudio Re poster",
    embedNotSet:
      "Embed URL not set yet. Paste the HLS playlist (.m3u8) or Vimeo/YouTube embed URL in data/caseStudies.ts (embedUrl).",
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
      <div>
        <div className="video-wrapper">
          <video
            className="case-study-video absolute inset-0 h-full w-full rounded-xl"
            controls
            playsInline
            preload="metadata"
            poster={item.posterImage || posterUrl || undefined}
            aria-label={`${getText(item.title, language)} ${labels.clipLabel}`}
          >
            <source src={src ?? undefined} type="video/mp4" />
            {labels.videoFallback}
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
            title={`${getText(item.title, language)} ${labels.clipLabel}`}
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
          title={`${getText(item.title, language)} ${labels.clipLabel}`}
          height={360}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          autoLoad
          buttonLabel={labels.loadClip}
        />
      </div>
    </div>
  );
}

function MediaThumbnail({ item, language }: { item: CaseStudy; language: Language }) {
  const { posterUrl: generatedPosterUrl } = getMediaSources(item.embedUrl);
  const posterUrl = item.posterImage || generatedPosterUrl;

  return (
    <div className="card-inset relative aspect-video overflow-hidden rounded-2xl">
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
      <div className="card-overlay absolute inset-0" aria-hidden="true" />
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="case-study-play-button flex h-12 w-12 items-center justify-center rounded-full">
          <svg
            className="h-5 w-5 text-white"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
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

function CaseStudyCard({
  item,
  showClaudioRePoster,
  labels,
  language,
}: {
  item: CaseStudy;
  showClaudioRePoster?: boolean;
  labels: typeof labelsData.it;
  language: Language;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const videoAnchorId = `video-${item.id}`;
  const musicalLanguageText = getText(item.musicalLanguage ?? item.musicChoices, language)?.trim();
  const trackTitle = item.trackTitle?.trim();

  return (
    <details
      className="card-shell case-study-card group overflow-hidden"
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
          <div className="card-inset rounded-2xl p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.goal}
            </div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              {getText(item.goal, language)}
            </div>
          </div>

          <div className="card-inset rounded-2xl p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.result}
            </div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              {getText(item.result, language)}
            </div>
          </div>

          <div className="card-inset rounded-2xl p-4">
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
            {isOpen ? (
              <MediaBlock item={item} labels={labels} language={language} />
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="card-inset rounded-2xl p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.context}
            </div>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              {getText(item.context, language)}
            </p>
          </div>

          <div className="card-inset rounded-2xl p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.timing}
            </div>
            <div className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <div>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {labels.timingIn}
                </span>{" "}
                {formatTimingEntry(item.timing.in, language)}
              </div>
              {item.timing.turn ? (
                <div>
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {labels.timingShift}
                  </span>{" "}
                  {formatTimingEntry(item.timing.turn, language)}
                </div>
              ) : null}
              <div>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {labels.timingOut}
                </span>{" "}
                {formatTimingEntry(item.timing.out, language)}
              </div>
            </div>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              <span className="font-semibold text-[color:var(--foreground)]">
                {labels.timingNote}
              </span>{" "}
              {getText(item.spottingNote, language) || labels.timingNoteDefault}
            </div>
          </div>

          <div className="card-inset rounded-2xl p-4">
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

          <div className="card-inset rounded-2xl p-4">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">
              {labels.direction}
            </div>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                <span className="font-semibold text-[color:var(--foreground)]">
                  A:
                </span>{" "}
                {getText(item.versionsTested.A, language)}
              </li>
              <li>
                <span className="font-semibold text-[color:var(--foreground)]">
                  B:
                </span>{" "}
                {getText(item.versionsTested.B, language)}
              </li>
              <li>
                <span className="font-semibold text-[color:var(--foreground)]">
                  C:
                </span>{" "}
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
            <div className="card-inset rounded-2xl p-4">
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

          <div className="card-inset rounded-2xl p-4">
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

          {item.id === "soggetto-obsoleto-sitting-on-the-seashore" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} Sitting on the Seashore
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20soggetto%20obsoleto/Sitting%20On%20The%20Seashore.mp3",
                      context: "Sitting on the Seashore",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20soggetto%20obsoleto.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "la-sonata-del-chaos-mothers-tale-banshee" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} The Mother&apos;s Tale
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/musiche-la-sonata-del-caos/The-Mothers-Tale-alt.mp3",
                      context: "The Mother's Tale",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20la%20sonata%20del%20caos.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-03" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} Something Threatening
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/tracks/musiche%20la%20sonata%20del%20caos/Something%20Threatening.mp3",
                      context: "Something Threatening",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20la%20sonata%20del%20caos.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-05" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} A Close Encounter in the Wood
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20la%20sonata%20del%20caos/A%20Close%20Encounter%20In%20The%20Wood.mp3",
                      context: "A Close Encounter in the Wood",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20la%20sonata%20del%20caos.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-04" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} Talia&apos;s Farewell
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20la%20sonata%20del%20caos/Talias%20Farewell.mp3",
                      context: "Talia's Farewell",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20la%20sonata%20del%20caos.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "claudio-re-opening-titles-storm-theme" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} The Storm
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20claudio%20re/The%20Storm.mp3",
                      context: "The Storm",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-08" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} My Sin Is Rotten
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20claudio%20re/My%20Sin%20Is%20Rotten.mp3",
                      context: "My Sin Is Rotten",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-09" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} My Crown, My Ambition, My Queen
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20claudio%20re/My%20Crown%2C%20My%20Ambition%2C%20My%20Queen.mp3",
                      context: "My Crown, My Ambition, My Queen",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-07" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} The Spectre
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20claudio%20re/The%20Spectre.mp3",
                      context: "The Spectre",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "scene-10" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} What If A Man Can&apos;t Regret
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/tracks/musiche%20claudio%20re/What%20If%20A%20Man%20Can%27t%20Regret.mp3",
                      context: "What If A Man Can't Regret",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}

          {item.id === "i-veneti-antichi-battle-with-the-spartans" ? (
            <div className="card-inset rounded-2xl p-4">
              <div className="text-sm font-semibold text-[color:var(--foreground)]">
                {labels.track} The Battle
              </div>
              <div className="mt-3">
                <TrackPlayerClient
                  tracks={[
                    {
                      file: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/tracks/musiche-i-veneti-antichi/The-Battle.mp3",
                      context: "The Battle",
                    },
                  ]}
                  coverSrc="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/uploads/copertina%20album/copertina%20i%20veneti%20antichi.png"
                  displayDurations={[parseDurationToSeconds(item.duration)]}
                />
              </div>
            </div>
          ) : null}
        </div>

        {showClaudioRePoster ? (
          <section className="card-inset mt-6 rounded-2xl p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] md:items-center">
              <div className="flex flex-col gap-4 text-left">
                <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--muted)]">
                  {labels.moreInfoShort}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <ContactPopover
                    buttonLabel={labels.contact}
                    buttonClassName="hero-btn hero-btn-primary min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
                    panelId={`contact-popover-${item.id}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href={claudioReHref}
                  prefetch={false}
                  className="group relative overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-inset-bg)] p-3 shadow-[0_18px_45px_var(--shadow)] transition hover:border-[color:rgba(255,255,255,0.3)] hover:shadow-[0_22px_55px_var(--shadow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
                  aria-label={labels.claudioReAria}
                >
                  <Image
                    src={claudioRePosterSrc}
                    alt={labels.claudioReAlt}
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
              buttonLabel={labels.contact}
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
  const { language } = useLanguage();
  const labels = labelsData[language];
  const lastFiveStartIndex = Math.max(caseStudiesNormalized.length - 5, 0);

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 lg:px-20">
      <header className="max-w-3xl">
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          {labels.pageTitle}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
          {labels.pageDescription}
        </p>
      </header>

      <section className="space-y-6" aria-label={labels.caseStudiesAria}>
        <CaseStudiesAccordion className="case-studies-grid grid gap-6 md:grid-cols-2">
          {caseStudiesNormalized.map((item, index) => (
            <CaseStudyCard
              key={item.id}
              item={item}
              showClaudioRePoster={index >= lastFiveStartIndex}
              labels={labels}
              language={language}
            />
          ))}
        </CaseStudiesAccordion>
      </section>
    </main>
  );
}
