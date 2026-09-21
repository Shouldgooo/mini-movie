import { CHINESE_CINEMA_COLLECTIONS } from "./chinese-cinema.js";
import { DIRECTOR_COLLECTIONS } from "./directors.js";
import { MOVEMENT_COLLECTIONS } from "./movements.js";
import { THEME_COLLECTIONS } from "./themes.js";
import type { CollectionDefinition } from "./types.js";

export type {
  CollectionCategory,
  CollectionDefinition,
  CollectionPerson,
  CollectionSource,
  LocalizedText,
} from "./types.js";
export { text } from "./types.js";

const FEATURED_ORDER = [
  "french-new-wave",
  "taiwan-new-cinema",
  "iranian-new-wave",
  "mainland-restricted",
  "wong-kar-wai",
  "edward-yang",
] as const;

export const COLLECTION_CATEGORIES = [
  { id: "movement", labelZh: "电影运动" },
  { id: "chinese-cinema", labelZh: "华语电影" },
  { id: "director", labelZh: "导演" },
  { id: "aesthetic", labelZh: "电影美学与文化" },
  { id: "culture", labelZh: "电影美学与文化" },
] as const;

const ALL_COLLECTIONS: CollectionDefinition[] = [
  ...MOVEMENT_COLLECTIONS,
  ...CHINESE_CINEMA_COLLECTIONS,
  ...DIRECTOR_COLLECTIONS,
  ...THEME_COLLECTIONS,
];

const bySlug = new Map(
  ALL_COLLECTIONS.map((collection) => [collection.slug, collection])
);

export function getAllCollections(): CollectionDefinition[] {
  const featured = FEATURED_ORDER.map((slug) => bySlug.get(slug)).filter(
    (collection): collection is CollectionDefinition => collection !== undefined
  );
  const featuredSlugs = new Set(featured.map((collection) => collection.slug));
  const rest = ALL_COLLECTIONS.filter(
    (collection) => !featuredSlugs.has(collection.slug)
  );

  return [...featured, ...rest];
}

export function getCollectionDefinition(
  slug: string
): CollectionDefinition | undefined {
  return bySlug.get(slug);
}

export function listCollectionSlugs(): string[] {
  return ALL_COLLECTIONS.map((collection) => collection.slug);
}
