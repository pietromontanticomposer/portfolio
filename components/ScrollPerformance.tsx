"use client";
import { useEffect } from 'react';

let isScrolling = false;

export default function ScrollPerformance() {
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    let ticking = false;

    const handleScroll = () => {
      ticking = false;

      if (!isScrolling) {
        isScrolling = true;
        document.body.classList.add('is-scrolling');
      }

      clearTimeout(scrollTimeout);
      // Aggressive debounce for maximum performance
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.body.classList.remove('is-scrolling');
      }, 100);
    };

    // Throttled scroll using ticking flag - more efficient than RAF cancel/request
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(handleScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return null;
}

export { isScrolling };
