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
            <div className="flex items-center justify-end gap-4">
              <a
                href="https://www.instagram.com/pietro_montanti_composer"
                aria-label="Instagram"
                className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="insta-title">
                  <title id="insta-title">Instagram</title>
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
                </svg>
              </a>
              <a
                href="https://www.imdb.com/it/name/nm14528995/?ref_=fn_t_1"
                aria-label="IMDb"
                className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="imdb-title">
                  <title id="imdb-title">IMDb</title>
                  <rect width="32" height="32" rx="4" fill="currentColor"/>
                  <path d="M5 8h2.4v16H5V8zm4.8 0l1.9 8.9.8-4.5.8-4.4h3.6v16h-2.4v-10.2l-1.7 7.2H11l-1.6-7.2v10.2H7V8h2.8zm9.2 0h3.6c1.2 0 2.1.4 2.7 1.1.5.6.8 1.7.9 3.2v9.4c-.1 1.5-.4 2.6-.9 3.2-.6.7-1.5 1.1-2.7 1.1H19V8zm2.4 2.2v11.6c.8.1 1.3-.1 1.5-.7.1-.3.2-1.1.2-2.3V13c0-1.4-.1-2.3-.2-2.7-.2-.5-.7-.8-1.5-.7v.6zm5.2-2.2h3.2c1 0 1.8.3 2.3.8.4.4.6 1.1.6 2.2v2.6c0 1-.3 1.7-.9 2.1.8.5 1.2 1.4 1.2 2.7v3.2c0 1.1-.2 1.9-.7 2.4-.5.5-1.3.8-2.4.8h-3.3V8zm2.4 2v4.6c.7 0 1.1-.4 1.1-1.2V11c0-.7-.4-1-1.1-1zm0 6.4v5.4c.8.1 1.2-.3 1.2-1.2v-2.8c0-1-.4-1.4-1.2-1.4z" fill="var(--background)"/>
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

          <div className="flex justify-center gap-4">
            <a
              href="https://www.instagram.com/pietro_montanti_composer"
              aria-label="Instagram"
              className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="insta-title-mobile">
                <title id="insta-title-mobile">Instagram</title>
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
              </svg>
            </a>
            <a
              href="https://www.imdb.com/it/name/nm14528995/?ref_=fn_t_1"
              aria-label="IMDb"
              className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="imdb-title-mobile">
                <title id="imdb-title-mobile">IMDb</title>
                <rect width="32" height="32" rx="4" fill="currentColor"/>
                <path d="M5 8h2.4v16H5V8zm4.8 0l1.9 8.9.8-4.5.8-4.4h3.6v16h-2.4v-10.2l-1.7 7.2H11l-1.6-7.2v10.2H7V8h2.8zm9.2 0h3.6c1.2 0 2.1.4 2.7 1.1.5.6.8 1.7.9 3.2v9.4c-.1 1.5-.4 2.6-.9 3.2-.6.7-1.5 1.1-2.7 1.1H19V8zm2.4 2.2v11.6c.8.1 1.3-.1 1.5-.7.1-.3.2-1.1.2-2.3V13c0-1.4-.1-2.3-.2-2.7-.2-.5-.7-.8-1.5-.7v.6zm5.2-2.2h3.2c1 0 1.8.3 2.3.8.4.4.6 1.1.6 2.2v2.6c0 1-.3 1.7-.9 2.1.8.5 1.2 1.4 1.2 2.7v3.2c0 1.1-.2 1.9-.7 2.4-.5.5-1.3.8-2.4.8h-3.3V8zm2.4 2v4.6c.7 0 1.1-.4 1.1-1.2V11c0-.7-.4-1-1.1-1zm0 6.4v5.4c.8.1 1.2-.3 1.2-1.2v-2.8c0-1-.4-1.4-1.2-1.4z" fill="var(--background)"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Legal row (centered) */}
        <div className="mt-6 border-t pt-4 text-xs text-[color:var(--muted)] flex flex-col items-center gap-3 text-center">
          <div className="font-medium">{t("P.IVA 04593080239", "VAT 04593080239")}</div>
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
