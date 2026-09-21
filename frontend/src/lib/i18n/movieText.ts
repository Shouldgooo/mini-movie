import type { CatalogMovie } from "@/lib/types";
import type { Language } from "@/lib/i18n/dictionary";

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function firstText(
  ...values: Array<string | null | undefined>
): string | null {
  for (const value of values) {
    if (hasText(value)) {
      return value!.trim();
    }
  }

  return null;
}

export function displayTitle(movie: CatalogMovie, language: Language) {
  if (language === "en") {
    return movie.titleEn || movie.titleOriginal || movie.titleZh;
  }

  return movie.titleZh;
}

export function displayOriginalLine(movie: CatalogMovie, language: Language) {
  const year = movie.releaseYear;
  const primary = displayTitle(movie, language);

  if (language === "en") {
    const original = movie.titleOriginal || movie.titleZh;
    const usefulOriginal =
      hasText(original) && original !== primary ? original : null;
    return [usefulOriginal, year].filter(Boolean).join("  ·  ");
  }

  const secondary = movie.titleEn || movie.titleOriginal;
  const usefulSecondary =
    hasText(secondary) && secondary !== primary ? secondary : null;
  return [usefulSecondary, year].filter(Boolean).join("  ·  ");
}

export function displayOverview(
  movie: CatalogMovie,
  language: Language,
  fallback: string
) {
  if (language === "en") {
    const english = movie.overviewEn?.trim();
    if (english && english !== "暂无简介") {
      return english;
    }

    const chinese = movie.overviewZh?.trim() || movie.overview.trim();
    if (chinese && chinese !== "暂无简介") {
      return chinese;
    }

    return fallback;
  }

  const chinese = movie.overviewZh?.trim() || movie.overview.trim();
  if (chinese) {
    return chinese === "暂无简介" ? fallback : chinese;
  }

  const english = movie.overviewEn?.trim();
  if (english) {
    return english;
  }

  return fallback;
}

export function displayDirector(movie: CatalogMovie, language: Language) {
  if (language === "en") {
    return firstText(movie.directorEn);
  }

  return firstText(movie.directorZh, movie.director, movie.directorEn);
}

export function displayCountries(movie: CatalogMovie, language: Language) {
  if (language === "en") {
    if (movie.countriesEn && movie.countriesEn.length > 0) {
      return movie.countriesEn;
    }

    return [];
  }

  if (movie.countriesZh && movie.countriesZh.length > 0) {
    return movie.countriesZh;
  }

  return (movie.countries ?? []).filter(Boolean);
}

export function creditLine(movie: CatalogMovie, language: Language) {
  return [displayDirector(movie, language), displayCountries(movie, language).join(" / ")]
    .filter(Boolean)
    .join("  ·  ");
}
