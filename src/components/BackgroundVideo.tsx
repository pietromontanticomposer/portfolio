"use client";
import { useEffect, useRef, useState } from 'react';
import { animationCoordinator } from '../lib/AnimationCoordinator';

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement | null>(null);
  const [shouldLoadSrc, setShouldLoadSrc] = useState(false);
  const hasLoadedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as any).connection && (navigator as any).connection.saveData;
    if (prefersReducedMotion || saveData) return;

    let idleId: number | null = null;
    let observer: IntersectionObserver | null = null;

    const loadVideoSrc = () => {
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;
      setShouldLoadSrc(true);
    };

    const checkViewportAndLoad = () => {
      const heroElement = document.querySelector('header') || document.body;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if ('requestIdleCallback' in window) {
                idleId = (window as any).requestIdleCallback(loadVideoSrc, { timeout: 3000 });
              } else {
                idleId = (setTimeout(loadVideoSrc, 300) as unknown) as number;
              }
              observer?.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );

      observer.observe(heroElement);
    };

    const initTimeout = setTimeout(checkViewportAndLoad, 100);

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

  useEffect(() => {
    if (!shouldLoadSrc || !videoRef.current) return;

    const video = videoRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as any).connection && (navigator as any).connection.saveData;
    if (prefersReducedMotion || saveData) return;

    // safe play wrapper
    function safePlay() {
      try {
        const p = video.play();
        if (p && typeof (p as any).then === 'function') {
          (p as any).catch(() => {
            // autoplay blocked; keep poster
          });
        }
      } catch (_) {
        // ignore
      }
    }

    let timeoutId: number | null = null;

    function startVideo() {
      // enable preload and start loading
      video.preload = 'auto';
      // call load to kickstart some browsers
      try {
        video.load();
      } catch {}

      const onCanPlay = () => {
        safePlay();
      };

      const onPlaying = () => {
        setIsPlaying(true);
        // fade out poster if present
        if (posterRef.current) {
          posterRef.current.style.transition = 'opacity 300ms ease';
          posterRef.current.style.opacity = '0';
        }
        video.style.transition = 'opacity 300ms ease';
        video.style.opacity = '1';
        cleanup();
      };

      const cleanup = () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('playing', onPlaying);
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      };

      video.addEventListener('canplay', onCanPlay, { once: true });
      video.addEventListener('playing', onPlaying, { once: true });

      // timeout fallback
      timeoutId = (setTimeout(() => {
        cleanup();
      }, 3500) as unknown) as number;
    }

    // start after first paint / idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(startVideo, { timeout: 1500 });
    } else {
      setTimeout(startVideo, 300);
    }

    // Pause when tab hidden
    const onVis = () => {
      if (document.visibilityState !== 'visible') {
        try { video.pause(); } catch {}
      }
    };
    document.addEventListener('visibilitychange', onVis);

    // cleanup
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      try { video.pause(); } catch {}
    };
  }, [shouldLoadSrc]);

  return (
    <div aria-hidden="true">
      <img
        ref={posterRef}
        src="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/videos/background-poster.jpg"
        alt=""
        decoding="async"
        loading="eager"
        className="bg-video-poster"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <video
        ref={videoRef}
        className="bg-video"
        muted
        loop
        playsInline
        disablePictureInPicture
        controlsList="nodownload noremoteplayback"
        preload="none"
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0 }}
      >
        {shouldLoadSrc && (
          <>
            <source src="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/videos/background-mobile.mp4" type="video/mp4" media="(max-width: 768px)" />
            <source src="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/videos/background-desktop.mp4" type="video/mp4" media="(min-width: 769px)" />
          </>
        )}
      </video>
      <div className="bg-video-overlay" aria-hidden="true" style={{ position: 'fixed', inset: 0 }} />
    </div>
  );
}
