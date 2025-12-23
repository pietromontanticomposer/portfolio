"use client";
import React from "react";
import Image from 'next/image'
import LazyIframe from './LazyIframe'
import AudioPlayer from './AudioPlayer'
import TrackPlayer from './TrackPlayer'

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
          <button className="modal-close" onClick={onClose} aria-label="Close">
            Back Home
          </button>
        </header>

        <div className="modal-body">
          <div className="modal-media">
            {project.videoEmbed ? (
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
            ) : null}
            {project.largeImage ? (
              <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                <Image src={project.largeImage} alt={`${project.title} still`} className="modal-large-image" width={1100} height={620} style={{ width: '100%', height: 'auto' }} />
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
                {project.tracks.every((t) => t.file) && (project.slug === 'claudio-re' || project.slug === 'soggetto-obsoleto' || project.slug === 'l-appartamento') ? (
                  <TrackPlayer
                    tracks={project.tracks as { file: string; context: string }[]}
                    coverSrc={
                      project.slug === 'claudio-re'
                        ? '/uploads/copertina album/copertina claudio re.jpg'
                        : project.slug === 'l-appartamento'
                        ? "/uploads/locandina l'appartamento.jpg"
                        : '/uploads/copertina album/copertina soggetto obsoleto.jpg'
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
                          <LazyIframe src={t.embedUrl} title={`track-${i}`} height={t.height ?? 120} />
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
