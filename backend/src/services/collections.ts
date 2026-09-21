import {
  getAllCollections,
  getCollectionDefinition,
  type CollectionDefinition,
} from "../data/collections/index.js";
import { enrichCatalogMovies } from "./movie-enrichment.js";
import {
  getRestrictedMainlandCollection,
  type RestrictedMainlandMovie,
} from "./restricted-mainland.js";
import type { CatalogMovie } from "./tmdb.js";

export class CollectionNotFoundError extends Error {
  constructor() {
    super("Collection not found");
    this.name = "CollectionNotFoundError";
  }
}

export type CollectionSummary = {
  slug: string;
  titleZh: string;
  titleEn: string;
  category: CollectionDefinition["category"];
  descriptionZh: string;
  descriptionEn: string;
  periodZh?: string;
  periodEn?: string;
  countriesZh?: string[];
  countriesEn?: string[];
  featured: boolean;
  filmCount: number;
};

export type CollectionDetail = CollectionSummary & {
  people: Array<{ name: string; roleZh: string; roleEn: string }>;
  themesZh: string[];
  themesEn: string[];
  sources: NonNullable<CollectionDefinition["sources"]>;
  movies: Array<CatalogMovie | RestrictedMainlandMovie>;
};

function filmCountOf(definition: CollectionDefinition) {
  return definition.filmIds.length;
}

function toSummary(definition: CollectionDefinition): CollectionSummary {
  return {
    slug: definition.slug,
    titleZh: definition.titleZh,
    titleEn: definition.titleEn,
    category: definition.category,
    descriptionZh: definition.description.zh,
    descriptionEn: definition.description.en,
    featured: Boolean(definition.featured),
    filmCount: filmCountOf(definition),
    ...(definition.period
      ? { periodZh: definition.period.zh, periodEn: definition.period.en }
      : {}),
    ...(definition.countries
      ? {
          countriesZh: definition.countries.map((item) => item.zh),
          countriesEn: definition.countries.map((item) => item.en),
        }
      : {}),
  };
}

export function listCollectionSummaries(): CollectionSummary[] {
  return getAllCollections().map(toSummary);
}

export async function getCollectionBySlug(
  slug: string
): Promise<CollectionDetail> {
  const definition = getCollectionDefinition(slug);

  if (!definition) {
    throw new CollectionNotFoundError();
  }

  const movies =
    definition.movieSource === "restricted-mainland"
      ? await getRestrictedMainlandCollection()
      : await enrichCatalogMovies(definition.filmIds);

  return {
    ...toSummary(definition),
    people: (definition.people ?? []).map((person) => ({
      name: person.name,
      roleZh: person.role.zh,
      roleEn: person.role.en,
    })),
    themesZh: (definition.themes ?? []).map((theme) => theme.zh),
    themesEn: (definition.themes ?? []).map((theme) => theme.en),
    sources: definition.sources ?? [],
    movies,
  };
}
