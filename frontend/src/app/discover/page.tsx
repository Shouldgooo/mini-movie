"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MoviePoster from "@/components/MoviePoster";
import {
  ApiError,
  apiFetch,
  getErrorMessage,
  getStoredToken,
  isUnauthorized,
} from "@/lib/api";
import type { Movie } from "@/lib/types";

const REVIEW_MAX_LENGTH = 2000;

export default function DiscoverPage() {
  const router = useRouter();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [reviewContent, setReviewContent] = useState<Record<number, string>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [favouriteLoadingId, setFavouriteLoadingId] = useState<number | null>(
    null
  );
  const [reviewLoadingId, setReviewLoadingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        const data = await apiFetch<Movie[]>("/api/movies");
        setMovies(data);
      } catch (error) {
        console.error(error);
        setError("电影加载失败");
      } finally {
        setIsLoading(false);
      }
    }

    loadMovies();
  }, []);

  function requireToken() {
    const token = getStoredToken();

    if (!token) {
      router.push("/login");
      return null;
    }

    return token;
  }

  async function handleFavourite(movieId: number) {
    const token = requireToken();

    if (!token) {
      return;
    }

    setMessage("");
    setError("");
    setFavouriteLoadingId(movieId);

    try {
      await apiFetch("/api/favourites", {
        method: "POST",
        token,
        body: JSON.stringify({ movieId }),
      });

      setMessage("收藏成功");
    } catch (error) {
      console.error(error);

      if (isUnauthorized(error)) {
        router.push("/login");
        return;
      }

      if (error instanceof ApiError && error.status === 409) {
        setError("这部电影已经收藏过了");
        return;
      }

      setError(getErrorMessage(error, "收藏失败"));
    } finally {
      setFavouriteLoadingId(null);
    }
  }

  async function handleReview(
    event: FormEvent<HTMLFormElement>,
    movieId: number
  ) {
    event.preventDefault();

    const token = requireToken();

    if (!token) {
      return;
    }

    const content = reviewContent[movieId]?.trim() ?? "";

    if (!content) {
      setError("请输入影评内容");
      return;
    }

    if (content.length > REVIEW_MAX_LENGTH) {
      setError(`影评不能超过 ${REVIEW_MAX_LENGTH} 个字符`);
      return;
    }

    setMessage("");
    setError("");
    setReviewLoadingId(movieId);

    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        token,
        body: JSON.stringify({
          movieId,
          content,
        }),
      });

      setReviewContent((current) => ({
        ...current,
        [movieId]: "",
      }));

      setMessage("影评发布成功");
    } catch (error) {
      console.error(error);

      if (isUnauthorized(error)) {
        router.push("/login");
        return;
      }

      if (error instanceof ApiError && error.status === 409) {
        setError("你已经评价过这部电影了");
        return;
      }

      setError(getErrorMessage(error, "影评提交失败"));
    } finally {
      setReviewLoadingId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-sm text-muted">电影加载中...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">发现电影</h1>
        <p className="text-sm text-muted">
          浏览影片、加入收藏，或写下一条影评。收藏和影评需要登录。
        </p>
      </div>

      {message && (
        <p
          className="mb-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          role="status"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      {movies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <p className="text-sm text-muted">暂时没有电影。</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <article
              key={movie.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
            >
              <MoviePoster title={movie.titleZh} posterUrl={movie.posterUrl} />

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div>
                  <h2 className="text-lg font-semibold leading-snug">
                    {movie.titleZh}
                  </h2>
                  {movie.titleEn && (
                    <p className="mt-1 text-sm text-muted">{movie.titleEn}</p>
                  )}
                  {movie.releaseYear && (
                    <p className="mt-1 text-sm text-muted">
                      上映年份：{movie.releaseYear}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleFavourite(movie.id)}
                  disabled={favouriteLoadingId === movie.id}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {favouriteLoadingId === movie.id ? "收藏中..." : "收藏"}
                </button>

                <form
                  onSubmit={(event) => handleReview(event, movie.id)}
                  className="space-y-3"
                >
                  <label
                    htmlFor={`review-${movie.id}`}
                    className="block text-sm font-medium"
                  >
                    写影评
                  </label>
                  <textarea
                    id={`review-${movie.id}`}
                    value={reviewContent[movie.id] || ""}
                    onChange={(event) =>
                      setReviewContent((current) => ({
                        ...current,
                        [movie.id]: event.target.value,
                      }))
                    }
                    maxLength={REVIEW_MAX_LENGTH}
                    rows={4}
                    placeholder="写下你对这部电影的想法..."
                    className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={reviewLoadingId === movie.id}
                    className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewLoadingId === movie.id ? "发布中..." : "发布影评"}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
