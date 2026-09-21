"use client";

import { useEffect, useState } from "react";
import MoviePoster from "@/components/MoviePoster";
import MovieJournalActions from "@/components/MovieJournalActions";
import ExpandableOverview from "@/components/ExpandableOverview";
import { apiFetch } from "@/lib/api";
import type { CatalogMovie } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionary";
import {
  creditLine,
  displayOriginalLine,
  displayOverview,
  displayTitle,
} from "@/lib/i18n/movieText";

type RankingTab =
  | "today"
  | "classic"
  | "recent"
  | "hidden-gems"
  | "top-rated";
type RegionFilter =
  | "all"
  | "asia"
  | "europe"
  | "north-america"
  | "latin-america"
  | "other";

const rankingTabs: { id: RankingTab; labelKey: MessageKey }[] = [
  { id: "today", labelKey: "rankingToday" },
  { id: "classic", labelKey: "rankingClassic" },
  { id: "recent", labelKey: "rankingRecent" },
  { id: "hidden-gems", labelKey: "rankingHidden" },
  { id: "top-rated", labelKey: "rankingTop" },
];

const regionOptions: { id: RegionFilter; labelKey: MessageKey }[] = [
  { id: "all", labelKey: "regionAll" },
  { id: "asia", labelKey: "regionAsia" },
  { id: "europe", labelKey: "regionEurope" },
  { id: "north-america", labelKey: "regionNorthAmerica" },
  { id: "latin-america", labelKey: "regionLatinAmerica" },
  { id: "other", labelKey: "regionOther" },
];

function yearOptions(
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
  now = new Date()
) {
  const current = now.getFullYear();
  const options = [{ value: "all", label: t("yearAll") }];

  options.push({
    value: String(current),
    label: t("yearLatest", { year: current }),
  });

  for (let year = current - 1; year >= 2020; year -= 1) {
    options.push({ value: String(year), label: String(year) });
  }

  for (const decade of [2010, 2000, 1990, 1980, 1970, 1960]) {
    options.push({
      value: `${decade}s`,
      label: t("yearDecade", { year: decade }),
    });
  }

  options.push({ value: "earlier", label: t("yearEarlier") });
  return options;
}

function rankingPath(tab: RankingTab) {
  return `/api/movies/rankings/${tab}`;
}

export default function DiscoverPage() {
  const { language, t } = useLanguage();
  const [tab, setTab] = useState<RankingTab>("today");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [year, setYear] = useState("all");
  const [movies, setMovies] = useState<CatalogMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRanking() {
      setIsLoading(true);
      setError("");
      setMessage("");

      try {
        const params = new URLSearchParams();

        if (region !== "all") {
          params.set("region", region);
        }

        if (year !== "all") {
          params.set("year", year);
        }

        const query = params.toString();
        const path = `${rankingPath(tab)}${query ? `?${query}` : ""}`;
        const data = await apiFetch<CatalogMovie[]>(path, {
          signal: controller.signal,
        });
        setMovies(data);
      } catch (loadError) {
        if (
          controller.signal.aborted ||
          (loadError instanceof DOMException && loadError.name === "AbortError")
        ) {
          return;
        }

        console.error(loadError);
        setMovies([]);
        setError(t("rankingLoadError"));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadRanking();

    return () => controller.abort();
  }, [tab, region, year, t]);

  const years = yearOptions(t);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("discoverTitle")}
      </h1>
      <p className="mt-3 text-sm text-muted">{t("discoverTagline")}</p>

      <section className="mt-10">
        <p className="text-xs tracking-[0.24em] text-muted">
          {t("rankingSection")}
        </p>
        <div className="-mx-4 mt-4 overflow-x-auto px-4">
          <div className="flex min-w-max gap-6 text-sm">
            {rankingTabs.map((item) => {
              const isActive = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-pressed={isActive}
                  className={`pb-2 tracking-wide whitespace-nowrap ${
                    isActive
                      ? "border-b border-foreground text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <p className="text-xs tracking-[0.24em] text-muted">
          {t("regionSection")}
        </p>
        <div className="-mx-4 mt-4 overflow-x-auto px-4">
          <div className="flex min-w-max gap-5 text-sm">
            {regionOptions.map((item) => {
              const isActive = region === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRegion(item.id)}
                  aria-pressed={isActive}
                  className={`pb-2 tracking-wide whitespace-nowrap ${
                    isActive
                      ? "border-b border-foreground text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <p className="text-xs tracking-[0.24em] text-muted">
          {t("yearSection")}
        </p>
        <label className="mt-4 block max-w-xs text-sm">
          <span className="sr-only">{t("yearSelect")}</span>
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="w-full border border-border bg-background px-3 py-2 text-foreground"
            style={{ colorScheme: "dark" }}
          >
            {years.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      {message && (
        <p className="mt-8 text-sm text-neutral-300" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-8 text-sm text-neutral-300" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-16 text-sm text-muted">{t("loading")}</p>
      ) : movies.length === 0 ? (
        <p className="mt-16 text-sm text-muted">{t("rankingEmpty")}</p>
      ) : (
        <ol className="mt-12 divide-y divide-border">
          {movies.map((movie, index) => {
            const title = displayTitle(movie, language);

            return (
              <li key={movie.externalId} className="py-10 first:pt-0">
                <article className="grid grid-cols-[auto_5.5rem_minmax(0,1fr)] items-start gap-5 sm:grid-cols-[4rem_7rem_minmax(0,1fr)] sm:gap-8">
                  <p className="font-mono text-2xl text-muted sm:text-4xl">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <MoviePoster title={title} posterUrl={movie.posterUrl} />
                  <div className="min-w-0">
                    <h2 className="text-xl font-medium tracking-tight sm:text-3xl">
                      {title}
                    </h2>
                    {displayOriginalLine(movie, language) && (
                      <p className="mt-2 text-sm text-muted">
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
                    />
                    <MovieJournalActions
                      externalId={movie.externalId}
                      variant="ranking"
                      onMessage={setMessage}
                      onError={setError}
                    />
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
