"use client";

import { memo } from "react";
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from "../lib/LanguageContext";
import { getTagTranslation } from "../lib/translations";

type PosterProps = {
  title: string;
  year?: string;
  tag?: string;
  image?: string;
  href?: string;
  onClick?: () => void;
};

function PosterCard({ title, year, tag, image, href, onClick }: PosterProps) {
  const { t, language } = useLanguage();
  const normalized = title ? title.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const isFreak =
    normalized.includes("freakshakespeare") || (title || "").toLowerCase().includes("freak shakespeare");
  const safeImage = image ?? undefined;
  const displayTag = tag ? getTagTranslation(tag, language) : undefined;
  const displayYear = year ? getTagTranslation(String(year), language) : year;
  const isComingSoon = [tag, year]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes("coming"));
  // image styling is handled in CSS classes (grid vs strip views)

  const cardClassName = `poster-card group${isFreak ? " poster-card-freak" : ""}${
    isComingSoon ? " poster-card-coming-soon" : ""
  }`;

  const renderPosterImage = () => {
    const comingSoonLabel = t("PROSSIMAMENTE", "COMING SOON");

    if (isComingSoon) {
      return (
        <div className="poster-image mt-4 relative poster-placeholder" aria-hidden>
          {safeImage ? (
            <Image
              src={safeImage}
              alt={title}
              width={400}
              height={600}
              className="poster-img poster-img-coming-soon"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <div className="poster-placeholder-inner">
            <div className="poster-placeholder-tag">{comingSoonLabel}</div>
          </div>
        </div>
      );
    }

    if (safeImage) {
      return (
        <div className="poster-image mt-4 relative">
          <Image
            src={safeImage}
            alt={title}
            width={400}
            height={600}
            className="poster-img"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            decoding="async"
          />
        </div>
      );
    }

    return (
      <div className="poster-image mt-4 poster-placeholder">
        <div className="poster-placeholder-inner">
          <div className="poster-placeholder-title">{title}</div>
          <div className="poster-placeholder-tag">{displayTag ?? t("Prossimamente", "Coming Soon")}</div>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (isComingSoon) return null;
    const footerItems: string[] = [];
    if (displayYear) footerItems.push(displayYear);
    if (displayTag && displayTag !== displayYear) footerItems.push(displayTag);

    return (
      <div className="mt-6">
        <div className="poster-title">{title}</div>
        <div className="poster-footer mt-5">
          {footerItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    );
  };

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cardClassName} aria-label={title}>
        {renderPosterImage()}
        {renderFooter()}
      </button>
    );
  }

  if (href) {
    if (href.startsWith("/")) {
      return (
        <Link href={href} prefetch={false} className={cardClassName} aria-label={title}>
          {renderPosterImage()}
          {renderFooter()}
        </Link>
      );
    }

    return (
      <a href={href} className={cardClassName} aria-label={title}>
        {renderPosterImage()}
        {renderFooter()}
      </a>
    );
  }

  return (
    <div className={cardClassName} aria-label={title}>
      {renderPosterImage()}
      {renderFooter()}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(PosterCard);
