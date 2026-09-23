"use client";

import MoviePoster from "@/components/MoviePoster";
import MovieJournalActions from "@/components/MovieJournalActions";
import ExpandableOverview from "@/components/ExpandableOverview";
import type { CatalogMovie } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  creditLine,
  displayOriginalLine,
  displayOverview,
  displayTitle,
} from "@/lib/i18n/movieText";

type MovieSearchResultsProps = {
  movies: CatalogMovie[];
  onMessage: (message: string) => void;
  onError: (message: string) => void;
};

export default function MovieSearchResults({
  movies,
  onMessage,
  onError,
}: MovieSearchResultsProps) {
  const { language, t } = useLanguage();

  return (
    <ol className="mt-12 divide-y divide-border">
      {movies.map((movie) => {
        const title = displayTitle(movie, language);
        const original = displayOriginalLine(movie, language);
        const rating = movie.rating != null ? String(movie.rating) : "";
        const meta = [original, rating].filter(Boolean).join("  ·  ");

        return (
          <li key={movie.externalId} className="py-10 first:pt-0">
            <article className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-8">
              <MoviePoster title={title} posterUrl={movie.posterUrl} />
              <div className="min-w-0">
                <h2 className="text-xl font-medium tracking-tight sm:text-3xl">
                  {title}
                </h2>
                {meta && <p className="mt-2 text-sm text-muted">{meta}</p>}
                {creditLine(movie, language) && (
                  <p className="mt-2 text-sm text-muted">
                    {creditLine(movie, language)}
                  </p>
                )}
                <ExpandableOverview
                  text={displayOverview(movie, language, t("noSynopsis"))}
                />
                <MovieJournalActions
                  externalId={movie.externalId}
                  variant="ranking"
                  onMessage={onMessage}
                  onError={onError}
                />
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
