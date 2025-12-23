import React from "react";
import Link from 'next/link'

type PosterProps = {
  title: string;
  year?: string;
  tag?: string;
  image?: string;
  href?: string;
  onClick?: () => void;
};

export default function PosterCard({ title, year, tag, image, href = "#", onClick }: PosterProps) {
  const normalized = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const isFreak = normalized.includes('freakshakespeare') || (title || '').toLowerCase().includes('freak shakespeare');
  const safeImage = image ? encodeURI(image).replace(/'/g, "%27") : undefined;
  // image styling is handled in CSS classes (grid vs strip views)

  const commonProps = {
    className: `poster-card group${isFreak ? " poster-card-freak" : ""}`,
    'aria-label': title,
    style: undefined as React.CSSProperties | undefined,
  };

  const renderPosterImage = () => {
    if (safeImage) {
      return (
        <div className="poster-image mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={safeImage} alt={title} loading="lazy" decoding="async" className="poster-img" />
        </div>
      );
    }

    return (
      <div className="poster-image mt-4 poster-placeholder">
        <div className="poster-placeholder-inner">
          <div className="poster-placeholder-title">{title}</div>
          <div className="poster-placeholder-label">Poster</div>
          <div className="poster-placeholder-tag">Coming Soon</div>
        </div>
      </div>
    );
  };

  if (onClick) {
    return (
      <button type="button" onClick={onClick} {...commonProps}>
        {renderPosterImage()}

        <div className="mt-6">
          <div className="poster-title">{title}</div>
          <div className="poster-footer mt-5">
            <span>{year}</span>
            <span>{tag}</span>
          </div>
        </div>
      </button>
    );
  }

  // Use Next.js Link for internal navigation to enable client-side routing
  if (href && href.startsWith('/')) {
    return (
      <Link href={href} className={`poster-card group${isFreak ? " poster-card-freak" : ""}`} aria-label={title}>
        {renderPosterImage()}

        <div className="mt-6">
          <div className="poster-title">{title}</div>
          <div className="poster-footer mt-5">
            <span>{year}</span>
            <span>{tag}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <a href={href} className={`poster-card group${isFreak ? " poster-card-freak" : ""}`} aria-label={title}>
      {renderPosterImage()}

      <div className="mt-6">
        <div className="poster-title">{title}</div>
        <div className="poster-footer mt-5">
          <span>{year}</span>
          <span>{tag}</span>
        </div>
      </div>
    </a>
  );
}
