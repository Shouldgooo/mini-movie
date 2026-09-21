export function normalizeMovieTitle(title: string) {
  return title.replace(/[\s·・.．,《》()（）\-—]/g, "").toLowerCase();
}

function hasCjk(value: string) {
  return /[\u4e00-\u9fff]/.test(value);
}

export function isConfidentTitleYearMatch(input: {
  candidateTitle: string;
  candidateYear: number;
  tmdbTitle: string;
  tmdbOriginalTitle: string | null;
  tmdbYear: number | null;
}) {
  if (input.tmdbYear === null) {
    return false;
  }

  const yearDelta = Math.abs(input.tmdbYear - input.candidateYear);

  if (yearDelta > 1) {
    return false;
  }

  const candidate = normalizeMovieTitle(input.candidateTitle);
  const localized = normalizeMovieTitle(input.tmdbTitle);
  const original = normalizeMovieTitle(input.tmdbOriginalTitle ?? "");
  const originalText = input.tmdbOriginalTitle ?? "";

  if (original && original === candidate) {
    return true;
  }

  if (localized !== candidate) {
    return false;
  }

  if (hasCjk(originalText) || original === localized) {
    return true;
  }

  // Translated English originals may share a short Chinese title (e.g. 儿子 /
  // The Boys). Require an exact year, and ignore very short titles.
  return yearDelta === 0 && candidate.length >= 3;
}
