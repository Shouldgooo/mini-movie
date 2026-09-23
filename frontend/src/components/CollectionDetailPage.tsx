"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MoviePoster from "@/components/MoviePoster";
import MovieJournalActions from "@/components/MovieJournalActions";
import ExpandableOverview from "@/components/ExpandableOverview";
import RestrictionMetadata from "@/components/RestrictionMetadata";
import { ApiError, apiFetch } from "@/lib/api";
import type {
  CatalogMovie,
  CollectionDetail,
  RestrictedMainlandMovie,
} from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  creditLine,
  displayOriginalLine,
  displayOverview,
  displayTitle,
} from "@/lib/i18n/movieText";

function isRestrictedMovie(
  movie: CatalogMovie | RestrictedMainlandMovie
): movie is RestrictedMainlandMovie {
  return "restrictionStatus" in movie && "restrictionSources" in movie;
}

function collectionMetaLine(collection: CollectionDetail, english: boolean) {
  const countries = english
    ? collection.countriesEn ?? collection.countriesZh ?? []
    : collection.countriesZh ?? [];
  const period = english
    ? collection.periodEn ?? collection.periodZh
    : collection.periodZh;
  return [countries.join(" / "), period].filter(Boolean).join("  ·  ");
}

export default function CollectionDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { language, t } = useLanguage();
  const english = language === "en";
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCollection() {
      setIsLoading(true);
      setError("");
      setNotFound(false);

      try {
        const data = await apiFetch<CollectionDetail>(
          `/api/collections/${slug}`,
          { signal: controller.signal }
        );
        setCollection(data);
      } catch (loadError) {
        if (
          controller.signal.aborted ||
          (loadError instanceof DOMException && loadError.name === "AbortError")
        ) {
          return;
        }

        console.error(loadError);
        setCollection(null);

        if (loadError instanceof ApiError && loadError.status === 404) {
          setNotFound(true);
          setError(t("collectionMissing"));
          return;
        }

        setError(t("collectionLoadError"));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCollection();

    return () => controller.abort();
  }, [slug, t]);

  const isDirector = collection?.category === "director";
  const primaryTitle = collection
    ? english
      ? collection.titleEn
      : collection.titleZh
    : "";
  const secondaryTitle = collection
    ? english
      ? collection.titleZh
      : collection.titleEn
    : "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <Link
        href="/discover#collections"
        className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
      >
        {t("allCollections")}
      </Link>

      {isLoading && <p className="mt-16 text-sm text-muted">{t("loading")}</p>}

      {error && (
        <p className="mt-16 text-sm text-neutral-300" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-8 text-sm text-neutral-300" role="status">
          {message}
        </p>
      )}

      {!isLoading && notFound && (
        <p className="mt-6 text-sm text-muted">{t("collectionMissingHint")}</p>
      )}

      {collection && (
        <>
          <p className="mt-10 text-xs tracking-[0.24em] text-muted uppercase">
            {secondaryTitle}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-6xl">
            {primaryTitle}
          </h1>
          {collectionMetaLine(collection, english) && (
            <p className="mt-4 text-sm text-muted">
              {collectionMetaLine(collection, english)}
            </p>
          )}
          <p className="mt-8 max-w-2xl text-sm leading-7 text-neutral-300">
            {english ? collection.descriptionEn : collection.descriptionZh}
          </p>

          {isDirector ? (
            <section className="mt-12 max-w-xl space-y-6">
              {(english
                ? collection.countriesEn
                : collection.countriesZh
              )?.length ? (
                <p>
                  <span className="text-xs tracking-[0.18em] text-muted">
                    {t("directorRegion")}
                  </span>
                  <span className="mt-1 block">
                    {(english
                      ? collection.countriesEn
                      : collection.countriesZh
                    )?.join(" / ")}
                  </span>
                </p>
              ) : null}
              {(english ? collection.periodEn : collection.periodZh) && (
                <p>
                  <span className="text-xs tracking-[0.18em] text-muted">
                    {t("directorPeriod")}
                  </span>
                  <span className="mt-1 block">
                    {english ? collection.periodEn : collection.periodZh}
                  </span>
                </p>
              )}
              {(english ? collection.themesEn : collection.themesZh).length >
                0 && (
                <p>
                  <span className="text-xs tracking-[0.18em] text-muted">
                    {t("directorThemes")}
                  </span>
                  <span className="mt-1 block">
                    {(english
                      ? collection.themesEn
                      : collection.themesZh
                    ).join("  ·  ")}
                  </span>
                </p>
              )}
            </section>
          ) : collection.people.length > 0 ? (
            <section className="mt-12">
              <h2 className="text-xs tracking-[0.24em] text-muted">
                {t("peopleHeading")}
              </h2>
              <ul className="mt-5 max-w-xl space-y-2 text-sm leading-7">
                {collection.people.map((person) => (
                  <li key={`${person.name}-${person.roleZh}`}>
                    {person.name}
                    <span className="text-muted">
                      {"  ·  "}
                      {english ? person.roleEn : person.roleZh}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-16">
            <h2 className="text-xs tracking-[0.24em] text-muted">
              {t("worksHeading")}
            </h2>
            {collection.movies.length === 0 ? (
              <p className="mt-10 text-sm text-muted">{t("collectionEmpty")}</p>
            ) : (
              <ol className="mt-10 divide-y divide-border">
                {collection.movies.map((movie, index) => {
                  const title = displayTitle(movie, language);

                  return (
                    <li key={movie.externalId} className="py-10 first:pt-6">
                      <article className="flex flex-col gap-4 sm:grid sm:grid-cols-[4rem_7rem_minmax(0,1fr)] sm:items-start sm:gap-8">
                        <p className="font-mono text-2xl text-muted sm:text-4xl">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <div className="w-28 sm:w-full">
                          <MoviePoster
                            title={title}
                            posterUrl={movie.posterUrl}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-medium tracking-tight sm:text-3xl">
                            {title}
                          </h3>
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
                          {isRestrictedMovie(movie) && (
                            <RestrictionMetadata movie={movie} />
                          )}
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
          </section>

          {collection.sources.length > 0 && (
            <section className="mt-16 border-t border-border pt-10">
              <h2 className="text-xs tracking-[0.24em] text-muted">
                {t("sourcesHeading")}
              </h2>
              <ul className="mt-5 space-y-2 text-sm">
                {collection.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-200 underline-offset-4 hover:underline"
                    >
                      {source.publisher}
                      <span className="text-muted">  ·  {source.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
