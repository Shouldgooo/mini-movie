"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type ExpandableOverviewProps = {
  text: string;
  collapsedLines?: 3 | 6;
  className?: string;
};

const clampClass: Record<
  NonNullable<ExpandableOverviewProps["collapsedLines"]>,
  string
> = {
  3: "line-clamp-3",
  6: "line-clamp-6",
};

export default function ExpandableOverview({
  text,
  collapsedLines = 3,
  className = "max-w-xl text-sm leading-7 text-neutral-300",
}: ExpandableOverviewProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false);
  const [textSeen, setTextSeen] = useState(text);
  const { t } = useLanguage();

  if (text !== textSeen) {
    setTextSeen(text);
    setExpanded(false);
  }

  useLayoutEffect(() => {
    const node = textRef.current;

    if (!node || expanded) {
      return;
    }

    setCanToggle(node.scrollHeight > node.clientHeight + 1);
  }, [text, collapsedLines, expanded]);

  return (
    <div className="mt-4">
      <p
        ref={textRef}
        className={`${className} ${expanded ? "" : clampClass[collapsedLines]}`}
      >
        {text}
      </p>
      {canToggle && (
        <button
          type="button"
          className="mt-2 text-xs tracking-wide text-muted hover:text-foreground"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? t("showLess") : t("readMore")}
        </button>
      )}
    </div>
  );
}
