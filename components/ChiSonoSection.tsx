"use client";

import Image from "next/image";
import { useLanguage } from "../lib/LanguageContext";

// Tiny base64 placeholder for blur effect
const BLUR_PLACEHOLDER = "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADQAQCdASoQABQAPm0wkkWkIqGYBABABsSgCdMoAAArtL9/LVE8QAAA/vbP/6Hv6KL4vYGnk7w3/xvqF//0AB//+d/ygAAAAA==";

type ChiSonoSectionProps = {
  id?: string;
  imageSrc: string;
  bio: { it: string; en: string };
  cvHref?: string;
  quote?: { it: string; en: string };
  stats?: { it: Array<{ label: string; value: string }>; en: Array<{ label: string; value: string }> };
  skills?: { it: string[]; en: string[] };
  priorityImage?: boolean;
};

export default function ChiSonoSection({
  id,
  imageSrc,
  bio,
  cvHref,
  quote,
  stats,
  skills,
  priorityImage = false,
}: ChiSonoSectionProps) {
  const { t, language } = useLanguage();
  const bioText = language === "it" ? bio.it : bio.en;
  const paragraphs = bioText
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const currentStats = stats ? (language === "it" ? stats.it : stats.en) : undefined;
  const currentSkills = skills ? (language === "it" ? skills.it : skills.en) : undefined;

  return (
    <section id={id} className="w-full">
      <div className="card-shell p-6 sm:p-8">
        <div className="section-header flex items-center justify-between">
          <h3 className="section-title text-2xl text-[color:var(--foreground)]">
            {t("Chi sono", "About")}
          </h3>
        </div>
        <div className="bio-grid mt-6 gap-6">
          <div className="bio-photo">
            <Image
              src={imageSrc}
              alt="Pietro Montanti"
              width={480}
              height={600}
              className="h-full w-full object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 320px"
              priority={priorityImage}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
          />
        </div>
        <div className="flex flex-col gap-6">
          {quote && (
            <div className="border-l-2 border-[color:var(--accent)] pl-4 py-1">
              <p className="text-base italic text-[color:var(--foreground)] opacity-90">
                &ldquo;{language === "it" ? quote.it : quote.en}&rdquo;
              </p>
            </div>
          )}

          {currentStats && currentStats.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {currentStats.map((stat, index) => (
                <div
                  key={`${stat.label}-${index}`}
                  className="text-center"
                >
                  <div className="text-xl font-semibold text-[color:var(--accent)] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-[color:var(--muted-strong)] opacity-80">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p
                  key={`${paragraph.slice(0, 20)}-${index}`}
                  className="bio-text text-sm leading-relaxed text-[color:var(--muted-strong)]"
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="bio-text text-sm leading-relaxed text-[color:var(--muted-strong)]">
                {bioText}
              </p>
            )}
          </div>

          {currentSkills && currentSkills.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-[color:var(--muted-strong)] opacity-80 mb-3">
                {t("Specializzazioni", "Specializations")}
              </div>
              <div className="flex flex-wrap gap-2">
                {currentSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-3 py-1.5 text-xs rounded-full border border-[color:var(--card-border)] bg-[color:var(--card-inset-bg)] text-[color:var(--foreground)] opacity-80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cvHref && (
            <a
              href={cvHref}
              className="inline-flex text-sm text-[color:var(--muted-strong)] transition hover:text-[color:var(--foreground)] underline underline-offset-4"
            >
              {t("Scarica CV", "Download CV")}
            </a>
          )}
        </div>
      </div>
    </div>
    </section>
  );
}
