"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ContactPopover from "../../components/ContactPopover";
import CaseStudyVideo from "../../components/CaseStudyVideo";
import LazyIframe from "../../components/LazyIframe";
import CaseStudyDuration from "../../components/CaseStudyDuration";
import TrackPlayerClient from "../../components/TrackPlayerClient";
import CaseStudiesAccordion from "../../components/CaseStudiesAccordion";
import { caseStudiesNormalized, type CaseStudy } from "../../data/caseStudies";
import { useLanguage, type Language } from "../../lib/LanguageContext";
import { getText, getTagTranslation, formatTimingEntry } from "../../lib/translations";
import { parseDurationToSeconds, getMediaSources } from "../../lib/mediaUtils";

const stepsData = {
  it: [
    {
      title: "Dove entra la musica",
      detail:
        "Decidiamo insieme entrate/uscite e i momenti che la musica deve sostenere.",
    },
    {
      title: "Opzioni A/B/C",
      detail:
        "2–3 direzioni distinte sullo stesso montaggio, per decisioni rapide e chiare.",
    },
    {
      title: "Montaggio definitivo",
      detail:
        "Quando la scena è definitiva, rifinisco musica e mix senza cambi continui.",
    },
    {
      title: "Consegna file",
      detail:
        "File ordinati e versioni alternative quando servono.",
    },
  ],
  en: [
    {
      title: "Where music starts and stops",
      detail:
        "We decide music in/out and the key moments it should support.",
    },
    {
      title: "Options A/B/C",
      detail:
        "2–3 distinct directions on the same cut, so decisions stay fast and clean.",
    },
    {
      title: "Final cut",
      detail:
        "Once the cut is final, I finish music and mix without moving targets.",
    },
    {
      title: "File delivery",
      detail:
        "Organized files and alternate versions when needed.",
    },
  ],
};

const deliveryChecklistData = {
  it: [
    "Mix stereo principale",
    "Versione con dialoghi più leggibili quando serve",
    "Tracce separate su richiesta, con nomi chiari",
    "Lista brani con entrate/uscite",
    "Una cartella ordinata con versioni chiare",
  ],
  en: [
    "Main stereo mix",
    "Dialogue-friendly alternate when needed",
    "Separate tracks on request, clearly labeled",
    "Cue list with in/out timings",
    "One clean delivery folder with clear versions",
  ],
};

const labelsData = {
  it: {
    pageTitle: "Per Registi",
    heroDescription:
      "Compongo su immagine, performance e punto di vista. Ricevi opzioni A/B/C veloci, revisioni chiare, e brani che supportano il montaggio senza competere con esso.",
    howIWork: "Come lavoro",
    deliveryReady: "Consegna pronta per la post",
    sceneCaseStudies: "Case study delle scene",
    sceneCaseStudiesDesc:
      "Breakdown scena per scena: obiettivi, momenti chiave, opzioni testate e consegna.",
    viewAllCaseStudies: "Vedi tutti i case study",
    readyToSend: "Pronto a inviare un montaggio?",
    readyToSendDesc:
      "Invia la scena, i tuoi riferimenti, e cosa deve ottenere. Rispondo con opzioni, timing e prossimi passi.",
    contact: "Contattami",
    // CaseStudyCard labels
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
    loadClip: "Carica clip",
    embedNotSet:
      "Embed URL non impostato. Incolla l'URL HLS (.m3u8) o embed Vimeo/YouTube in data/caseStudies.ts (embedUrl).",
  },
  en: {
    pageTitle: "For Directors",
    heroDescription:
      "I score to picture, performance, and point of view. You get fast A/B/C options early, clear revision passes, and music that supports your cut without competing with it.",
    howIWork: "How I work",
    deliveryReady: "Delivery ready for post",
    sceneCaseStudies: "Scene case studies",
    sceneCaseStudiesDesc:
      "Scene-by-scene breakdowns: goals, key moments, options tested, and delivery.",
    viewAllCaseStudies: "View all case studies",
    readyToSend: "Ready to send a cut?",
    readyToSendDesc:
      "Send the scene, your references, and what it must do. I will reply with options, timings, and next steps.",
    contact: "Contact",
    // CaseStudyCard labels
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
    loadClip: "Load clip",
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
  const { isHls, src, mp4Fallback } = getMediaSources(item.embedUrl);

  if (!src) {
    return (
      <div className="card-inset rounded-2xl p-4 text-sm text-[color:var(--muted)]">
        {labels.embedNotSet}
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
            title={`${getText(item.title, language)} clip`}
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
          title={`${getText(item.title, language)} clip`}
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
  const durationMarkup = item.duration ? (
    <CaseStudyDuration duration={item.duration} />
  ) : null;

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
            {isOpen ? (
              <MediaBlock item={item} labels={labels} language={language} />
            ) : null}
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
                      context: "Sitting on the Seashore",
                    },
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
                      context: "Something Threatening",
                    },
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
            buttonLabel={labels.contact}
            buttonClassName="hero-btn hero-btn-secondary min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
            panelId={`contact-popover-${item.id}`}
          />
        </div>
      </div>
    </details>
  );
}

export default function ForDirectorsPage() {
  const { language } = useLanguage();
  const steps = stepsData[language];
  const deliveryChecklist = deliveryChecklistData[language];
  const labels = labelsData[language];

  const featuredCaseStudies = caseStudiesNormalized.slice(0, 2);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <section className="card-shell p-8">
        <h1 className="section-title text-4xl text-[color:var(--foreground)]">
          {labels.pageTitle}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          {labels.heroDescription}
        </p>
        <div className="mt-6">
          <ContactPopover
            buttonLabel={labels.contact}
            buttonClassName="hero-btn hero-btn-primary"
            panelId="contact-popover-directors-hero"
          />
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {labels.howIWork}
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
          {labels.deliveryReady}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
          {deliveryChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {labels.sceneCaseStudies}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {labels.sceneCaseStudiesDesc}
        </p>
        <div className="mt-6">
          <CaseStudiesAccordion className="case-studies-grid grid gap-6 md:grid-cols-2">
            {featuredCaseStudies.map((item) => (
              <CaseStudyCard key={item.id} item={item} labels={labels} language={language} />
            ))}
          </CaseStudiesAccordion>
        </div>
        <div className="mt-6">
          <Link href="/case-studies" prefetch={false} className="hero-btn hero-btn-secondary">
            {labels.viewAllCaseStudies}
          </Link>
        </div>
      </section>

      <section className="card-shell p-8">
        <h2 className="section-title text-2xl text-[color:var(--foreground)]">
          {labels.readyToSend}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {labels.readyToSendDesc}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <ContactPopover
            buttonLabel={labels.contact}
            buttonClassName="hero-btn hero-btn-primary"
            panelId="contact-popover-directors-cta"
          />
        </div>
      </section>
    </main>
  );
}
