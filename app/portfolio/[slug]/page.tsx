import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import LazyIframe from "../../../components/LazyIframe";
import AudioPlayer from "../../../components/AudioPlayer";
import TrackPlayer from "../../../components/TrackPlayerClient";
import { projects } from "../../../data/projects";

type Params = { params: { slug: string } | Promise<{ slug: string }> };

type Track = {
  context: string;
  file?: string;
  embedUrl?: string;
  height?: number;
};

const getParagraphs = (text?: string) =>
  String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const project = projects.find((p) => p.slug === resolvedParams.slug);
  if (!project) return {};

  const title = `${project.title} — Pietro Montanti`;
  const description =
    project.description?.split("\n")[0] ?? "Project by Pietro Montanti.";
  const image = project.image ?? project.largeImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      type: "article",
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const resolvedParams = await Promise.resolve(params);
  const project = projects.find((p) => p.slug === resolvedParams.slug);
  if (!project) return notFound();

  const paragraphs = getParagraphs(project.description);
  const tracks = (project.tracks ?? []) as Track[];
  const allFileTracks = tracks.length > 0 && tracks.every((track) => !!track.file);
  const coverSrc = project.image ?? project.largeImage ?? "";

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-20">
      <section className="page-panel">
        <h1 className="headline section-title text-3xl text-[color:var(--foreground)]">
          {project.title}
        </h1>
        <div className="project-meta">
          <span>Role: Composer</span>
          <span>Format: {project.tag ?? "Project"}</span>
          <span>Year: {project.year ?? "—"}</span>
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
            Soundtrack
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
    </main>
  );
}
