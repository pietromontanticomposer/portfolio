"use client";

import { useLanguage } from "../../lib/LanguageContext";

type CookieRow = {
  name: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
};

const labelsData = {
  it: {
    title: "Cookie Policy",
    description:
      "Questa pagina elenca solo i cookie tecnici effettivamente impostati al primo caricamento.",
    lastCheck: "Ultimo controllo:",
    noCookies: "Nessun cookie tecnico rilevato al primo caricamento.",
    domain: "Dominio:",
    path: "Percorso:",
    secure: "Sicuro:",
    httpOnly: "HttpOnly:",
    sameSite: "SameSite:",
    yes: "Sì",
    no: "No",
    na: "N/D",
  },
  en: {
    title: "Cookie Policy",
    description:
      "This page lists only the technical cookies actually set on the first load.",
    lastCheck: "Last check:",
    noCookies: "No technical cookies detected on the first load.",
    domain: "Domain:",
    path: "Path:",
    secure: "Secure:",
    httpOnly: "HttpOnly:",
    sameSite: "SameSite:",
    yes: "Yes",
    no: "No",
    na: "N/A",
  },
};

type Props = {
  cookies: CookieRow[];
  generatedAt: string | null;
  scanError: string | null;
};

export default function CookiePolicyClient({
  cookies,
  generatedAt,
  scanError,
}: Props) {
  const { language } = useLanguage();
  const labels = labelsData[language];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="section-title text-3xl text-[color:var(--foreground)]">
        {labels.title}
      </h1>
      <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
        {labels.description}
      </p>
      {generatedAt ? (
        <p className="mt-2 text-xs text-[color:var(--muted)]">
          {labels.lastCheck} {generatedAt}
        </p>
      ) : null}

      {scanError ? (
        <p className="mt-6 text-sm text-[color:var(--muted)]">{scanError}</p>
      ) : cookies.length === 0 ? (
        <p className="mt-6 text-sm text-[color:var(--muted)]">
          {labels.noCookies}
        </p>
      ) : (
        <div className="mt-6 space-y-4 text-sm text-[color:var(--muted)]">
          {cookies.map((cookie) => (
            <div
              key={`${cookie.name}-${cookie.domain}`}
              className="rounded-lg border border-white/10 p-3"
            >
              <div className="font-semibold text-[color:var(--foreground)]">
                {cookie.name}
              </div>
              <div>
                {labels.domain} {cookie.domain}
              </div>
              <div>
                {labels.path} {cookie.path}
              </div>
              <div>
                {labels.secure} {cookie.secure ? labels.yes : labels.no}
              </div>
              <div>
                {labels.httpOnly} {cookie.httpOnly ? labels.yes : labels.no}
              </div>
              <div>
                {labels.sameSite} {cookie.sameSite ?? labels.na}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
