export type CollectionCategory =
  | "movement"
  | "director"
  | "chinese-cinema"
  | "culture"
  | "aesthetic";

export type LocalizedText = {
  zh: string;
  en: string;
};

export type CollectionPerson = {
  name: string;
  role: LocalizedText;
};

export type CollectionSource = {
  title: string;
  publisher: string;
  url: string;
};

export type CollectionDefinition = {
  slug: string;
  titleZh: string;
  titleEn: string;
  category: CollectionCategory;
  subtitle?: LocalizedText;
  description: LocalizedText;
  period?: LocalizedText;
  countries?: LocalizedText[];
  people?: CollectionPerson[];
  filmIds: number[];
  themes?: LocalizedText[];
  sources?: CollectionSource[];
  featured?: boolean;
  movieSource?: "tmdb-ids" | "restricted-mainland";
};

export function text(zh: string, en: string): LocalizedText {
  return { zh, en };
}

