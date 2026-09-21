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
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const REVIEW_MAX_LENGTH = 2000;

function journalTitle(
  movie: { titleZh: string; titleEn: string | null },
  english: boolean
) {
  if (english) {
    return movie.titleEn || movie.titleZh;
  }

  return movie.titleZh;
}

export default function MyPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const english = language === "en";

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

        setError(t("loadDataFail"));
      } finally {
        setIsLoading(false);
      }
    }

    loadMyData();
  }, [router, t]);

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
      setMessage(t("unfavouriteOk"));
    } catch (error) {
      console.error(error);

      if (isUnauthorized(error)) {
        router.push("/login");
        return;
      }

      setError(getErrorMessage(error, t("unfavouriteFail")));
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
      setError(t("reviewContentEmpty"));
      return;
    }

    if (content.length > REVIEW_MAX_LENGTH) {
      setError(t("reviewTooLong", { max: REVIEW_MAX_LENGTH }));
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
      setMessage(t("reviewUpdated"));
    } catch (error) {
      console.error(error);

      if (isUnauthorized(error)) {
        router.push("/login");
        return;
      }

      setError(getErrorMessage(error, t("updateReviewFail")));
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

      setMessage(t("reviewDeleted"));
    } catch (error) {
      console.error(error);

      if (isUnauthorized(error)) {
        router.push("/login");
        return;
      }

      setError(getErrorMessage(error, t("deleteReviewFail")));
    } finally {
      setDeletingReviewId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-sm text-muted">{t("loading")}</p>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-sm text-neutral-300" role="alert">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
      <div>
        <p className="text-xs tracking-[0.28em] text-muted uppercase">
            {t("myKicker")}
          </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t("myTitle")}</h1>
      </div>

      {message && (
        <p className="text-sm text-neutral-300" role="status">
          {message}
        </p>
      )}

      {error && user && (
        <p className="text-sm text-neutral-300" role="alert">
          {error}
        </p>
      )}

      {user && (
        <section>
          <h2 className="text-sm tracking-[0.2em] text-muted uppercase">
            {t("profile")}
          </h2>
          <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">{t("username")}</dt>
              <dd className="mt-1">{user.username}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("displayName")}</dt>
              <dd className="mt-1">{user.displayName || t("displayNameEmpty")}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("email")}</dt>
              <dd className="mt-1">{user.email}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 text-sm underline-offset-4 hover:underline"
          >
            {t("logout")}
          </button>
        </section>
      )}

      <section>
        <h2 className="text-sm tracking-[0.2em] text-muted uppercase">
            {t("myFavourites")}
        </h2>

        {favourites.length === 0 ? (
          <p className="mt-8 text-sm text-muted">{t("noFavourites")}</p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {favourites.map((favourite) => (
              <li key={favourite.id} className="min-w-0">
                <MoviePoster
                  title={journalTitle(favourite.movie, english)}
                  posterUrl={favourite.movie.posterUrl}
                />
                <p className="mt-3 truncate text-sm">
                  {journalTitle(favourite.movie, english)}
                </p>
                {!english && favourite.movie.titleEn && (
                  <p className="truncate text-xs text-muted">
                    {favourite.movie.titleEn}
                  </p>
                )}
                {english &&
                  favourite.movie.titleZh &&
                  favourite.movie.titleZh !== favourite.movie.titleEn && (
                  <p className="truncate text-xs text-muted">
                    {favourite.movie.titleZh}
                  </p>
                )}
                {favourite.movie.releaseYear && (
                  <p className="text-xs text-muted">
                    {favourite.movie.releaseYear}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveFavourite(favourite.movieId)}
                  disabled={removingMovieId === favourite.movieId}
                  className="mt-3 text-xs text-muted underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
                >
                  {removingMovieId === favourite.movieId
                    ? t("removingFavourite")
                    : t("removeFavourite")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm tracking-[0.2em] text-muted uppercase">
            {t("myReviews")}
        </h2>

        {reviews.length === 0 ? (
          <p className="mt-8 text-sm text-muted">{t("noReviews")}</p>
        ) : (
          <ul className="mt-8 divide-y divide-border">
            {reviews.map((review) => (
              <li key={review.id} className="py-8 first:pt-0">
                <div className="flex gap-5">
                  <div className="hidden w-20 shrink-0 sm:block">
                    <MoviePoster
                      title={journalTitle(review.movie, english)}
                      posterUrl={review.movie.posterUrl}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-medium">
                        {journalTitle(review.movie, english)}
                      </h3>
                      {!english && review.movie.titleEn && (
                        <p className="text-sm text-muted">
                          {review.movie.titleEn}
                        </p>
                      )}
                      {english &&
                        review.movie.titleZh &&
                        review.movie.titleZh !== review.movie.titleEn && (
                        <p className="text-sm text-muted">
                          {review.movie.titleZh}
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
                          {t("editReview")}
                        </label>
                        <textarea
                          id={`edit-review-${review.id}`}
                          value={editContent}
                          onChange={(event) =>
                            setEditContent(event.target.value)
                          }
                          maxLength={REVIEW_MAX_LENGTH}
                          rows={4}
                          className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none"
                        />
                        <div className="flex flex-wrap gap-4 text-sm">
                          <button
                            type="submit"
                            disabled={savingReviewId === review.id}
                            className="underline-offset-4 hover:underline disabled:opacity-50"
                          >
                            {savingReviewId === review.id
                              ? t("savingReview")
                              : t("saveReview")}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditReview}
                            className="text-muted underline-offset-4 hover:text-foreground hover:underline"
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap text-sm leading-7 text-neutral-200">
                          {review.content}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <button
                            type="button"
                            onClick={() => startEditReview(review)}
                            className="underline-offset-4 hover:underline"
                          >
                            {t("editReview")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingReviewId === review.id}
                            className="text-muted underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
                          >
                            {deletingReviewId === review.id
                              ? t("deletingReview")
                              : t("deleteReview")}
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
