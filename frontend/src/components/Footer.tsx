"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs leading-6 text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t("footerTmdb")}</p>
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 text-foreground hover:text-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tmdb-logo.svg"
            alt="The Movie Database"
            className="h-4 w-auto"
          />
          <span>TMDB</span>
        </a>
      </div>
    </footer>
  );
}
