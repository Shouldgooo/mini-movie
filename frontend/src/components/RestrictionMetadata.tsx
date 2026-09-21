"use client";

import type { RestrictedMainlandMovie } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function RestrictionMetadata({
  movie,
}: {
  movie: RestrictedMainlandMovie;
}) {
  const { language, t } = useLanguage();
  const english = language === "en";

  return (
    <div className="mt-6 max-w-xl space-y-4 text-sm leading-7">
      <p>
        <span className="text-xs tracking-[0.18em] text-muted">
          {t("mainlandStatus")}
        </span>
        <span className="mt-1 block text-neutral-200">
          {english
            ? movie.restrictionStatusEn || movie.restrictionStatus
            : movie.restrictionStatus}
        </span>
      </p>
      {(english ? movie.restrictionPeriodEn : movie.restrictionPeriod) ? (
        <p>
          <span className="text-xs tracking-[0.18em] text-muted">
            {t("relatedPeriod")}
          </span>
          <span className="mt-1 block text-neutral-300">
            {english
              ? movie.restrictionPeriodEn || movie.restrictionPeriod
              : movie.restrictionPeriod}
          </span>
        </p>
      ) : null}
      <p>
        <span className="text-xs tracking-[0.18em] text-muted">
          {t("relatedContext")}
        </span>
        <span className="mt-1 block text-neutral-300">
          {english
            ? movie.restrictionContextEn || movie.restrictionContext
            : movie.restrictionContext}
        </span>
      </p>
      <p>
        <span className="text-xs tracking-[0.18em] text-muted">
          {t("currentStatus")}
        </span>
        <span className="mt-1 block text-neutral-200">
          {english ? movie.currentStatusEn || movie.currentStatus : movie.currentStatus}
        </span>
      </p>
      <div>
        <p className="text-xs tracking-[0.18em] text-muted">{t("sourceLabel")}</p>
        <ul className="mt-2 space-y-1">
          {movie.restrictionSources.map((source) => (
            <li key={`${source.publisher}-${source.url}`}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-200 underline-offset-4 hover:underline"
              >
                {source.publisher}
                <span className="text-muted"> · {source.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
