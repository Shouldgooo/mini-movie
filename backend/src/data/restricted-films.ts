export const RESTRICTION_STATUSES = [
  "未获大陆公映许可",
  "曾被禁映 / 限制",
  "停止公映",
  "修改后公映",
  "后来解禁",
  "曾被报道为受限",
  "状态资料不足",
] as const;

export type RestrictionStatus = (typeof RESTRICTION_STATUSES)[number];

export type RestrictionSource = {
  title: string;
  publisher: string;
  url: string;
};

export type RestrictedFilmEntry = {
  tmdbId: number;
  candidateTitle: string;
  candidateYear: number;
  status: RestrictionStatus;
  period: string;
  currentStatus: string;
  context: string;
  sources: RestrictionSource[];
};

export const MVCAT_SOURCE: RestrictionSource = {
  title: "60部国产禁片大盘点",
  publisher: "MV CAT",
  url: "https://www.mvcat.com/movies/1711.html",
};

export const UNMATCHED_MVCAT_CANDIDATES = [
  {
    title: "儿子",
    year: 1999,
    reason:
      "TMDB 中文译名《儿子》会误匹配到澳大利亚影片 The Boys（1998）。张元《儿子》的TMDB年份为1996，与名单1999相差超过一年，故不收录。",
  },
];

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isPublishableRestrictedFilm(
  entry: RestrictedFilmEntry
): boolean {
  if (!Number.isInteger(entry.tmdbId) || entry.tmdbId <= 0) {
    return false;
  }

  if (
    !RESTRICTION_STATUSES.includes(entry.status) ||
    entry.context.trim().length === 0 ||
    entry.currentStatus.trim().length === 0
  ) {
    return false;
  }

  const sources = entry.sources.filter(
    (source) =>
      source.title.trim().length > 0 &&
      source.publisher.trim().length > 0 &&
      isHttpUrl(source.url)
  );

  return sources.length > 0;
}

function withMvcat(extra: RestrictionSource[] = []): RestrictionSource[] {
  return [MVCAT_SOURCE, ...extra];
}

const PREFIX =
  "MV CAT《60部国产禁片大盘点》将其列入候选名单。该文是影辑整理，不是官方禁片目录或政府决定。";

