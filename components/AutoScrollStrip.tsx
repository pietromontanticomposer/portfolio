"use client";

import React, { memo, useCallback, useEffect, useRef } from "react";
import PosterCard from "./PosterCard";
import { animationCoordinator } from "../lib/AnimationCoordinator";

type Poster = {
  slug: string;
  title: string;
  year?: string;
  tag?: string;
  image?: string;
  href?: string;
};

function AutoScrollStrip({ posters }: { posters: Poster[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isReducedMotion = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const speed = 72; // px/s fixed speed for consistent scroll
    let isAnimationActive = true;
    let isVisible = true;
    let isTabVisible = !document.hidden;

    const updateWidth = () => {
      const firstSetWidth = Math.max(1, track.scrollWidth / 2);
      const duration = firstSetWidth / speed;
      // Only update if values actually changed to prevent animation restart
      const currentOffset = track.style.getPropertyValue("--scroll-offset");
      const newOffset = `${-firstSetWidth}px`;
      if (currentOffset !== newOffset) {
        track.style.setProperty("--scroll-width", `${firstSetWidth}px`);
        track.style.setProperty("--scroll-offset", newOffset);
        track.style.setProperty("--scroll-duration", `${duration}s`);
      }
    };
    const scheduleUpdateWidth = () => {
      requestAnimationFrame(updateWidth);
    };

    const applyAnimationState = () => {
      if (isReducedMotion.current) {
        track.removeAttribute("data-auto-scroll");
        track.style.animationPlayState = "paused";
        track.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      track.setAttribute("data-auto-scroll", "true");
      const shouldRun = isVisible && isTabVisible && isAnimationActive;
      track.style.animationPlayState = shouldRun ? "running" : "paused";
    };

    const mediaQuery = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion.current = e.matches;
      applyAnimationState();
    };
    if (mediaQuery) {
      isReducedMotion.current = mediaQuery.matches;
      mediaQuery.addEventListener("change", handleMotionChange);
    }

    const imgNodes = Array.from(track.querySelectorAll("img"));
    imgNodes.forEach((img) => {
      if (!img.complete) img.addEventListener("load", scheduleUpdateWidth, { once: true });
    });

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(scheduleUpdateWidth, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true } as AddEventListenerOptions);
    requestAnimationFrame(updateWidth);

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          applyAnimationState();
        });
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(container);

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      applyAnimationState();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const unsubscribe = animationCoordinator.subscribe((state) => {
      isAnimationActive = state === "active";
      applyAnimationState();
    });

    applyAnimationState();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (mediaQuery) mediaQuery.removeEventListener("change", handleMotionChange);
      unsubscribe();
      if (track) {
        track.removeAttribute("data-auto-scroll");
        track.style.animationPlayState = "";
        track.style.transform = "";
        track.style.removeProperty("--scroll-width");
        track.style.removeProperty("--scroll-offset");
        track.style.removeProperty("--scroll-duration");
      }
    };
  }, [posters]);

  const renderItems = useCallback((items: Poster[]) => {
    return items.map((p, idx) => (
      <div key={`${p.slug}-${idx}`} className="w-fit">
        <div className="poster-wrapper">
          <PosterCard
            title={p.title}
            year={p.year}
            tag={p.tag}
            image={p.image}
            href={p.href}
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

export default memo(AutoScrollStrip);
