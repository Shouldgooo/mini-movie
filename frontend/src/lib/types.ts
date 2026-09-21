export type User = {
  id: number;
  username: string;
  displayName: string | null;
  email: string;
};

export type CatalogMovie = {
  externalId: string;
  titleZh: string;
  titleEn: string | null;
  titleOriginal?: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  overview: string;
  overviewZh?: string;
  overviewEn?: string;
  director: string | null;
  directorZh?: string | null;
  directorEn?: string | null;
  countries: string[];
  countriesZh?: string[];
  countriesEn?: string[];
  originCountries?: string[];
  rating: number | null;
};

export type RestrictionSource = {
  title: string;
  publisher: string;
  url: string;
};

export type RestrictedMainlandMovie = CatalogMovie & {
  restrictionStatus: string;
  restrictionStatusEn?: string;
  restrictionPeriod: string;
  restrictionPeriodEn?: string;
  restrictionContext: string;
  restrictionContextEn?: string;
  currentStatus: string;
  currentStatusEn?: string;
  restrictionSources: RestrictionSource[];
};

export type CollectionSummary = {
  slug: string;
  titleZh: string;
  titleEn: string;
  category:
    | "movement"
    | "director"
    | "chinese-cinema"
    | "culture"
    | "aesthetic";
  descriptionZh: string;
  descriptionEn: string;
  periodZh?: string;
  periodEn?: string;
  countriesZh?: string[];
  countriesEn?: string[];
  featured: boolean;
  filmCount: number;
};

export type CollectionPerson = {
  name: string;
  roleZh: string;
  roleEn: string;
};

export type CollectionSource = {
  title: string;
  publisher: string;
  url: string;
};

export type CollectionDetail = CollectionSummary & {
  people: CollectionPerson[];
  themesZh: string[];
  themesEn: string[];
  sources: CollectionSource[];
  movies: Array<CatalogMovie | RestrictedMainlandMovie>;
};

export type Movie = {
  id: number;
  externalId: string;
  titleZh: string;
  titleEn: string | null;
  posterUrl: string | null;
  releaseYear: number | null;
};

export type Favourite = {
  id: number;
  userId: number;
  movieId: number;
  movie: Movie;
};

export type Review = {
  id: number;
  content: string;
  userId: number;
  movieId: number;
  movie: Movie;
};
