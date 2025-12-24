"use client";

import React, { useCallback, useEffect, useRef } from "react";
import PosterCard from "./PosterCard";
import { animationCoordinator } from "../lib/AnimationCoordinator";

type Poster = {
  slug: string;
  title: string;
  year?: string;
  tag?: string;
  image?: string;
};

export default function AutoScrollStrip({ posters }: { posters: Poster[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const isReducedMotion = useRef(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      isReducedMotion.current = e.matches;
      if (e.matches && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        if (trackRef.current) {
          trackRef.current.style.transform = 'translate3d(0, 0, 0)';
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track || isReducedMotion.current) return;

    // Ensure we have duplicated content so we can loop seamlessly
    // Use translateX to create infinite scroll effect (more reliable than scrollLeft).
    let lastTime: number | null = null;
    const speed = 72; // px/s fixed speed for consistent scroll
    let offset = 0;
    let currentSpeed = speed;
    let firstSetWidth = Math.max(1, track.scrollWidth / 2);
    let isVisible = true;
    let isTabVisible = !document.hidden;
    let isAnimationActive = true; // Controlled by AnimationCoordinator

    const updateWidth = () => {
      firstSetWidth = Math.max(1, track.scrollWidth / 2);
    };

    const imgNodes = Array.from(track.querySelectorAll("img"));
    imgNodes.forEach((img) => {
      if (!img.complete) img.addEventListener("load", updateWidth, { once: true });
    });

    // Use passive listener for better scroll performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateWidth, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true } as AddEventListenerOptions);
    requestAnimationFrame(updateWidth);

    // IntersectionObserver to pause when out of viewport
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (!isVisible) {
            lastTime = null; // Reset time to avoid jumps
          }
        });
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(container);

    // Pause when tab hidden
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (!isTabVisible) {
        lastTime = null;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Subscribe to animation coordinator, but DO NOT pause on hover
    const unsubscribe = animationCoordinator.subscribe(() => {
      // Ignore hover state for poster strip, always keep animation active
      isAnimationActive = true;
      // Optionally, you can still reset lastTime if needed
      if (!isAnimationActive) {
        lastTime = null;
      }
    });

    function step(time: number) {
      // Only animate if: reduced motion off, visible, tab active, AND coordinator allows
      if (!isReducedMotion.current && isVisible && isTabVisible && isAnimationActive) {
        if (lastTime === null) lastTime = time;
        const delta = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;

        // Subtle easing to smooth frame-to-frame variation without changing average speed.
        currentSpeed += (speed - currentSpeed) * Math.min(1, delta * 8);
        offset += currentSpeed * delta;

        if (offset >= firstSetWidth) {
          offset -= firstSetWidth;
        }

        // Use translate3d for GPU acceleration
        track!.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(step);
    }

    // Start at 0
    track.style.transform = "translate3d(0, 0, 0)";
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribe();
      if (track) track.style.transform = "";
    };
  }, [posters]);

  // render two copies for seamlessness, using PosterCard so items are clickable
  // Memoize to prevent unnecessary recreations
  const renderItems = useCallback((items: Poster[]) => {
    return items.map((p, idx) => (
      <div key={`${p.slug}-${idx}`} className="w-fit">
        <div className="poster-wrapper">
          <PosterCard
            title={p.title}
            year={p.year}
            tag={p.tag}
            image={p.image}
            href={`/portfolio/${p.slug}`}
          />
        </div>
      </div>
    ));
  }, []);

  return (
    <div className="scroll-strip mt-6" ref={containerRef}>
      <div className="scroll-track" ref={trackRef}>
        {renderItems(posters)}
        {renderItems(posters)}
      </div>
    </div>
  );
}
