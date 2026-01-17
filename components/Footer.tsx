"use client";

import Link from "next/link";
import ContactPopover from "./ContactPopover";
import { useLanguage } from "../lib/LanguageContext";

const CONTACT_EMAIL = "pietromontanticomposer@gmail.com";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer
      id="contact"
      className="mt-12 border-t border-black/10 bg-transparent px-6 py-10 sm:px-10 lg:px-16"
      style={{ contain: "layout style paint" }}
    >
      <div className="mx-auto max-w-7xl text-sm">

        {/* Desktop: three-column grid */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:items-start sm:gap-6">
          <div className="col-span-1">
            <div className="text-[color:var(--foreground)] font-semibold">Pietro Montanti</div>
            <div className="mt-1 text-[color:var(--foreground)] font-medium">{t("Compositore per Film e Media", "Composer for Film & Media")}</div>
            <div className="mt-1 mono text-xs text-[color:var(--foreground)] font-medium">{t("Italia · UE", "Italy · EU")}</div>
          </div>

          <div className="col-span-1 flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <ContactPopover
                buttonLabel={t("Contattami", "Contact Me")}
                buttonClassName="hero-btn hero-btn-secondary"
                panelId="contact-popover-footer-desktop"
              />
              <div className="text-xs text-[color:var(--muted)]">
                {CONTACT_EMAIL}
              </div>
            </div>
          </div>

          <div className="col-span-1 text-right">
            <div className="flex items-center justify-end">
              <a
                href="https://www.instagram.com/pietro_montanti_composer"
                aria-label="Instagram"
                className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="insta-title">
                  <title id="insta-title">Instagram</title>
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile: stacked (same content, stacked) */}
        <div className="sm:hidden flex flex-col gap-4 text-center items-center">
          <div className="flex flex-col items-center">
            <div className="text-[color:var(--foreground)] font-semibold">Pietro Montanti</div>
            <div className="mt-1 mono text-xs text-[color:var(--foreground)] font-medium">{t("Compositore per Film e Media — Italia · UE", "Composer for Film & Media — Italy · EU")}</div>
          </div>

          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <ContactPopover
                buttonLabel={t("Contattami", "Contact Me")}
                buttonClassName="hero-btn hero-btn-secondary"
                panelId="contact-popover-footer-mobile"
              />
              <div className="text-xs text-[color:var(--muted)]">
                {CONTACT_EMAIL}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <a
              href="https://www.instagram.com/pietro_montanti_composer"
              aria-label="Instagram"
              className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="insta-title-mobile">
                <title id="insta-title-mobile">Instagram</title>
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>

        {/* (Contact button moved into the desktop center column and mobile stack) */}

        {/* Legal row (centered) */}
        <div className="mt-6 border-t pt-4 text-xs text-[color:var(--muted)] flex flex-col items-center gap-3 text-center">
          <div className="font-medium">VAT 04593080239</div>
          <div className="font-medium">© 2025 Pietro Montanti</div>
          <div className="flex gap-4 justify-center">
            <Link href="/privacy-policy" prefetch={false} className="hover:underline">{t("Informativa Privacy", "Privacy Policy")}</Link>
            <Link href="/cookie-policy" prefetch={false} className="hover:underline">{t("Cookie Policy", "Cookie Policy")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
