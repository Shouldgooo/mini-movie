"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MoviePoster from "@/components/MoviePoster";
import {
  apiFetch,
  clearStoredToken,
  getErrorMessage,
  getStoredToken,
  isUnauthorized,
} from "@/lib/api";
import type { Favourite, Review, User } from "@/lib/types";

const REVIEW_MAX_LENGTH = 2000;

export default function MyPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [removingMovieId, setRemovingMovieId] = useState<number | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingReviewId, setSavingReviewId] = useState<number | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  useEffect(() => {
    async function loadMyData() {
      const token = getStoredToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [userData, favouritesData, reviewsData] = await Promise.all([
          apiFetch<User>("/api/auth/me", { token }),
          apiFetch<Favourite[]>("/api/favourites", { token }),
          apiFetch<Review[]>("/api/reviews/me", { token }),
        ]);

        setUser(userData);
        setFavourites(favouritesData);
        setReviews(reviewsData);
      } catch (error) {
        console.error(error);

        if (isUnauthorized(error)) {
          router.push("/login");
          return;
        }

        setError("加载数据失败");
      } finally {
        setIsLoading(false);
      }
    }

    loadMyData();
  }, [router]);

  function handleLogout() {
    clearStoredToken();
    router.push("/login");
  }

  async function handleRemoveFavourite(movieId: number) {
    const token = getStoredToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setMessage("");
    setError("");
    setRemovingMovieId(movieId);

    try {
      await apiFetch(`/api/favourites/${movieId}`, {
        method: "DELETE",
        token,
      });

      setFavourites((current) =>
        current.filter((favourite) => favourite.movieId !== movieId)
      );
      setMessage("已取消收藏");
    } catch (error) {
      console.error(error);

      if (isUnauthorized(error)) {
        router.push("/login");
        return;
      }

      setError(getErrorMessage(error, "取消收藏失败"));
    } finally {
      setRemovingMovieId(null);
    }
  }

  function startEditReview(review: Review) {
    setEditingReviewId(review.id);
    setEditContent(review.content);
    setMessage("");
    setError("");
  }

  function cancelEditReview() {
    setEditingReviewId(null);
    setEditContent("");
  }

  async function handleUpdateReview(
    event: FormEvent<HTMLFormElement>,
    reviewId: number
  ) {
    event.preventDefault();

    const token = getStoredToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const content = editContent.trim();

    if (!content) {
      setError("影评内容不能为空");
      return;
    }

    if (content.length > REVIEW_MAX_LENGTH) {
      setError(`影评不能超过 ${REVIEW_MAX_LENGTH} 个字符`);
      return;
    }

    setMessage("");
    setError("");
    setSavingReviewId(reviewId);

    try {
      const updated = await apiFetch<Review>(`/api/reviews/${reviewId}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ content }),
      });

      setReviews((current) =>
        current.map((review) =>
          review.id === reviewId
            ? { ...review, content: updated.content }
            : review
        )
      );
      setEditingReviewId(null);
      setEditContent("");
      setMessage("影评已更新");
    } catch (error) {
      console.error(error);

      if (isUnauthorized(error)) {
        router.push("/login");
        return;
      }

      setError(getErrorMessage(error, "更新影评失败"));
    } finally {
      setSavingReviewId(null);
    }
  }

  async function handleDeleteReview(reviewId: number) {
    const token = getStoredToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setMessage("");
    setError("");
    setDeletingReviewId(reviewId);

    try {
      await apiFetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        token,
      });

      setReviews((current) =>
        current.filter((review) => review.id !== reviewId)
      );

      if (editingReviewId === reviewId) {
        cancelEditReview();
      }

      setMessage("影评已删除");
    } catch (error) {
      console.error(error);

      if (isUnauthorized(error)) {
        router.push("/login");
        return;
      }

      setError(getErrorMessage(error, "删除影评失败"));
    } finally {
      setDeletingReviewId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-sm text-muted">加载中...</p>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">我的</h1>
        <p className="text-sm text-muted">管理个人资料、收藏和影评。</p>
      </div>

      {message && (
        <p
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          role="status"
        >
          {message}
        </p>
      )}

      {error && user && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {user && (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">个人信息</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">用户名</dt>
              <dd className="mt-1 font-medium">{user.username}</dd>
            </div>
            <div>
              <dt className="text-muted">显示名称</dt>
              <dd className="mt-1 font-medium">{user.displayName || "未设置"}</dd>
            </div>
            <div>
              <dt className="text-muted">邮箱</dt>
              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-stone-100"
          >
            退出登录
          </button>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">我的收藏</h2>

        {favourites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <p className="text-sm text-muted">暂时没有收藏。</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favourites.map((favourite) => (
              <li
                key={favourite.id}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
              >
                <MoviePoster
                  title={favourite.movie.titleZh}
                  posterUrl={favourite.movie.posterUrl}
                />
                <div className="space-y-3 p-4">
                  <div>
                    <p className="font-semibold">{favourite.movie.titleZh}</p>
                    {favourite.movie.titleEn && (
                      <p className="text-sm text-muted">
                        {favourite.movie.titleEn}
                      </p>
                    )}
                    {favourite.movie.releaseYear && (
                      <p className="text-sm text-muted">
                        {favourite.movie.releaseYear}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFavourite(favourite.movieId)}
                    disabled={removingMovieId === favourite.movieId}
                    className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removingMovieId === favourite.movieId
                      ? "移除中..."
                      : "取消收藏"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">我的影评</h2>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <p className="text-sm text-muted">暂时没有影评。</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="hidden w-20 shrink-0 overflow-hidden rounded-lg sm:block">
                    <MoviePoster
                      title={review.movie.titleZh}
                      posterUrl={review.movie.posterUrl}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold">{review.movie.titleZh}</h3>
                      {review.movie.titleEn && (
                        <p className="text-sm text-muted">
                          {review.movie.titleEn}
                        </p>
                      )}
                    </div>

                    {editingReviewId === review.id ? (
                      <form
                        onSubmit={(event) =>
                          handleUpdateReview(event, review.id)
                        }
                        className="space-y-3"
                      >
                        <label
                          htmlFor={`edit-review-${review.id}`}
                          className="sr-only"
                        >
                          编辑影评
                        </label>
                        <textarea
                          id={`edit-review-${review.id}`}
                          value={editContent}
                          onChange={(event) =>
                            setEditContent(event.target.value)
                          }
                          maxLength={REVIEW_MAX_LENGTH}
                          rows={4}
                          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            disabled={savingReviewId === review.id}
                            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingReviewId === review.id
                              ? "保存中..."
                              : "保存"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditReview}
                            className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-stone-100"
                          >
                            取消
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {review.content}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditReview(review)}
                            className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-stone-100"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingReviewId === review.id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingReviewId === review.id
                              ? "删除中..."
                              : "删除"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
