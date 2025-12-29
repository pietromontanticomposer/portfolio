"use client";
import { useEffect } from 'react';

let isScrolling = false;

export default function ScrollPerformance() {
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let rafId: number;

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        document.body.classList.add('is-scrolling');
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.body.classList.remove('is-scrolling');
      }, 150);
    };

    // Use RAF for better performance
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}

export { isScrolling };
