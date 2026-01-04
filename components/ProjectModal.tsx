"use client";
import React from "react";
import Image from 'next/image'
import LazyIframe from './LazyIframe'
import AudioPlayer from './AudioPlayer'
import TrackPlayer from './TrackPlayerClient'

type Track = {
  embedUrl?: string;
  file?: string;
  context: string;
  height?: number;
};

type Project = {
  slug: string;
  title: string;
  year?: string;
  tag?: string;
  image?: string;
  description?: string;
  videoEmbed?: string;
  tracks?: Track[];
  largeImage?: string;
};

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <header className="modal-header">
          <h2 className="modal-title">{project.title}</h2>
        </header>

        <div className="modal-body">
          <div className="modal-media">
            {project.videoEmbed ? (
              <div className="video-wrapper" style={{ aspectRatio: '16 / 9' }}>
                <iframe
                  src={project.videoEmbed}
                  title={`${project.title} clip`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : null}
            {project.largeImage ? (
              <div style={{ position: 'relative', width: '100%', height: 'auto', aspectRatio: '1100 / 620' }}>
                <Image src={project.largeImage} alt={`${project.title} still`} className="modal-large-image" width={1100} height={620} style={{ width: '100%', height: 'auto' }} loading="lazy" decoding="async" />
              </div>
            ) : null}
          </div>

          <aside className="modal-info">
            <div className="modal-desc">
              {String(project.description)
                .split('\n')
                .map((line, i) =>
                  line.trim() ? (
                    <p key={i} style={{ margin: '0 0 0.6rem' }}>
                      {line.trim()}
                    </p>
                  ) : (
                    <br key={i} />
                  ),
                )}
            </div>

            {project.tracks && project.tracks.length > 0 && (
              <div className="tracks">
                {project.tracks.every((t) => 'file' in t && !!t.file) && (project.slug === 'claudio-re' || project.slug === 'soggetto-obsoleto' || project.slug === 'l-appartamento') ? (
                  <TrackPlayer
                    tracks={project.tracks as { file: string; context: string }[]}
                    coverSrc={
                      project.slug === 'claudio-re'
                        ? 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp'
                        : project.slug === 'l-appartamento'
                        ? "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20l%27appartamento.webp"
                        : 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20soggetto%20obsoleto.webp'
                    }
                  />
                ) : (
                  project.tracks.map((t, i) => (
                    <div key={i} className="track">
                      <div className="track-context">{t.context}</div>
                      <div className="track-embed">
                        {t.file ? (
                          <AudioPlayer
                            src={t.file}
                            waveColor="#22d3ee"
                            progressColor="#0891b2"
                          />
                          ) : (
                          <LazyIframe src={t.embedUrl as string} title={`track-${i}`} height={t.height ?? 120} />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
