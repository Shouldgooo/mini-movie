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

export const favouriteSchema = z.object({
  movieId: z
    .number({ message: "Valid movieId is required" })
    .int("Valid movieId is required")
    .positive("Valid movieId is required"),
});

export const createReviewSchema = z.object({
  movieId: z
    .number({ message: "Valid movieId is required" })
    .int("Valid movieId is required")
    .positive("Valid movieId is required"),
  content: z
    .string()
    .trim()
    .min(1, "Review content is required")
    .max(REVIEW_MAX_LENGTH, `Review content must be at most ${REVIEW_MAX_LENGTH} characters`),
});

export const updateReviewSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Review content is required")
    .max(REVIEW_MAX_LENGTH, `Review content must be at most ${REVIEW_MAX_LENGTH} characters`),
});

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
