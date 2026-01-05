"use client";
import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react";
import { animationCoordinator } from "../lib/AnimationCoordinator";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [canBlur, setCanBlur] = useState(true);
  const scrolledRef = useRef(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
    };
    checkDesktop();

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleMediaChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

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

    window.addEventListener("scroll", onScroll, { passive: true });

    const unsubscribe = animationCoordinator.subscribe((state) => {
      setCanBlur(state === "active");
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      mediaQuery.removeEventListener("change", handleMediaChange);
      if (rafId) cancelAnimationFrame(rafId);
      unsubscribe();
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full bg-transparent/60 transition ${scrolled && isDesktop && canBlur ? "backdrop-blur-sm" : ""}`}
      style={{
        height: "var(--header-height)",
        contain: "layout style paint",
        transform: "translateZ(0)"
      }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-end gap-6 px-6 sm:px-10 lg:px-16">
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
    </header>
  );
}

export default memo(Header);
