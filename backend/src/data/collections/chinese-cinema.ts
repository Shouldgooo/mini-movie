import { publishedRestrictedFilms } from "../restricted-films.js";
import { text, type CollectionDefinition } from "./types.js";

const director = text("导演", "Director");

export const CHINESE_CINEMA_COLLECTIONS: CollectionDefinition[] = [
  {
    slug: "sixth-generation",
    titleZh: "中国第六代导演",
    titleEn: "Chinese Sixth Generation",
    category: "chinese-cinema",
    period: text("1990年代–2000年代", "1990s–2000s"),
    countries: [text("中国大陆", "Mainland China")],
    description: text(
      "“第六代”是对1990年代前后一批中国大陆导演的习惯叫法，而非严格的团体名册。张元、王小帅、贾樟柯、娄烨等人常用非职业演员、流动城市与个人生活，拍摄体制外或低成本作品。代际划分本身存在争议，本专题只选较常被归入这一脉络的执导作品。",
      "“Sixth Generation” is a convenient name for certain mainland directors around the 1990s, not a strict membership list. Zhang Yuan, Wang Xiaoshuai, Jia Zhangke, and Lou Ye often used non-professionals, drifting cities, and private lives, in independent or low-budget films. The generational label is itself disputed; this collection stays with directed works commonly placed in that lineage."
    ),
    people: [
      { name: "贾樟柯", role: director },
      { name: "张元", role: director },
      { name: "王小帅", role: director },
      { name: "娄烨", role: director },
      { name: "李杨", role: director },
      { name: "张扬", role: director },
    ],
    filmIds: [
      49927, 97943, 52103, 11599, 80427, 12659, 80243, 11492, 41292, 101908,
      17422, 2346,
    ],
    sources: [
      {
        title: "Cinema of China",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Cinema_of_China#Sixth_generation",
      },
    ],
  },
  {
    slug: "hong-kong-new-wave",
    titleZh: "香港新浪潮",
    titleEn: "Hong Kong New Wave",
    category: "chinese-cinema",
    period: text("1970年代末–1980年代", "late 1970s–1980s"),
    countries: [text("中国香港", "Hong Kong")],
    description: text(
      "香港新浪潮通常指1970年代末、1980年代初一批从电视转入电影的导演，如许鞍华、徐克、严浩、方育平、谭家明。他们把当代社会、类型片和作者意识放进当时的工业体系。运动起止并不整齐，本专题以早期代表作为主。",
      "Hong Kong New Wave usually names directors who moved from television into cinema around the late 1970s and early 1980s, including Ann Hui, Tsui Hark, Yim Ho, Allen Fong, and Patrick Tam. They brought contemporary society, genre, and authorship into the existing industry. The dates are not neat; this collection concentrates on early representative films."
    ),
    people: [
      { name: "许鞍华", role: director },
      { name: "徐克", role: director },
      { name: "严浩", role: director },
      { name: "方育平", role: director },
      { name: "谭家明", role: director },
      { name: "章国明", role: director },
    ],
    filmIds: [
      176219, 44914, 104287, 176213, 256071, 72445, 157229, 176217, 143479,
      41822,
    ],
    sources: [
      {
        title: "Hong Kong New Wave",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Hong_Kong_New_Wave",
      },
    ],
  },
  {
    slug: "mainland-restricted",
    titleZh: "大陆禁映与受限",
    titleEn: "Mainland China: Restricted & Limited Films",
    category: "chinese-cinema",
    featured: true,
    period: text("1980年代–2000年代", "1980s–2000s"),
    countries: [text("中国大陆", "Mainland China")],
    movieSource: "restricted-mainland",
    description: text(
      "这是一份有公开资料支持的编辑选片，不是热度或评分榜。名单主要来自 MV CAT《60部国产禁片大盘点》，只作候选线索。未在大陆公映并不等于被禁；后来上映、修改后上映或资料不足都会单独标明。",
      "This is an evidence-based editorial selection, not a popularity or ratings chart. The candidate list comes mainly from MV CAT’s roundup of 60 Chinese-language films described as banned or restricted. Absence of a mainland release is not the same as a ban; later release, release after cuts, and insufficient documentation are marked separately."
    ),
    filmIds: publishedRestrictedFilms().map((entry) => entry.tmdbId),
    sources: [
      {
        title: "60部国产禁片大盘点",
        publisher: "MV CAT",
        url: "https://www.mvcat.com/movies/1711.html",
      },
    ],
  },
];
