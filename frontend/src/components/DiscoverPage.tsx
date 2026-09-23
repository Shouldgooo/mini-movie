"use client";

import { FormEvent, useEffect, useState, type MouseEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MoviePoster from "@/components/MoviePoster";
import MovieJournalActions from "@/components/MovieJournalActions";
import ExpandableOverview from "@/components/ExpandableOverview";
import MovieSearchResults from "@/components/MovieSearchResults";
import CollectionsSection from "@/components/CollectionsSection";
import { apiFetch } from "@/lib/api";
import type { CatalogMovie } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionary";
import { useMovieSearch } from "@/lib/useMovieSearch";
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

const rankingTabs: { id: RankingTab; labelKey: MessageKey }[] = [
  { id: "today", labelKey: "rankingToday" },
  { id: "classic", labelKey: "rankingClassic" },
  { id: "recent", labelKey: "rankingRecent" },
  { id: "hidden-gems", labelKey: "rankingHidden" },
  { id: "top-rated", labelKey: "rankingTop" },
];

function rankingPath(tab: RankingTab) {
  return `/api/movies/rankings/${tab}`;
}

export default function DiscoverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const urlQuery = searchParams.get("q") ?? "";
  const committedQuery = urlQuery.trim();
  const isSearchMode = committedQuery.length > 0;

  const [input, setInput] = useState(urlQuery);
  const [inputSource, setInputSource] = useState(urlQuery);
  const [tab, setTab] = useState<RankingTab>("today");
  const [movies, setMovies] = useState<CatalogMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [journalError, setJournalError] = useState("");

  const search = useMovieSearch(committedQuery);

  if (urlQuery !== inputSource) {
    setInputSource(urlQuery);
    setInput(urlQuery);
    setFormError("");
    setJournalError("");
    setMessage("");
  }

  useEffect(() => {
    if (isSearchMode) {
      return;
    }

    const controller = new AbortController();

    async function loadRanking() {
      setIsLoading(true);
      setError("");
      setMessage("");
      setJournalError("");

      try {
        const data = await apiFetch<CatalogMovie[]>(rankingPath(tab), {
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
  }, [tab, t, isSearchMode]);

  useEffect(() => {
    if (isSearchMode) {
      return;
    }

    if (window.location.hash !== "#collections") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("collections")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isSearchMode]);

  function goToSearch(query: string) {
    router.replace(`/discover?q=${encodeURIComponent(query)}`);
  }

  function clearSearch() {
    setInput("");
    setFormError("");
    setJournalError("");
    setMessage("");
    router.replace("/discover");
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed) {
      if (isSearchMode) {
        clearSearch();
        return;
      }

      setFormError(t("searchQueryRequired"));
      return;
    }

    setFormError("");
    setJournalError("");
    setMessage("");
    goToSearch(trimmed);
  }

  function handleSearchChange(value: string) {
    setInput(value);

    if (!value.trim() && isSearchMode) {
      clearSearch();
    }
  }

  function scrollToCollections() {
    document.getElementById("collections")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleCollectionsJump(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    if (isSearchMode) {
      setInput("");
      setFormError("");
      setJournalError("");
      setMessage("");
      router.replace("/discover#collections");
      return;
    }

    window.history.replaceState(null, "", "/discover#collections");
    scrollToCollections();
  }

  const displayError = isSearchMode
    ? formError || journalError || search.error
    : formError || error;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("discoverTitle")}
      </h1>
      <p className="mt-3 text-sm text-muted">{t("discoverTagline")}</p>

      <section className="mt-10">
        <p className="text-xs tracking-[0.24em] text-muted">
          {t("exploreSection")}
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="flex min-w-0 flex-wrap gap-x-6 gap-y-2 text-sm">
            {rankingTabs.map((item) => {
              const isActive = tab === item.id && !isSearchMode;

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
            <a
              href="/discover#collections"
              onClick={handleCollectionsJump}
              className="pb-2 text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              {t("collectionsJump")}
            </a>
          </div>
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full min-w-[16rem] items-end gap-3 sm:w-64 sm:flex-none lg:w-72"
          >
            <label htmlFor="discover-search" className="sr-only">
              {t("searchPlaceholder")}
            </label>
            <input
              id="discover-search"
              name="q"
              type="search"
              value={input}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={t("searchPlaceholder")}
              autoComplete="off"
              className="min-w-0 flex-1 border-b border-border bg-transparent py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="shrink-0 pb-2 text-sm underline-offset-4 hover:underline"
            >
              {t("searchAction")}
            </button>
          </form>
        </div>
      </section>

      {isSearchMode ? (
        <>
          <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-sm tracking-wide text-muted">
              {t("searchResults", { query: committedQuery })}
            </h2>
            <button
              type="button"
              onClick={clearSearch}
              className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              {t("searchClear")}
            </button>
          </div>

          {message && (
            <p className="mt-8 text-sm text-neutral-300" role="status">
              {message}
            </p>
          )}

          {displayError && (
            <p className="mt-8 text-sm text-neutral-300" role="alert">
              {displayError}
            </p>
          )}

          {search.isLoading ? (
            <p className="mt-16 text-sm text-muted">{t("loading")}</p>
          ) : search.movies.length === 0 && !search.error ? (
            <div className="mt-16 text-sm text-muted">
              <p>{t("searchEmpty")}</p>
              <p className="mt-2">{t("searchEmptyHint")}</p>
            </div>
          ) : search.movies.length > 0 ? (
            <MovieSearchResults
              movies={search.movies}
              onMessage={setMessage}
              onError={setJournalError}
            />
          ) : null}
        </>
      ) : (
        <>
          {message && (
            <p className="mt-8 text-sm text-neutral-300" role="status">
              {message}
            </p>
          )}

          {displayError && (
            <p className="mt-8 text-sm text-neutral-300" role="alert">
              {displayError}
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
                          text={displayOverview(
                            movie,
                            language,
                            t("noSynopsis")
                          )}
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

          <CollectionsSection />
        </>
      )}
    </main>
  );
}
