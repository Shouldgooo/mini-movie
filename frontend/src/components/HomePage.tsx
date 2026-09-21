"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MovieJournalActions from "@/components/MovieJournalActions";
import ExpandableOverview from "@/components/ExpandableOverview";
import { apiFetch } from "@/lib/api";
import type { CatalogMovie } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  creditLine,
  displayOriginalLine,
  displayOverview,
  displayTitle,
} from "@/lib/i18n/movieText";

export default function HomePage() {
  const { language, t } = useLanguage();
  const [movie, setMovie] = useState<CatalogMovie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDaily() {
      try {
        const data = await apiFetch<CatalogMovie>("/api/movies/daily");
        setMovie(data);
      } catch (loadError) {
        console.error(loadError);
        setError(t("dailyLoadError"));
      } finally {
        setIsLoading(false);
      }
    }

    loadDaily();
  }, [t]);

  const artwork = movie?.backdropUrl || movie?.posterUrl || null;
  const title = movie ? displayTitle(movie, language) : "";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.28em] text-muted uppercase">
        {t("homeDaily")}
      </p>
      <p className="mt-3 text-sm text-muted">{t("homePrompt")}</p>

      {isLoading && <p className="mt-16 text-sm text-muted">{t("loading")}</p>}

      {error && (
        <p className="mt-16 text-sm text-neutral-300" role="alert">
          {error}
        </p>
      )}

      {movie && (
        <article className="mt-10">
          {artwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artwork}
              alt={t("stillAlt", { title })}
              className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
            />
          ) : (
            <div
              className="flex aspect-[16/9] w-full items-center justify-center bg-neutral-900 text-xs text-muted sm:aspect-[21/9]"
              aria-label={`${title} ${t("stillUnavailable")}`}
            >
              {t("stillUnavailable")}
            </div>
          )}

          <div className="mt-10 max-w-2xl sm:mt-14">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              {title}
            </h1>
            {displayOriginalLine(movie, language) && (
              <p className="mt-4 text-sm text-muted sm:text-base">
                {displayOriginalLine(movie, language)}
              </p>
            )}
            {creditLine(movie, language) && (
              <p className="mt-2 text-sm text-muted">
                {creditLine(movie, language)}
              </p>
            )}
            <ExpandableOverview
              text={displayOverview(movie, language, t("noSynopsis"))}
              collapsedLines={6}
              className="max-w-xl text-sm leading-7 text-neutral-200 sm:text-base"
            />

            {message && (
              <p className="mt-8 text-sm text-neutral-300" role="status">
                {message}
              </p>
            )}

            <MovieJournalActions
              externalId={movie.externalId}
              variant="home"
              onMessage={setMessage}
              onError={setError}
            />
          </div>
        </article>
      )}

      <p className="mt-20">
        <Link
          href="/discover"
          className="text-sm tracking-wide underline-offset-4 hover:underline"
        >
          {t("exploreMore")}
        </Link>
      </p>
    </main>
  );
}