export const RESTRICTED_MAINLAND_FILMS: RestrictedFilmEntry[] = [
  {
    tmdbId: 41387,
    candidateTitle: "国产凌凌漆",
    candidateYear: 1994,
    status: "曾被报道为受限",
    period: "约1994年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 25838,
    candidateTitle: "鬼子来了",
    candidateYear: 2000,
    status: "未获大陆公映许可",
    period: "约2000年起",
    currentStatus: "公开报道未见大陆公映",
    context: PREFIX + "公开报道称该片未获电影局许可即参加戛纳，随后未获大陆公映许可，导演姜文被处多年不得拍片。此处记录公映许可与从业处罚，不把媒体转述的内容评价写成官方禁因。",
    sources: withMvcat([
      {
        title: "Jiang banned for seven years by China",
        publisher: "Screen International",
        url: "https://www.screendaily.com/jiang-banned-for-seven-years-by-china/402984.article",
      },
      {
        title: "Chinese director Jiang Wen banned from film-making",
        publisher: "The Guardian",
        url: "https://www.theguardian.com/film/2000/jul/14/news",
      },
    ]),
  },
  {
    tmdbId: 255526,
    candidateTitle: "我是你爸爸",
    candidateYear: 2000,
    status: "未获大陆公映许可",
    period: "约2000年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中称该片未经广电总局审查即自行参加海外影展。",
    sources: withMvcat(),
  },
  {
    tmdbId: 10997,
    candidateTitle: "霸王别姬",
    candidateYear: 1993,
    status: "曾被报道为受限",
    period: "约1993年",
    currentStatus: "文中称当年得以小规模公映",
    context: PREFIX + "文中称影片当年实际公映；作者认为曾有限制意图，但因国际奖项最终小规模上映。不把它标成至今禁映。",
    sources: withMvcat(),
  },
  {
    tmdbId: 11770,
    candidateTitle: "少林足球",
    candidateYear: 2001,
    status: "曾被报道为受限",
    period: "约2001年（候选名单）",
    currentStatus: "文中称当时禁止内地上映",
    context: PREFIX + "文中称该片在通过内地审批前已在香港上映，因而当时禁止内地上映。后继发行情况本文无法从该文单独确认。",
    sources: withMvcat(),
  },
  {
    tmdbId: 17422,
    candidateTitle: "颐和园",
    candidateYear: 2006,
    status: "未获大陆公映许可",
    period: "2006年起",
    currentStatus: "公开报道未见大陆公映",
    context: PREFIX + "2006年该片未获广电总局审查通过、未取得公映许可证即参加戛纳。电影局对导演娄烨与制片人耐安作出五年内不得从事相关电影业务的处罚。不把影片题材推断为官方禁因。",
    sources: withMvcat([
      {
        title: "China gives ‘Palace’ pair 5-year bans",
        publisher: "Variety",
        url: "https://variety.com/2006/film/news/china-gives-palace-pair-5-year-bans-1117949488/",
      },
      {
        title: "Director severely punished for evading censorship rules",
        publisher: "China Daily",
        url: "https://www.chinadaily.com.cn/china/2006-09-04/content_681215.htm",
      },
    ]),
  },
  {
    tmdbId: 192825,
    candidateTitle: "妈妈",
    candidateYear: 1990,
    status: "状态资料不足",
    period: "约1990年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中写被禁原因不详，具体限制情况仍不清楚。",
    sources: withMvcat(),
  },
  {
    tmdbId: 44162,
    candidateTitle: "蓝风筝",
    candidateYear: 1993,
    status: "未获大陆公映许可",
    period: "约1993年起",
    currentStatus: "文中称无法在中国大陆公映",
    context: PREFIX + "文中称该片未能在中国大陆公映，并记载导演田壮壮因此受到多年拍片限制。题材本身不能自动当作官方禁因原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 97943,
    candidateTitle: "北京杂种",
    candidateYear: 1993,
    status: "曾被报道为受限",
    period: "约1993年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中的说明偏调侃或推断，没有提供可核验的官方理由。",
    sources: withMvcat(),
  },
  {
    tmdbId: 31439,
    candidateTitle: "活着",
    candidateYear: 1994,
    status: "曾被报道为受限",
    period: "约1994年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 20083,
    candidateTitle: "新宿事件",
    candidateYear: 2009,
    status: "曾被报道为受限",
    period: "约2009年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 9407,
    candidateTitle: "红色角落",
    candidateYear: 1997,
    status: "曾被报道为受限",
    period: "约1997年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中的说明偏调侃或推断，没有提供可核验的官方理由。",
    sources: withMvcat(),
  },
  {
    tmdbId: 33194,
    candidateTitle: "天浴",
    candidateYear: 1998,
    status: "曾被报道为受限",
    period: "约1998年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 287171,
    candidateTitle: "赵先生",
    candidateYear: 1998,
    status: "状态资料不足",
    period: "约1998年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中写被禁原因不详，并称该片仍未能在国内上映。",
    sources: withMvcat(),
  },
  {
    tmdbId: 11599,
    candidateTitle: "苏州河",
    candidateYear: 2000,
    status: "状态资料不足",
    period: "约2000年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中写被禁原因不详，具体限制情况仍不清楚。",
    sources: withMvcat(),
  },
  {
    tmdbId: 58069,
    candidateTitle: "华丽的假期",
    candidateYear: 2007,
    status: "曾被报道为受限",
    period: "约2007年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 49706,
    candidateTitle: "维多利亚一号",
    candidateYear: 2010,
    status: "曾被报道为受限",
    period: "约2010年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 77878,
    candidateTitle: "昂山素季",
    candidateYear: 2011,
    status: "曾被报道为受限",
    period: "约2011年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 187271,
    candidateTitle: "武训传",
    candidateYear: 1952,
    status: "曾被禁映 / 限制",
    period: "约1951年起",
    currentStatus: "属历史限制记载",
    context: PREFIX + "文中将其列为历史限制影片。具体运动与处理过程超出该文可核验范围，这里只记候选名单上的历史限制记载。",
    sources: withMvcat(),
  },
  {
    tmdbId: 30112,
    candidateTitle: "苹果",
    candidateYear: 2007,
    status: "曾被报道为受限",
    period: "约2007年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 12659,
    candidateTitle: "十七岁的单车",
    candidateYear: 2001,
    status: "曾被报道为受限",
    period: "约2001年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 11658,
    candidateTitle: "太极旗飘扬",
    candidateYear: 2004,
    status: "曾被报道为受限",
    period: "约2004年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 253401,
    candidateTitle: "光棍儿",
    candidateYear: 2011,
    status: "曾被报道为受限",
    period: "约2011年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 11492,
    candidateTitle: "盲井",
    candidateYear: 2003,
    status: "曾被报道为受限",
    period: "约2003年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 51520,
    candidateTitle: "盲山",
    candidateYear: 2007,
    status: "曾被报道为受限",
    period: "约2007年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 52103,
    candidateTitle: "小武",
    candidateYear: 1997,
    status: "曾被报道为受限",
    period: "约1997年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 52059,
    candidateTitle: "天安门",
    candidateYear: 1996,
    status: "未获大陆公映许可",
    period: "约1995年起",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中指这是一部关于1989年政治风波的政论纪录片。名单年份为1996，TMDB公映年为1995，按片名与年份接近收录。",
    sources: withMvcat(),
  },
  {
    tmdbId: 117646,
    candidateTitle: "春风沉醉的夜晚",
    candidateYear: 2009,
    status: "状态资料不足",
    period: "约2009年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中的说明偏调侃或推断，没有提供可核验的官方理由。",
    sources: withMvcat(),
  },
  {
    tmdbId: 237696,
    candidateTitle: "邮差",
    candidateYear: 1995,
    status: "曾被报道为受限",
    period: "约1995年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 122973,
    candidateTitle: "芙蓉镇",
    candidateYear: 1986,
    status: "曾被报道为受限",
    period: "约1986年",
    currentStatus: "文中称当年成功公映",
    context: PREFIX + "文中明确说有人以为它被禁，但当年实际成功公映并获奖。因此不能标成禁片。",
    sources: withMvcat(),
  },
  {
    tmdbId: 80243,
    candidateTitle: "任逍遥",
    candidateYear: 2002,
    status: "未获大陆公映许可",
    period: "约2002年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中称该片因违规参赛而国内禁映。",
    sources: withMvcat(),
  },
  {
    tmdbId: 493487,
    candidateTitle: "太阳和人",
    candidateYear: 1980,
    status: "曾被禁映 / 限制",
    period: "约1980年",
    currentStatus: "属历史限制记载",
    context: PREFIX + "文中记载该片及相关作品《苦恋》曾受公开批判。具体处理过程以史料为准，不把台词解读写成官方禁因原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 255803,
    candidateTitle: "特别手术室",
    candidateYear: 1988,
    status: "状态资料不足",
    period: "约1988年",
    currentStatus: "文中称已解禁，或当年可能未被禁，资料不一致",
    context: PREFIX + "文中同时写“已解禁”和“据说当年没有被禁”，限制史并不清楚。",
    sources: withMvcat(),
  },
  {
    tmdbId: 293294,
    candidateTitle: "八旗子弟",
    candidateYear: 1988,
    status: "状态资料不足",
    period: "约1988年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中的说明偏调侃或推断，没有提供可核验的官方理由。",
    sources: withMvcat(),
  },
  {
    tmdbId: 298329,
    candidateTitle: "大鸿米店",
    candidateYear: 1995,
    status: "后来解禁",
    period: "约1995年起",
    currentStatus: "文中称后来解禁",
    context: PREFIX + "文中称该片后来已解禁。",
    sources: withMvcat(),
  },
  {
    tmdbId: 36615,
    candidateTitle: "看上去很美",
    candidateYear: 2006,
    status: "曾被报道为受限",
    period: "约2006年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 198620,
    candidateTitle: "日日夜夜",
    candidateYear: 2004,
    status: "曾被报道为受限",
    period: "约2004–2005年（候选名单为2004，TMDB为2005）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 255962,
    candidateTitle: "二弟",
    candidateYear: 2003,
    status: "曾被报道为受限",
    period: "约2003年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 461435,
    candidateTitle: "天上的恋人",
    candidateYear: 2003,
    status: "状态资料不足",
    period: "约2003年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中写被禁原因不详，具体限制情况仍不清楚。",
    sources: withMvcat(),
  },
  {
    tmdbId: 934857,
    candidateTitle: "山清水秀",
    candidateYear: 2003,
    status: "曾被报道为受限",
    period: "约2003年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 99333,
    candidateTitle: "哭泣的女人",
    candidateYear: 2002,
    status: "曾被报道为受限",
    period: "约2002年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 308711,
    candidateTitle: "丑角登场",
    candidateYear: 2004,
    status: "曾被报道为受限",
    period: "约2002–2004年（候选名单为2004，TMDB为2002）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 254479,
    candidateTitle: "今年夏天",
    candidateYear: 2001,
    status: "曾被报道为受限",
    period: "约2001年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 452380,
    candidateTitle: "桃花满天红",
    candidateYear: 1995,
    status: "状态资料不足",
    period: "约1995年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中写被禁原因不详，具体限制情况仍不清楚。",
    sources: withMvcat(),
  },
  {
    tmdbId: 778000,
    candidateTitle: "裸血",
    candidateYear: 1995,
    status: "状态资料不足",
    period: "约1994–1995年（候选名单为1995，TMDB为1994）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中写被禁原因不详，具体限制情况仍不清楚。",
    sources: withMvcat(),
  },
  {
    tmdbId: 255966,
    candidateTitle: "旧约",
    candidateYear: 2002,
    status: "曾被报道为受限",
    period: "约2001–2002年（候选名单为2002，TMDB为2001）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 125829,
    candidateTitle: "安阳婴儿",
    candidateYear: 2001,
    status: "曾被报道为受限",
    period: "约2001年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 80427,
    candidateTitle: "站台",
    candidateYear: 2000,
    status: "状态资料不足",
    period: "约2000年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中的说明偏调侃或推断，没有提供可核验的官方理由。",
    sources: withMvcat(),
  },
  {
    tmdbId: 44322,
    candidateTitle: "东宫西宫",
    candidateYear: 1996,
    status: "状态资料不足",
    period: "约1996年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中的说明偏调侃或推断，没有提供可核验的官方理由。",
    sources: withMvcat(),
  },
  {
    tmdbId: 148597,
    candidateTitle: "孩子王",
    candidateYear: 1987,
    status: "状态资料不足",
    period: "约1987年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中的说明偏调侃或推断，没有提供可核验的官方理由。",
    sources: withMvcat(),
  },
  {
    tmdbId: 125321,
    candidateTitle: "扁担·姑娘",
    candidateYear: 1998,
    status: "状态资料不足",
    period: "约1998年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中的说明偏调侃或推断，没有提供可核验的官方理由。",
    sources: withMvcat(),
  },
  {
    tmdbId: 68413,
    candidateTitle: "极度寒冷",
    candidateYear: 1996,
    status: "曾被报道为受限",
    period: "约1996年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 685370,
    candidateTitle: "迷岸",
    candidateYear: 1996,
    status: "曾被报道为受限",
    period: "约1994–1996年（候选名单为1996，TMDB为1994）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 124841,
    candidateTitle: "巫山云雨",
    candidateYear: 1996,
    status: "曾被报道为受限",
    period: "约1996年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 49927,
    candidateTitle: "冬春的日子",
    candidateYear: 1993,
    status: "曾被报道为受限",
    period: "约1993年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 99735,
    candidateTitle: "红颜",
    candidateYear: 2005,
    status: "曾被报道为受限",
    period: "约2005年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 299285,
    candidateTitle: "旅程",
    candidateYear: 2004,
    status: "曾被报道为受限",
    period: "约2004年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 817888,
    candidateTitle: "毛嗑儿",
    candidateYear: 2008,
    status: "曾被报道为受限",
    period: "约2008年（候选名单）",
    currentStatus: "候选名单未说明此后是否公映",
    context: PREFIX + "文中所写“被禁原因”属于编辑整理或看法，不能当作官方决定原文。",
    sources: withMvcat(),
  },
  {
    tmdbId: 238811,
    candidateTitle: "无人区",
    candidateYear: 2013,
    status: "修改后公映",
    period: "约2009–2013年",
    currentStatus: "文中称修改后已上映",
    context: PREFIX + "文中称该片经过多年修改后最终上映并取得票房。因此不能标成仍在禁映。",
    sources: withMvcat(),
  },
];

export function publishedRestrictedFilms() {
  return RESTRICTED_MAINLAND_FILMS.filter(isPublishableRestrictedFilm);
}
