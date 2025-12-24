"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Image from 'next/image';

type Partner = {
  name: string;
  image: string;
};

export default function PartnerAutoScrollStrip({ partners }: { partners: Partner[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    let lastTime: number | null = null;
    const speed = 60; // px/s
    let offset = 0;
    let currentSpeed = speed;
    let firstSetWidth = Math.max(1, track.scrollWidth / 2);
    let isVisible = true;
    let isTabVisible = !document.hidden;

    const updateWidth = () => {
      firstSetWidth = Math.max(1, track.scrollWidth / 2);
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

    // IntersectionObserver to pause when out of viewport
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (!isVisible) {
            lastTime = null;
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

    function step(time: number) {
      // Only animate if visible AND tab is active (scroll sempre)
      if (isVisible && isTabVisible) {
        if (lastTime === null) lastTime = time;
        const delta = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;

        currentSpeed += (speed - currentSpeed) * Math.min(1, delta * 8);
        offset += currentSpeed * delta;

        if (offset >= firstSetWidth) {
          offset -= firstSetWidth;
        }
        track!.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(step);
    }

    track.style.transform = "translate3d(0, 0, 0)";
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      track.style.transform = "";
    };
  }, [partners]);

  // Memoize to prevent unnecessary recreations
  const renderItems = useCallback((items: Partner[]) =>
    items.map((p, idx) => (
      <div key={`${p.name}-${idx}`} className="w-fit">
        <div className="partner-strip-card relative">
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
