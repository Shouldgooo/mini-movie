"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { CatalogMovie } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function searchMoviesPath(query: string) {
  return `/api/movies/search?query=${encodeURIComponent(query)}`;
}

type SearchResult = {
  query: string;
  movies: CatalogMovie[];
  error: string;
};

export function useMovieSearch(query: string) {
  const { t } = useLanguage();
  const committedQuery = query.trim();
  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (!committedQuery) {
      return;
    }

    const controller = new AbortController();

    async function loadSearch() {
      try {
        const data = await apiFetch<CatalogMovie[]>(
          searchMoviesPath(committedQuery),
          { signal: controller.signal }
        );

        if (controller.signal.aborted) {
          return;
        }

        setResult({ query: committedQuery, movies: data, error: "" });
      } catch (loadError) {
        if (
          controller.signal.aborted ||
          (loadError instanceof DOMException && loadError.name === "AbortError")
        ) {
          return;
        }

        console.error(loadError);
        setResult({
          query: committedQuery,
          movies: [],
          error: t("searchFailed"),
        });
      }
    }

    loadSearch();

    return () => controller.abort();
  }, [committedQuery, t]);

  const matched = result?.query === committedQuery ? result : null;

  return {
    movies: matched?.movies ?? [],
    isLoading: Boolean(committedQuery) && !matched,
    error: matched?.error ?? "",
  };
}
