"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Image from 'next/image';
import { animationCoordinator } from "../lib/AnimationCoordinator";

type Partner = {
  name: string;
  image: string;
};

export default function PartnerAutoScrollStrip({ partners }: { partners: Partner[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const speed = 60; // px/s
    let isVisible = true;
    let isTabVisible = !document.hidden;
    let isAnimationActive = true;

    const updateWidth = () => {
      const firstSetWidth = Math.max(1, track.scrollWidth / 2);
      const duration = firstSetWidth / speed;
      track.style.setProperty("--scroll-width", `${firstSetWidth}px`);
      track.style.setProperty("--scroll-offset", `${-firstSetWidth}px`);
      track.style.setProperty("--scroll-duration", `${duration}s`);
    };

    const applyAnimationState = () => {
      const shouldRun = isVisible && isTabVisible && isAnimationActive;
      track.setAttribute("data-auto-scroll", "true");
      track.style.animationPlayState = shouldRun ? "running" : "paused";
    };

    const imgNodes = Array.from(track.querySelectorAll("img"));
    imgNodes.forEach((img) => {
      if (!img.complete) img.addEventListener("load", updateWidth, { once: true });
    });

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateWidth, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true } as AddEventListenerOptions);
    requestAnimationFrame(updateWidth);
    updateWidth();

    // IntersectionObserver to pause when out of viewport
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

    // Pause when tab hidden
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      applyAnimationState();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Subscribe to animation coordinator
    const unsubscribe = animationCoordinator.subscribe((state) => {
      isAnimationActive = state === "active";
      applyAnimationState();
    });

    applyAnimationState();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribe();
      track.removeAttribute("data-auto-scroll");
      track.style.animationPlayState = "";
      track.style.transform = "";
      track.style.removeProperty("--scroll-width");
      track.style.removeProperty("--scroll-offset");
      track.style.removeProperty("--scroll-duration");
    };
  }, [partners]);

  // Memoize to prevent unnecessary recreations
  const renderItems = useCallback((items: Partner[]) =>
    items.map((p, idx) => (
      <div key={`${p.name}-${idx}`} className="w-fit">
        <div className="partner-card partner-strip-card relative">
          <Image
            src={p.image}
            alt={p.name}
            width={120}
            height={60}
            className="object-contain"
            sizes="120px"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    )), []);

  return (
    <div className="scroll-strip mt-6" ref={containerRef}>
      <div className="scroll-track" ref={trackRef}>
        {renderItems(partners)}
        {renderItems(partners)}
      </div>
    </div>
  );
}
