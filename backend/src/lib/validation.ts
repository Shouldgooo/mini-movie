import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const REVIEW_MAX_LENGTH = 2000;

export function parsePositiveInt(
  value: string | string[] | undefined
): number | null {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !/^\d+$/.test(raw)) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be 3-30 characters")
    .max(30, "Username must be 3-30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),
  displayName: z
    .string()
    .trim()
    .max(50, "Display name is too long")
    .optional(),
  email: z
    .string()
    .trim()
    .email("Valid email is required")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Valid email is required")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const optionalMovieId = z
  .number({ message: "Valid movieId is required" })
  .int("Valid movieId is required")
  .positive("Valid movieId is required")
  .optional();

const optionalExternalId = z
  .union([
    z.string().trim().min(1, "Valid externalId is required"),
    z.number().int().positive("Valid externalId is required"),
  ])
  .optional();

export const favouriteSchema = z
  .object({
    movieId: optionalMovieId,
    externalId: optionalExternalId,
  })
  .refine(
    (data) => data.movieId !== undefined || data.externalId !== undefined,
    {
      message: "Valid movieId or externalId is required",
    }
  );

export const createReviewSchema = z
  .object({
    movieId: optionalMovieId,
    externalId: optionalExternalId,
    content: z
      .string()
      .trim()
      .min(1, "Review content is required")
      .max(
        REVIEW_MAX_LENGTH,
        `Review content must be at most ${REVIEW_MAX_LENGTH} characters`
      ),
  })
  .refine(
    (data) => data.movieId !== undefined || data.externalId !== undefined,
    {
      message: "Valid movieId or externalId is required",
    }
  );

export const updateReviewSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Review content is required")
    .max(REVIEW_MAX_LENGTH, `Review content must be at most ${REVIEW_MAX_LENGTH} characters`),
});

export const RANKING_REGIONS = [
  "all",
  "asia",
  "europe",
  "north-america",
  "latin-america",
  "other",
] as const;

export type RankingRegion = (typeof RANKING_REGIONS)[number];

export type YearFilter =
  | { kind: "all" }
  | { kind: "year"; year: number }
  | { kind: "decade"; start: number }
  | { kind: "earlier" };

export type RankingFilters = {
  region: RankingRegion;
  year: YearFilter;
};

export class RankingFilterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RankingFilterError";
  }
}

export class SearchQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchQueryError";
  }
}

export const SEARCH_QUERY_MAX_LENGTH = 200;

export function parseSearchQuery(query: Record<string, unknown>): string {
  const raw = firstQueryString(query.query);

  if (query.query !== undefined && raw === undefined) {
    throw new SearchQueryError("Search query is required");
  }

  if (raw === undefined) {
    throw new SearchQueryError("Search query is required");
  }

  const trimmed = raw.trim();

  if (!trimmed) {
    throw new SearchQueryError("Search query is required");
  }

  if (trimmed.length > SEARCH_QUERY_MAX_LENGTH) {
    throw new SearchQueryError("Search query is too long");
  }

  return trimmed;
}

function firstQueryString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
}

function parseDecadeValue(raw: string): YearFilter {
  if (!/^\d{4}$/.test(raw)) {
    throw new RankingFilterError("Invalid decade");
  }

  const start = Number(raw);

  if (start % 10 !== 0 || start < 1960 || start > 2010) {
    throw new RankingFilterError("Invalid decade");
  }

  return { kind: "decade", start };
}

function parseYearValue(raw: string): YearFilter {
  if (raw === "all") {
    return { kind: "all" };
  }

  if (raw === "earlier") {
    return { kind: "earlier" };
  }

  if (/^\d{4}s$/.test(raw)) {
    return parseDecadeValue(raw.slice(0, 4));
  }

  if (!/^\d{4}$/.test(raw)) {
    throw new RankingFilterError("Invalid year");
  }

  const year = Number(raw);
  const maxYear = new Date().getUTCFullYear() + 1;

  if (year < 1888 || year > maxYear) {
    throw new RankingFilterError("Invalid year");
  }

  return { kind: "year", year };
}

export function parseRankingQuery(
  query: Record<string, unknown>
): RankingFilters {
  const regionRaw = firstQueryString(query.region);
  const yearRaw = firstQueryString(query.year);
  const decadeRaw = firstQueryString(query.decade);

  if (query.region !== undefined && regionRaw === undefined) {
    throw new RankingFilterError("Invalid region");
  }

  if (query.year !== undefined && yearRaw === undefined) {
    throw new RankingFilterError("Invalid year");
  }

  if (query.decade !== undefined && decadeRaw === undefined) {
    throw new RankingFilterError("Invalid decade");
  }

  let region: RankingRegion = "all";

  if (regionRaw !== undefined && regionRaw !== "") {
    if (!RANKING_REGIONS.includes(regionRaw as RankingRegion)) {
      throw new RankingFilterError("Invalid region");
    }

    region = regionRaw as RankingRegion;
  }

  if (yearRaw && decadeRaw) {
    throw new RankingFilterError("Use either year or decade, not both");
  }

  let year: YearFilter = { kind: "all" };

  if (decadeRaw !== undefined && decadeRaw !== "") {
    year = parseDecadeValue(decadeRaw);
  } else if (yearRaw !== undefined && yearRaw !== "") {
    year = parseYearValue(yearRaw);
  }

  return { region, year };
}

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];

      return res.status(400).json({
        message: firstIssue?.message ?? "Invalid request",
      });
    }

    req.body = result.data;
    next();
  };
}
