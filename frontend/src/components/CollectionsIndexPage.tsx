"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { CollectionSummary } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/dictionary";

const GROUP_ORDER = [
  { id: "movement", labelKey: "groupMovement" },
  { id: "chinese-cinema", labelKey: "groupChineseCinema" },
  { id: "director", labelKey: "groupDirector" },
  { id: "culture-aesthetic", labelKey: "groupCultureAesthetic" },
] as const;

function groupId(category: CollectionSummary["category"]) {
  if (category === "culture" || category === "aesthetic") {
    return "culture-aesthetic";
  }

  return category;
}

function collectionTitle(collection: CollectionSummary, english: boolean) {
  return english ? collection.titleEn : collection.titleZh;
}

function collectionSecondary(collection: CollectionSummary, english: boolean) {
  return english ? collection.titleZh : collection.titleEn;
}

function collectionDescription(collection: CollectionSummary, english: boolean) {
  return english ? collection.descriptionEn : collection.descriptionZh;
}

function metaLine(collection: CollectionSummary, english: boolean) {
  const countries = english
    ? collection.countriesEn ?? collection.countriesZh ?? []
    : collection.countriesZh ?? [];
  const period = english
    ? collection.periodEn ?? collection.periodZh
    : collection.periodZh;
  return [countries.join(" / "), period].filter(Boolean).join("  ·  ");
}

export default function CollectionsIndexPage() {
  const { language, t } = useLanguage();
  const english = language === "en";
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCollections() {
      try {
        const data = await apiFetch<CollectionSummary[]>("/api/collections");
        setCollections(data);
      } catch (loadError) {
        console.error(loadError);
        setError(t("collectionLoadError"));
      } finally {
        setIsLoading(false);
      }
    }

    loadCollections();
  }, [t]);

  const featured = collections.filter((collection) => collection.featured);
  const featuredSlugs = new Set(featured.map((collection) => collection.slug));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.28em] text-muted uppercase">
        {t("collectionsKicker")}
      </p>
      <p className="mt-3 text-xs tracking-[0.24em] text-muted uppercase">
        Collections
      </p>
      <h1 className="mt-8 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
        {t("collectionsTitle")}
      </h1>

      {isLoading && <p className="mt-16 text-sm text-muted">{t("loading")}</p>}

      {error && (
        <p className="mt-16 text-sm text-neutral-300" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <>
          <section className="mt-16">
            <p className="text-xs tracking-[0.24em] text-muted">
              {t("featuredCollections")}
            </p>
            <ol className="mt-8 divide-y divide-border border-t border-border">
              {featured.map((collection, index) => (
                <li key={collection.slug} className="py-10">
                  <p className="font-mono text-sm text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-4 text-2xl font-medium tracking-tight sm:text-4xl">
                    {collectionTitle(collection, english)}
                  </h2>
                  <p className="mt-2 text-sm tracking-[0.16em] text-muted uppercase">
                    {collectionSecondary(collection, english)}
                  </p>
                  {metaLine(collection, english) && (
                    <p className="mt-3 text-sm text-muted">
                      {metaLine(collection, english)}
                    </p>
                  )}
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-300">
                    {collectionDescription(collection, english)}
                  </p>
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="mt-6 inline-block text-sm underline-offset-4 hover:underline"
                  >
                    {t("viewCollection")}
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {GROUP_ORDER.map((group) => {
            const items = collections.filter(
              (collection) =>
                !featuredSlugs.has(collection.slug) &&
                groupId(collection.category) === group.id
            );

            if (items.length === 0) {
              return null;
            }

            return (
              <section key={group.id} className="mt-20">
                <h2 className="text-xs tracking-[0.24em] text-muted">
                  {t(group.labelKey as MessageKey)}
                </h2>
                <ol className="mt-6 divide-y divide-border border-t border-border">
                  {items.map((collection, index) => (
                    <li key={collection.slug} className="py-6">
                      <Link
                        href={`/collections/${collection.slug}`}
                        className="block hover:text-neutral-300"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6">
                          <p className="font-mono text-sm text-muted">
                            {String(index + 1).padStart(2, "0")}
                          </p>
                          <div className="min-w-0 flex-1">
                            <p className="text-lg tracking-tight">
                              {collectionTitle(collection, english)}
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {collectionSecondary(collection, english)}
                              {metaLine(collection, english)
                                ? `  ·  ${metaLine(collection, english)}`
                                : ""}
                            </p>
                          </div>
                          <p className="text-sm text-muted">
                            {t("viewCollection")}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </>
      )}
    </main>
  );
}
