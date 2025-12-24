"use client";
import { useEffect, useRef, useState } from 'react';

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadSrc, setShouldLoadSrc] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let idleId: number | null = null;
    let observer: IntersectionObserver | null = null;

    const loadVideoSrc = () => {
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;
      setShouldLoadSrc(true);
    };

    // Only load video if hero is in viewport AND idle
    const checkViewportAndLoad = () => {
      // Check if hero/top of page is visible
      const heroElement = document.querySelector('header') || document.body;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Hero is visible, now wait for idle
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
    };

    // Start check after a brief delay to let page settle
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

    // Play/pause based on visibility + tab visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !document.hidden) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else if (videoRef.current) {
        const rect = video.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          video.play().catch(() => {});
        }
      }
    };

    observer.observe(video);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldLoadSrc]);

  return (
    <>
      <video
        ref={videoRef}
        className="bg-video"
        {...(shouldLoadSrc ? { src: "/background.mp4" } : {})}
        muted
        loop
        playsInline
        disablePictureInPicture
        controlsList="nodownload noremoteplayback"
        preload="none"
        poster="/background-poster.jpg"
        aria-hidden="true"
        style={{
          transform: 'translateZ(0)',
          willChange: 'auto'
        }}
      />
      <div className="bg-video-overlay" aria-hidden="true" />
    </>
  );
}
