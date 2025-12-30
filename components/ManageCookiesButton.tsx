"use client";

import React, { useEffect, useState } from "react";

type Mode = "iubenda" | "cookiebot" | "complianz" | "fallback";

const detectMode = (): Mode => {
  if (typeof window === "undefined") return "fallback";
  const w = window as typeof window & {
    _iub?: unknown;
    Cookiebot?: { renew?: () => void };
    cmplz?: unknown;
    cmplz_setup?: unknown;
  };

  if (typeof w._iub !== "undefined") return "iubenda";
  if (typeof w.Cookiebot?.renew === "function") return "cookiebot";

  const hasComplianz =
    typeof w.cmplz !== "undefined" ||
    typeof w.cmplz_setup !== "undefined" ||
    !!document.querySelector('script[src*="complianz"]');

  return hasComplianz ? "complianz" : "fallback";
};

export default function ManageCookiesButton({ className }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("fallback");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMode(detectMode());
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const openCookieSettings = () => {
    if (typeof window === "undefined") {
      setIsOpen(true);
      return "fallback";
    }
    const w = window as typeof window & {
      _iub?: unknown;
      Cookiebot?: { renew?: () => void };
      cmplz?: unknown;
      cmplz_setup?: unknown;
    };

    if (typeof w._iub !== "undefined") return "iubenda";
    if (typeof w.Cookiebot?.renew === "function") {
      w.Cookiebot.renew();
      return "cookiebot";
    }

    const hasComplianz =
      typeof w.cmplz !== "undefined" ||
      typeof w.cmplz_setup !== "undefined" ||
      !!document.querySelector('script[src*="complianz"]');

    if (hasComplianz) return "complianz";

    setIsOpen(true);
    return "fallback";
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    openCookieSettings();
  };

  const baseClass = `bg-transparent p-0 text-inherit ${className ?? ""}`;
  const isLink = mode === "iubenda" || mode === "complianz";
  const modeClass =
    mode === "iubenda"
      ? "iubenda-cs-preferences-link"
      : mode === "complianz"
        ? "cmplz-show-banner"
        : "";
  const finalClassName = `${baseClass} ${modeClass}`.trim();

  return (
    <>
      {isLink ? (
        <a href="#" role="button" className={finalClassName} onClick={handleClick}>
          Manage cookies
        </a>
      ) : (
        <button type="button" className={baseClass} onClick={handleClick}>
          Manage cookies
        </button>
      )}

      {isOpen ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Cookie settings"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div className="modal-panel">
            <div className="modal-header">
              <h2 className="modal-title">Cookie Settings</h2>
              <button type="button" className="modal-close" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>
            <div className="mt-4 text-sm text-[color:var(--muted)]">
              Cookie preferences are not configured yet. Please contact us to update your consent preferences.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
