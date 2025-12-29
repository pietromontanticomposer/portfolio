/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import Link from 'next/link'
import { projects } from '../../../data/projects'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LazyIframe from '../../../components/LazyIframe'
import Image from 'next/image'
import AudioPlayer from '../../../components/AudioPlayer'
import TrackPlayer from '../../../components/TrackPlayerClient'

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
          <button className="hero-btn hero-btn-secondary modal-close back-home">Back Home</button>
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
            <div className="card-shell" style={{ padding: '1rem' }}>
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
            </div>
          ) : null}

          {project.tracks && project.tracks.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <div className="card-shell" style={{ padding: '1rem' }}>
                <h3 className="section-title text-2xl text-[color:var(--foreground)]" style={{ margin: '0 0 0.75rem' }}>Soundtrack</h3>
                <div className="tracks">
                  {project.tracks.every((t) => 'file' in t && !!t.file) ? (
                    <TrackPlayer
                      tracks={project.tracks as { file: string; context: string }[]}
                      coverSrc={project.image ?? project.largeImage ?? ''}
                    />
                  ) : (
                    project.tracks.map((t, i) => {
                      const embedUrl = 'embedUrl' in t ? t.embedUrl : undefined

                      return (
                        <div key={i} className="track">
                          <div className="track-context">{t.context}</div>
                          <div className="track-embed">
                            {'file' in t && t.file ? (
                              <AudioPlayer
                                src={t.file}
                                waveColor="#22d3ee"
                                progressColor="#0891b2"
                              />
                            ) : project.slug === 'claudio-re' ? (
                              <iframe
                                width="100%"
                                height={typeof (t as any).height === 'number' ? (t as any).height : 120}
                                scrolling="no"
                                frameBorder="no"
                                src={(() => {
                                  try {
                                    if (typeof embedUrl === 'string' && embedUrl.includes('w.soundcloud.com/player')) {
                                      const url = new URL(embedUrl);
                                      const params = url.searchParams;
                                      if (!params.has('visual')) params.set('visual', 'false');
                                      if (!params.has('show_artwork')) params.set('show_artwork', 'true');
                                      if (!params.has('show_comments')) params.set('show_comments', 'false');
                                      if (!params.has('show_user')) params.set('show_user', 'false');
                                      if (!params.has('show_reposts')) params.set('show_reposts', 'false');
                                      return url.toString();
                                    }
                                  } catch {
                                    // ignore
                                  }
                                  return embedUrl;
                                })()}
                                title={`track-${i}`}
                                loading="eager"
                              />
                            ) : (
                              <LazyIframe
                                src={embedUrl as string}
                                title={`track-${i}`}
                                height={typeof (t as any).height === 'number' ? (t as any).height : 120}
                                allow={undefined}
                              />
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {project.largeImage && (
            <div className="card-shell" style={{ padding: '1rem' }}>
              <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                <Image
                  src={project.largeImage}
                  alt={`${project.title} still`}
                  className="modal-large-image"
                  width={1100}
                  height={620}
                  style={{ width: '100%', height: 'auto' }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/">
            <button className="hero-btn hero-btn-secondary modal-close back-home">Back Home</button>
          </Link>
        </div>
      </div>
    </main>
  )
}
