export type User = {
  id: number;
  username: string;
  displayName: string | null;
  email: string;
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
