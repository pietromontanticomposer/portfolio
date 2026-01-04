"use client";
import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react";
import { animationCoordinator } from "../lib/AnimationCoordinator";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
      ? true
      : false
  );
  const [canBlur, setCanBlur] = useState(true);
  const scrolledRef = useRef(false);

  useEffect(() => {
    // Check if desktop (>= 768px)
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleMediaChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);

    // Optimized scroll handler - uses ref to avoid effect re-subscription
    let rafId: number;
    const handleScroll = () => {
      const shouldBlur = window.scrollY > 10;
      if (shouldBlur !== scrolledRef.current) {
        scrolledRef.current = shouldBlur;
        setScrolled(shouldBlur);
      }
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Disable blur during user interactions for better performance
    const unsubscribe = animationCoordinator.subscribe((state) => {
      setCanBlur(state === 'active');
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      mediaQuery.removeEventListener('change', handleMediaChange);
      if (rafId) cancelAnimationFrame(rafId);
      unsubscribe();
    };
  }, []); // Empty dependency - no re-subscription on scroll state change

  return (
    <header className={`sticky top-0 z-40 bg-transparent/60 ${scrolled && isDesktop && canBlur ? 'backdrop-blur-sm' : ''}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-16">
        <div className="ml-auto flex items-center gap-4">
          <nav className="hidden items-center gap-6 text-sm text-[color:var(--muted)] sm:flex">
            <Link href="/#showreel" className="transition hover:text-[color:var(--foreground)]">
              Showreel
            </Link>
            <Link href="/portfolio" className="transition hover:text-[color:var(--foreground)]">
              Portfolio
            </Link>
            <Link href="/case-studies" className="transition hover:text-[color:var(--foreground)]">
              Case Studies
            </Link>
            <Link href="/#about" className="transition hover:text-[color:var(--foreground)]">
              About
            </Link>
            <Link href="/#contact" className="transition hover:text-[color:var(--foreground)]">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
