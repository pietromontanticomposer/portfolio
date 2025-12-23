import React from 'react'
import Link from 'next/link'
import { projects } from '../../../data/projects'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LazyIframe from '../../../components/LazyIframe'
import Image from 'next/image'
import AudioPlayer from '../../../components/AudioPlayer'
import TrackPlayer from '../../../components/TrackPlayer'

type Params = { params: { slug: string } | Promise<{ slug: string }> }

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const project = projects.find((p) => p.slug === resolvedParams.slug)
  if (!project) return {}

  const title = `${project.title} — Pietro Montanti`
  const description = project.description?.split('\n')[0] ?? 'Project by Pietro Montanti.'
  const image = project.image ?? project.largeImage

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      type: 'article',
    },
  }
}

export default async function ProjectPage({ params }: Params) {
  const resolvedParams = await Promise.resolve(params)
  const project = projects.find((p) => p.slug === resolvedParams.slug)
  if (!project) return notFound()

  return (
    <main style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/">
          <button className="modal-close">Back Home</button>
        </Link>

        <div className="page-panel">
          <h1 className="headline section-title" style={{ fontSize: '2rem', margin: '0 0 0.8rem' }}>{project.title}</h1>

          <div className="project-meta">
            <span>Role: Composer</span>
            <span>Format: {project.tag ?? 'Project'}</span>
            <span>Year: {project.year ?? '—'}</span>
          </div>

          <div className="modal-desc" style={{ maxWidth: 900 }}>
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
        </div>

        <div style={{ marginTop: '1.25rem', display: 'grid', gap: '1rem' }}>
          {project.videoEmbed ? (
            <div className="video-wrapper">
              <iframe
                src={project.videoEmbed}
                title={`${project.title} clip`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="eager"
              />
            </div>
          ) : null}

          {project.tracks && project.tracks.length > 0 && (
            <div className="tracks">
              {project.tracks.every((t) => t.file) &&
              (project.slug === 'claudio-re' ||
                project.slug === 'soggetto-obsoleto' ||
                project.slug === 'i-veneti-antichi' ||
                project.slug === 'la-sonata-del-caos' ||
                project.slug === 'l-appartamento') ? (
                <TrackPlayer
                  tracks={project.tracks as { file: string; context: string }[]}
                  coverSrc={
                    project.slug === 'claudio-re'
                      ? '/uploads/copertina album/copertina claudio re.jpg'
                      : project.slug === 'soggetto-obsoleto'
                      ? '/uploads/copertina album/copertina soggetto obsoleto.jpg'
                      : project.slug === 'l-appartamento'
                      ? "/uploads/locandina l'appartamento.jpg"
                      : project.slug === 'la-sonata-del-caos'
                      ? '/uploads/copertina album/copertina la sonata del caos.jpg'
                      : '/uploads/copertina album/copertina i veneti antichi.png'
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
                      ) : project.slug === 'claudio-re' ? (
                        <iframe
                          width="100%"
                          height={t.height ?? 120}
                          scrolling="no"
                          frameBorder="no"
                          src={(() => {
                            try {
                              if (typeof t.embedUrl === 'string' && t.embedUrl.includes('w.soundcloud.com/player')) {
                                const url = new URL(t.embedUrl);
                                const params = url.searchParams;
                                if (!params.has('visual')) params.set('visual', 'false');
                                if (!params.has('show_artwork')) params.set('show_artwork', 'true');
                                if (!params.has('show_comments')) params.set('show_comments', 'false');
                                if (!params.has('show_user')) params.set('show_user', 'false');
                                if (!params.has('show_reposts')) params.set('show_reposts', 'false');
                                return url.toString();
                              }
                            } catch (e) {}
                            return t.embedUrl;
                          })()}
                          title={`track-${i}`}
                          loading="eager"
                        />
                      ) : (
                        <LazyIframe
                          src={t.embedUrl}
                          title={`track-${i}`}
                          height={t.height ?? 120}
                          allow={undefined}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {project.largeImage && (
            <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
              <Image
                src={encodeURI(project.largeImage).replace(/'/g, "%27")}
                alt={`${project.title} still`}
                className="modal-large-image"
                width={1100}
                height={620}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/">
            <button className="modal-close">Back Home</button>
          </Link>
        </div>
      </div>
    </main>
  )
}
