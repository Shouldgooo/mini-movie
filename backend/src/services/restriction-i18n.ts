import type { RestrictionStatus } from "../data/restricted-films.js";

const PREFIX_ZH =
  "MV CAT《60部国产禁片大盘点》将其列入候选名单。该文是影辑整理，不是官方禁片目录或政府决定。";

const PREFIX_EN =
  "Listed as a candidate in MV CAT’s roundup of 60 Chinese-language films described as banned or restricted. That article is a cinephile compilation, not an official register or government decision.";

const GENERIC_EXTRA_EN =
  "Notes in the article about a so-called ban reason are editorial commentary and should not be read as an official government text.";

export const RESTRICTION_STATUS_EN: Record<RestrictionStatus, string> = {
  未获大陆公映许可: "Not granted a mainland theatrical release",
  "曾被禁映 / 限制": "Reported as previously banned or restricted",
  停止公映: "Theatrical run withdrawn",
  修改后公映: "Released after cuts",
  后来解禁: "Later released / restriction lifted",
  曾被报道为受限: "Reported as restricted",
  状态资料不足: "Insufficient documentation",
};

const CURRENT_STATUS_EN: Record<string, string> = {
  候选名单未说明此后是否公映:
    "The candidate list does not say whether it was later released",
  公开报道未见大陆公映:
    "Public reports do not show a mainland theatrical release",
  文中称当年得以小规模公映:
    "The article says it received a limited theatrical release that year",
  文中称当时禁止内地上映:
    "The article says a mainland release was blocked at the time",
  文中称无法在中国大陆公映:
    "The article says it could not be released in mainland China",
  属历史限制记载: "Recorded as a historical restriction",
  文中称当年成功公映: "The article says it was released that year",
  "文中称已解禁，或当年可能未被禁，资料不一致":
    "The article says the restriction was later lifted, or that it may not have been banned; the notes are inconsistent",
  文中称后来解禁: "The article says the restriction was later lifted",
  文中称修改后已上映: "The article says it was released after cuts",
};

function translatePeriod(period: string): string {
  let english = period
    .replaceAll("约", "c. ")
    .replaceAll("年起", " onward")
    .replaceAll("年", "")
    .replaceAll("（候选名单）", "(candidate list)")
    .replaceAll("（", " (")
    .replaceAll("）", ")");

  english = english.replace(/\s+/g, " ").trim();
  return english.length > 0 ? english : period;
}

function translateContext(context: string): string {
  const extra = context.startsWith(PREFIX_ZH)
    ? context.slice(PREFIX_ZH.length).trim()
    : context.trim();

  if (!extra) {
    return PREFIX_EN;
  }

  return `${PREFIX_EN} ${GENERIC_EXTRA_EN}`;
}

export function localizeRestrictionFields(entry: {
  status: RestrictionStatus;
  period: string;
  currentStatus: string;
  context: string;
}) {
  return {
    restrictionStatus: entry.status,
    restrictionStatusEn: RESTRICTION_STATUS_EN[entry.status],
    restrictionPeriod: entry.period,
    restrictionPeriodEn: translatePeriod(entry.period),
    restrictionContext: entry.context,
    restrictionContextEn: translateContext(entry.context),
    currentStatus: entry.currentStatus,
    currentStatusEn:
      CURRENT_STATUS_EN[entry.currentStatus] ?? entry.currentStatus,
  };
}
