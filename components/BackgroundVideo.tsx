/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from 'react';

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoadSrc, setShouldLoadSrc] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasLoadedRef = useRef(false);
  const [primarySrc, setPrimarySrc] = useState<string | null>(null);

  // Decide whether to ever start the video (respect reduced motion and save-data)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as any).connection?.saveData;
    if (prefersReducedMotion || saveData) {
      // do not load or play video; keep poster visible
      return;
    }

    let idleId: number | null = null;
    let observer: IntersectionObserver | null = null;

    const loadVideoSrc = () => {
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;

      try {
        // choose preferred source based on viewport and network conditions
        const isMobile = window.innerWidth <= 768;
        const connection = (navigator as any).connection;
        const effectiveType = connection?.effectiveType || '';

        // prefer modern WebM when available (smaller), fallback to MP4
        const preferred = isMobile || effectiveType.includes('2g') || effectiveType.includes('3g')
          ? ['/background.webm', '/background.mp4']
          : ['/background.webm', '/background.mp4'];

        setPrimarySrc(preferred[0]);
      } catch (e) {
        setPrimarySrc('/background.mp4');
      }

      setShouldLoadSrc(true);
    };

    // Wait until hero (or top of page) is visible before loading to avoid wasting bandwidth
    const checkViewportAndLoad = () => {
      const heroElement = document.querySelector('header') || document.body;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if ('requestIdleCallback' in window) {
                idleId = (window as any).requestIdleCallback(loadVideoSrc, { timeout: 3000 });
              } else {
                idleId = (setTimeout(loadVideoSrc, 2000) as unknown) as number;
              }
              observer?.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );

      observer.observe(heroElement);

      // Fallback: if the observer doesn't fire (rare), load after a short timeout
      const fallbackTimeout = window.setTimeout(() => {
        if (!hasLoadedRef.current) {
          loadVideoSrc();
        }
        clearTimeout(fallbackTimeout);
      }, 1500);
    };

    const initTimeout = window.setTimeout(checkViewportAndLoad, 100);

    return () => {
      clearTimeout(initTimeout);
      if (idleId !== null) {
        if ('cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(idleId);
        } else {
          clearTimeout(idleId);
        }
      }
      observer?.disconnect();
    };
  }, []);

  // When sources are added, enable preload and attempt to play after first paint + idle
  useEffect(() => {
    if (!shouldLoadSrc || !videoRef.current) return;
    const video = videoRef.current;

    // Prepare element for best chance to autoplay quickly
    try {
      video.muted = true; // enforce muted before play attempts
      video.playsInline = true;
      // enable CORS to allow better caching behavior from CDNs
      try { (video as any).crossOrigin = 'anonymous'; } catch (e) {}

      // If a primarySrc was chosen, assign it directly to start fetching asap
      if (primarySrc) {
        try { video.src = primarySrc; } catch (e) {}
      }

      video.preload = 'auto';
      video.load();
    } catch (e) {
      // ignore any DOM exceptions
    }

    const onPlaying = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onCanPlay = () => {
      // once we can play, attempt immediate playback
      tryPlayImmediate();
    };
    const onCanPlayThrough = () => {
      tryPlayImmediate();
    };
    const onWaiting = () => {
      // transient buffering — retry play shortly
      setTimeout(() => {
        tryPlayImmediate();
      }, 300);
    };
    const onStalled = () => {
      setTimeout(() => {
        tryPlayImmediate();
      }, 700);
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('canplaythrough', onCanPlayThrough);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('stalled', onStalled);

    // attempt play helper that ensures muted is set and swallows errors
    const tryPlayImmediate = () => {
      try {
        video.muted = true;
      } catch (e) {}
      const p = video.play();
      if (p && typeof (p as Promise<void>).then === 'function') {
        (p as Promise<void>).catch(() => {
          // swallow autoplay failure; poster remains
        });
      }
    };

    // schedule an aggressive start: immediate attempt, then RAF + idle retry
    tryPlayImmediate();
    requestAnimationFrame(() => {
      tryPlayImmediate();
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => tryPlayImmediate(), { timeout: 800 });
      } else {
        setTimeout(() => tryPlayImmediate(), 500);
      }
    });

    // Pause when tab is hidden to reduce CPU
    const onVisibility = () => {
      if (document.hidden) {
        try { video.pause(); } catch (e) {}
      } else {
        tryPlayImmediate();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('canplaythrough', onCanPlayThrough);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('stalled', onStalled);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [shouldLoadSrc, primarySrc]);

  // Render only poster when reduced-motion or save-data is requested
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = typeof navigator !== 'undefined' && (navigator as any).connection?.saveData;

  if (prefersReducedMotion || saveData) {
    return (
      <>
        <div
          className={`bg-video-poster`}
          style={{ backgroundImage: `url('/background-poster.jpg')` }}
          aria-hidden="true"
        />
        <div className="bg-video-overlay" aria-hidden="true" />
      </>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        className={`bg-video ${isPlaying ? 'is-visible' : ''}`}
        autoPlay
        preload="none"
        muted
        loop
        playsInline
        disablePictureInPicture
        controlsList="nodownload noremoteplayback"
        poster="/background-poster.jpg"
        aria-hidden="true"
        style={{ transform: 'translateZ(0)' }}
      >
        {shouldLoadSrc && (
          <>
            {/* media-specific sources (if you later add public/videos/bg-mobile.mp4 and bg-desktop.mp4 these will be preferred) */}
            <source media="(max-width: 768px)" src="/videos/bg-mobile.mp4" type="video/mp4" />
            <source media="(min-width: 769px)" src="/videos/bg-desktop.mp4" type="video/mp4" />

            {/* safe fallbacks to files already present in /public */}
            <source src="/background.webm" type="video/webm" />
            <source src="/background.mp4" type="video/mp4" />
          </>
        )}
      </video>

      <div
        className={`bg-video-poster ${isPlaying ? 'is-hidden' : ''}`}
        style={{ backgroundImage: `url('/background-poster.jpg')` }}
        aria-hidden="true"
      />

      <div className="bg-video-overlay" aria-hidden="true" />
    </>
  );
}
