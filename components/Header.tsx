"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { animationCoordinator } from "../lib/AnimationCoordinator";
import ContactPopover from "./ContactPopover";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [canBlur, setCanBlur] = useState(true); // Disable blur during interactions

  useEffect(() => {
    // Check if desktop (>= 768px)
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia('(min-width: 768px)').matches);
    };
    checkDesktop();

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleMediaChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);

    // Track scroll
    let rafId: number;
    const handleScroll = () => {
      const shouldBlur = window.scrollY > 10;
      if (shouldBlur !== scrolled) {
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
  }, [scrolled]);

  return (
    <header className={`sticky top-0 z-40 bg-transparent/60 ${scrolled && isDesktop && canBlur ? 'backdrop-blur-sm' : ''}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-16">
        <Link href="/" className="group flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold tracking-[0.2em] text-[color:var(--foreground)] shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition group-hover:border-white/20">
            PM
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--muted)]">
              Composer
            </span>
            <span className="text-base font-semibold text-[color:var(--foreground)]">
              Pietro Montanti
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[color:var(--muted)] sm:flex">
          <Link href="#work" className="transition hover:text-[color:var(--foreground)]">
            Projects
          </Link>
          <Link href="#servizi" className="transition hover:text-[color:var(--foreground)]">
            Services
          </Link>
          <ContactPopover
            buttonLabel="Contact"
            buttonClassName="appearance-none bg-transparent rounded-full border border-black/10 px-4 py-2 text-[color:var(--foreground)] transition hover:border-black/30"
          />
        </nav>
      </div>
    </header>
  );
}
