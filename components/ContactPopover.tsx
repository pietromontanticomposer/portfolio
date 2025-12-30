"use client";

import React, { useEffect, useId, useRef, useState } from "react";

const EMAIL = "pietromontanticomposer@gmail.com";
const SUBJECT = "Project Inquiry";
const buildMailtoHref = () => {
  const subject = encodeURIComponent(SUBJECT);
  const body = encodeURIComponent("Hi Pietro,\n\nI would like to discuss a project.\n\nThanks,");
  return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
};

const buildGmailHref = () => {
  const subject = encodeURIComponent(SUBJECT);
  const body = encodeURIComponent("Hi Pietro,\n\nI would like to discuss a project.\n\nThanks,");
  return `https://mail.google.com/mail/u/0/?to=${encodeURIComponent(EMAIL)}&su=${subject}&body=${body}&tf=cm`;
};

const copyWithFallback = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // fall through to legacy copy
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.top = "-1000px";
  textarea.style.left = "-1000px";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  return ok;
};

type ContactPopoverProps = {
  buttonLabel?: string;
  buttonClassName?: string;
  panelClassName?: string;
  align?: "center" | "left" | "right";
};

export default function ContactPopover({
  buttonLabel = "Contact",
  buttonClassName,
  panelClassName,
  align = "center",
}: ContactPopoverProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    const success = await copyWithFallback(EMAIL);
    if (success) {
      setCopied(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const panelAlignment =
    align === "left"
      ? "left-0"
      : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  const buttonClasses = buttonClassName ?? "hero-btn hero-btn-secondary";

  return (
    <div className="relative inline-flex contact-popover" ref={wrapperRef}>
      <button
        type="button"
        className={buttonClasses}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        {buttonLabel}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Contact options"
          className={`absolute top-full z-50 mt-3 w-[min(92vw,360px)] rounded-2xl border border-white/10 bg-[color:var(--card)]/95 p-4 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-sm ${panelAlignment} ${panelClassName ?? ""}`}
        >
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground)] transition hover:bg-white/10"
            >
              {copied ? "Copiato" : "Copia email"}
            </button>
            <a
              href={buildMailtoHref()}
              className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground)] transition hover:bg-white/10"
            >
              Apri email
            </a>
            <a
              href={buildGmailHref()}
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground)] transition hover:bg-white/10"
            >
              Apri Gmail
            </a>
            <p className="pt-2 text-center text-xs text-[color:var(--muted)]" aria-live="polite">
              {EMAIL}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
