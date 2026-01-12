"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import { animationCoordinator } from "../lib/AnimationCoordinator";
import { useLanguage } from "../lib/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { t } = useLanguage();
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
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <div className="ml-2 sm:ml-4">
          {!isHome && (
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ display: 'block' }}>
                <path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2L8 1z" />
              </svg>
              <span className="hidden sm:inline">{t("Home", "Home")}</span>
            </Link>
          )}
        </div>
        <nav className="flex h-full items-center gap-6 text-sm text-[color:var(--muted)]">
          <Link href="/#showreel" className="transition hover:text-[color:var(--foreground)]">
            {t("Showreel", "Showreel")}
          </Link>
          <Link href="/portfolio" prefetch={true} className="transition hover:text-[color:var(--foreground)]">
            {t("Portfolio", "Portfolio")}
          </Link>
          <Link href="/case-studies" prefetch={true} className="transition hover:text-[color:var(--foreground)]">
            {t("Case Studies", "Case Studies")}
          </Link>
          <Link href="/about" prefetch={true} className="transition hover:text-[color:var(--foreground)]">
            {t("Chi sono", "About")}
          </Link>
          <Link href="/#contact" className="transition hover:text-[color:var(--foreground)]">
            {t("Contatti", "Contact")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}

export default memo(Header);
