"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type MoviePosterProps = {
  title: string;
  posterUrl: string | null;
  className?: string;
};

export default function MoviePoster({
  title,
  posterUrl,
  className = "",
}: MoviePosterProps) {
  const [hasError, setHasError] = useState(false);
  const { t } = useLanguage();
  const showPlaceholder = !posterUrl || hasError;
  const unavailable = t("posterUnavailable");

  if (showPlaceholder) {
    return (
      <div
        className={`flex aspect-[2/3] w-full items-center justify-center bg-neutral-900 text-muted ${className}`}
        aria-label={`${title} ${unavailable}`}
      >
        <span className="px-3 text-center text-xs tracking-wide">
          {unavailable}
        </span>
      </div>
    );
  }

  return (
    // External movie posters come from mixed hosts, so a plain img is simpler than next/image config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={posterUrl}
      alt={title}
      className={`aspect-[2/3] w-full object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  );
}
