"use client";
import { useEffect, useRef, useState } from 'react';
import { animationCoordinator } from '../lib/AnimationCoordinator';

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
    let isIntersecting = false;
    let isAnimationAllowed = true;

    const tryPlay = () => {
      if (isIntersecting && !document.hidden && isAnimationAllowed) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    // Intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
          tryPlay();
        });
      },
      { threshold: 0.1 }
    );

    // Tab visibility
    const handleVisibilityChange = () => {
      tryPlay();
    };

    // Animation coordinator - pause video during user interactions
    const unsubscribe = animationCoordinator.subscribe((state) => {
      isAnimationAllowed = state === 'active';
      tryPlay();
    });

    observer.observe(video);
    // Try immediately in case the IntersectionObserver callback isn't
    // dispatched synchronously for this element — this helps start playback
    // on browsers that allow autoplay when muted.
    tryPlay();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribe();
    };
  }, [shouldLoadSrc]);

  return (
    <>
      <video
        ref={videoRef}
        className="bg-video"
        autoPlay
        preload="auto"
        muted
        loop
        playsInline
        disablePictureInPicture
        controlsList="nodownload noremoteplayback"
        poster="/background-poster.jpg"
        aria-hidden="true"
        style={{
          transform: 'translateZ(0)',
          willChange: 'auto'
        }}
      >
        {shouldLoadSrc && (
          <>
            <source src="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/videos/background.webm" type="video/webm" />
            <source src="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/videos/background.mp4" type="video/mp4" />
          </>
        )}
      </video>
      <div className="bg-video-overlay" aria-hidden="true" />
    </>
  );
}
