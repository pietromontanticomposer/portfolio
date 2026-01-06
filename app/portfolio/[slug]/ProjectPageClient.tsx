"use client";

import Link from "next/link";
import Image from "next/image";
import LazyIframe from "../../../components/LazyIframe";
import AudioPlayer from "../../../components/AudioPlayer";
import TrackPlayer from "../../../components/TrackPlayerClient";
import { useLanguage } from "../../../lib/LanguageContext";

type Track = {
  context: string;
  file?: string;
  embedUrl?: string;
  height?: number;
};

type Project = {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  largeImage?: string;
  videoEmbed?: string;
  tracks?: Track[];
  tag?: string;
  year?: string | number;
};

const labelsData = {
  it: {
    backHome: "Torna alla Home",
    role: "Ruolo: Compositore",
    format: "Formato:",
    year: "Anno:",
    project: "Progetto",
    soundtrack: "Colonna sonora",
  },
  en: {
    backHome: "Back Home",
    role: "Role: Composer",
    format: "Format:",
    year: "Year:",
    project: "Project",
    soundtrack: "Soundtrack",
  },
};

const getParagraphs = (text?: string) =>
  String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

type Props = {
  project: Project;
};

export default function ProjectPageClient({ project }: Props) {
  const { language } = useLanguage();
  const labels = labelsData[language];

  const paragraphs = getParagraphs(project.description);
  const tracks = (project.tracks ?? []) as Track[];
  const allFileTracks =
    tracks.length > 0 && tracks.every((track) => !!track.file);
  const coverSrc = project.image ?? project.largeImage ?? "";

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <Link
        href="/"
        className="hero-btn hero-btn-secondary modal-close back-home"
      >
        {labels.backHome}
      </Link>
      <section className="page-panel">
        <h1 className="headline section-title text-3xl text-[color:var(--foreground)]">
          {project.title}
        </h1>
        <div className="project-meta">
          <span>{labels.role}</span>
          <span>
            {labels.format} {project.tag ?? labels.project}
          </span>
          <span>
            {labels.year} {project.year ?? "—"}
          </span>
        </div>
        <div className="modal-desc space-y-3 text-sm">
          {paragraphs.map((paragraph, index) => (
            <p key={`${project.slug}-paragraph-${index}`}>{paragraph}</p>
          ))}
        </div>
      </section>

      {project.videoEmbed ? (
        <section className="card-shell p-6 sm:p-8">
          <div className="video-wrapper">
            <iframe
              src={project.videoEmbed}
              title={`${project.title} clip`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </section>
      ) : null}

      {tracks.length > 0 ? (
        <section className="card-shell p-6 sm:p-8">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            {labels.soundtrack}
          </h3>
          <div className="tracks">
            {allFileTracks ? (
              <TrackPlayer
                tracks={tracks as { file: string; context: string }[]}
                coverSrc={coverSrc}
              />
            ) : (
              tracks.map((track, index) => (
                <div key={`${track.context}-${index}`} className="track">
                  <div className="track-context">{track.context}</div>
                  <div className="track-embed">
                    {track.file ? (
                      <AudioPlayer
                        src={track.file}
                        waveColor="#22d3ee"
                        progressColor="#0891b2"
                      />
                    ) : track.embedUrl ? (
                      <LazyIframe
                        src={track.embedUrl}
                        title={`track-${index}`}
                        height={track.height ?? 120}
                        allow={undefined}
                      />
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}

      {project.largeImage ? (
        <section className="card-shell p-6 sm:p-8">
          <Image
            src={project.largeImage}
            alt={`${project.title} still`}
            className="modal-large-image h-auto w-full"
            width={1100}
            height={620}
            loading="lazy"
            decoding="async"
          />
        </section>
      ) : null}
      <Link
        href="/"
        className="hero-btn hero-btn-secondary modal-close back-home"
      >
        {labels.backHome}
      </Link>
    </main>
  );
}
