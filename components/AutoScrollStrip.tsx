"use client";

import React, { useEffect, useRef } from "react";
import PosterCard from "./PosterCard";

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

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // Ensure we have duplicated content so we can loop seamlessly
    // Use translateX to create infinite scroll effect (more reliable than scrollLeft).
    let lastTime: number | null = null;
    const speed = 72; // px/s fixed speed for consistent scroll
    let offset = 0;
    let currentSpeed = speed;
    let firstSetWidth = Math.max(1, track.scrollWidth / 2);

    const updateWidth = () => {
      firstSetWidth = Math.max(1, track.scrollWidth / 2);
    };

    const imgNodes = Array.from(track.querySelectorAll("img"));
    imgNodes.forEach((img) => {
      if (!img.complete) img.addEventListener("load", updateWidth, { once: true });
    });
    window.addEventListener("resize", updateWidth);
    requestAnimationFrame(updateWidth);

    function step(time: number) {
      if (lastTime === null) lastTime = time;
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Subtle easing to smooth frame-to-frame variation without changing average speed.
      currentSpeed += (speed - currentSpeed) * Math.min(1, delta * 8);
      offset += currentSpeed * delta;

      if (offset >= firstSetWidth) {
        offset -= firstSetWidth;
      }
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;

      rafRef.current = requestAnimationFrame(step);
    }

    // Start at 0
    track.style.transform = "translateX(0px)";
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", updateWidth);
      track.style.transform = "";
    };
  }, [posters]);

  // render two copies for seamlessness, using PosterCard so items are clickable
  const renderItems = (items: Poster[]) => (
    items.map((p, idx) => (
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
    ))
  );

  return (
    <div className="scroll-strip mt-6" ref={containerRef}>
      <div className="scroll-track" ref={trackRef}>
        {renderItems(posters)}
        {renderItems(posters)}
      </div>
    </div>
  );
}
