"use client";

import { useState } from "react";

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
  const showPlaceholder = !posterUrl || hasError;

  if (showPlaceholder) {
    return (
      <div
        className={`flex aspect-[2/3] w-full items-center justify-center bg-stone-200 text-stone-500 ${className}`}
        aria-label={`${title} 暂无海报`}
      >
        <span className="px-3 text-center text-sm">暂无海报</span>
      </div>
    );
  }

  return (
    // External movie posters come from mixed hosts, so a plain img is simpler than next/image config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={posterUrl}
      alt={`${title} 海报`}
      className={`aspect-[2/3] w-full object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  );
}
