"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className="flex items-center gap-2 text-xs tracking-wide"
      role="group"
      aria-label={t("language")}
    >
      <button
        type="button"
        aria-pressed={language === "zh"}
        aria-label="中文"
        onClick={() => setLanguage("zh")}
        className={
          language === "zh"
            ? "text-foreground"
            : "text-muted hover:text-foreground"
        }
      >
        中文
      </button>
      <span className="text-muted" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        aria-pressed={language === "en"}
        aria-label="English"
        onClick={() => setLanguage("en")}
        className={
          language === "en"
            ? "text-foreground"
            : "text-muted hover:text-foreground"
        }
      >
        EN
      </button>
    </div>
  );
}
