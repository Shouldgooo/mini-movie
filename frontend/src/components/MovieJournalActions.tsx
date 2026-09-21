"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  apiFetch,
  getErrorMessage,
  getStoredToken,
  isUnauthorized,
} from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const REVIEW_MAX_LENGTH = 2000;

type MovieJournalActionsProps = {
  externalId: string;
  variant?: "home" | "ranking";
  onMessage: (message: string) => void;
  onError: (message: string) => void;
};

export default function MovieJournalActions({
  externalId,
  variant = "ranking",
  onMessage,
  onError,
}: MovieJournalActionsProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isFavouriteLoading, setIsFavouriteLoading] = useState(false);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  function requireToken() {
    const token = getStoredToken();

    if (!token) {
      router.push("/login");
      return null;
    }

    return token;
  }

  async function handleFavourite() {
    const token = requireToken();

    if (!token) {
      return;
    }

    onMessage("");
    onError("");
    setIsFavouriteLoading(true);

    try {
      await apiFetch("/api/favourites", {
        method: "POST",
        token,
        body: JSON.stringify({ externalId }),
      });

      onMessage(t("favouriteOk"));
    } catch (error) {
      console.error(error);

      if (isUnauthorized(error)) {
        router.push("/login");
        return;
      }

      if (error instanceof ApiError && error.status === 409) {
        onError(t("favouriteDuplicate"));
        return;
      }

      onError(getErrorMessage(error, t("favouriteFail")));
    } finally {
      setIsFavouriteLoading(false);
    }
  }

  async function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = requireToken();

    if (!token) {
      return;
    }

    const trimmed = content.trim();

    if (!trimmed) {
      onError(t("reviewEmpty"));
      return;
    }

    if (trimmed.length > REVIEW_MAX_LENGTH) {
      onError(t("reviewTooLong", { max: REVIEW_MAX_LENGTH }));
      return;
    }

    onMessage("");
    onError("");
    setIsReviewLoading(true);

    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        token,
        body: JSON.stringify({
          externalId,
          content: trimmed,
        }),
      });

      setContent("");
      setIsReviewOpen(false);
      onMessage(t("reviewOk"));
    } catch (error) {
      console.error(error);

      if (isUnauthorized(error)) {
        router.push("/login");
        return;
      }

      if (error instanceof ApiError && error.status === 409) {
        onError(t("reviewDuplicate"));
        return;
      }

      onError(getErrorMessage(error, t("reviewFail")));
    } finally {
      setIsReviewLoading(false);
    }
  }

  const isHome = variant === "home";

  return (
    <div className={isHome ? "mt-10" : "mt-4"}>
      <div className={`flex flex-wrap ${isHome ? "gap-8" : "gap-5"} text-sm`}>
        <button
          type="button"
          onClick={handleFavourite}
          disabled={isFavouriteLoading}
          className="underline-offset-4 hover:underline disabled:opacity-50"
        >
          {isFavouriteLoading ? t("favouriting") : t("favourite")}
        </button>
        <button
          type="button"
          onClick={() => setIsReviewOpen((open) => !open)}
          className="text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("writeReview")}
        </button>
      </div>

      {isReviewOpen && (
        <form onSubmit={handleReview} className="mt-5 max-w-xl space-y-3">
          <label htmlFor={`review-${externalId}`} className="sr-only">
            {t("writeReview")}
          </label>
          <textarea
            id={`review-${externalId}`}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={REVIEW_MAX_LENGTH}
            rows={isHome ? 4 : 3}
            placeholder={t("reviewPlaceholder")}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={isReviewLoading}
            className="text-sm underline-offset-4 hover:underline disabled:opacity-50"
          >
            {isReviewLoading ? t("publishingReview") : t("publishReview")}
          </button>
        </form>
      )}
    </div>
  );
}
