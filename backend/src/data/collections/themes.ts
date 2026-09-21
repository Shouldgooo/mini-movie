import { text, type CollectionDefinition } from "./types.js";

const director = text("导演", "Director");

export const THEME_COLLECTIONS: CollectionDefinition[] = [
  {
    slug: "film-noir",
    titleZh: "黑色电影",
    titleEn: "Film Noir",
    category: "aesthetic",
    period: text("1940年代–1950年代末", "1940s–late 1950s"),
    countries: [text("美国", "United States")],
    description: text(
      "黑色电影主要用来描述1940至1950年代好莱坞的一套影像与叙事气质：夜景、犯罪、命运感和道德含混。它不是当时片厂使用的官方类型名，而是后来的批评概念。本专题选取较常被当作经典黑的作品，不把后来所有“新黑色”都算进来。",
      "Film noir describes a set of images and narrative moods in 1940s–1950s Hollywood: night, crime, fate, and moral murk. It was not a studio genre label at the time, but a later critical idea. This collection stays with films commonly treated as classic noir and does not absorb every later neo-noir."
    ),
    people: [
      { name: "John Huston", role: director },
      { name: "Billy Wilder", role: director },
      { name: "Otto Preminger", role: director },
      { name: "Howard Hawks", role: director },
      { name: "Jacques Tourneur", role: director },
      { name: "Carol Reed", role: director },
    ],
    filmIds: [963, 996, 1939, 910, 678, 1092, 599, 17057, 1480, 14638],
    sources: [
      {
        title: "film noir",
        publisher: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/art/film-noir",
      },
    ],
  },
  {
    slug: "road-movies",
    titleZh: "公路电影",
    titleEn: "Road Movies",
    category: "culture",
    period: text("1960年代末起", "from the late 1960s"),
    countries: [
      text("美国", "United States"),
      text("德国", "Germany"),
      text("拉丁美洲", "Latin America"),
    ],
    description: text(
      "公路电影以道路、汽车和移动中的人物关系组织叙事，常见于战后美国独立电影，也被欧洲与拉丁美洲导演改写。它不是一个有宣言的运动，而是一种反复出现的形式。本专题选的是较常被讨论的代表作，而不是“凡有开车镜头即可入选”。",
      "Road movies organize story around roads, cars, and relationships in motion. They are common in postwar American independent cinema and were rewritten by European and Latin American directors. This is a recurring form, not a manifesto movement. The films here are frequently discussed examples, not every movie that contains a car."
    ),
    people: [
      { name: "Dennis Hopper", role: director },
      { name: "Wim Wenders", role: director },
      { name: "Ridley Scott", role: director },
      { name: "Walter Salles", role: director },
      { name: "Alfonso Cuarón", role: director },
    ],
    filmIds: [624, 27236, 2204, 10834, 655, 1541, 483, 1653, 1391, 666],
    sources: [
      {
        title: "Road movie",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Road_movie",
      },
    ],
  },
  {
    slug: "cyberpunk",
    titleZh: "赛博朋克电影",
    titleEn: "Cyberpunk Cinema",
    category: "aesthetic",
    period: text("1980年代起", "from the 1980s"),
    countries: [text("美国", "United States"), text("日本", "Japan")],
    description: text(
      "赛博朋克电影借用科幻小说中的高技术与低生活图景：公司权力、改造身体、虚拟空间和都市雨夜。它不是单一国家的电影运动。本专题收录常被当作这一视觉与主题传统的作品，包括动画长片；排名系统里的真人剧情限制并不适用于专题。",
      "Cyberpunk cinema borrows the high-tech, low-life picture of the fiction: corporate power, altered bodies, virtual space, and rainy cities. It is not one national movement. This collection includes films commonly treated as part of that visual and thematic tradition, including animation. The live-action limits used in rankings do not apply here."
    ),
    people: [
      { name: "Ridley Scott", role: director },
      { name: "押井守", role: director },
      { name: "Lana Wachowski", role: director },
      { name: "Lilly Wachowski", role: director },
      { name: "David Cronenberg", role: director },
    ],
    filmIds: [78, 9323, 603, 335984, 1946, 281, 180, 152601, 97, 5548],
    sources: [
      {
        title: "Cyberpunk",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Cyberpunk",
      },
    ],
  },
  {
    slug: "queer-cinema",
    titleZh: "酷儿电影",
    titleEn: "Queer Cinema",
    category: "culture",
    period: text("1980年代起", "from the 1980s"),
    countries: [
      text("美国", "United States"),
      text("英国", "United Kingdom"),
      text("法国", "France"),
      text("中国台湾", "Taiwan"),
      text("中国香港", "Hong Kong"),
      text("中国大陆", "Mainland China"),
    ],
    description: text(
      "酷儿电影在此指以同性欲望、性别越界或性少数生活为叙事核心的作品，而不是一份单一宣言。1990年代的 New Queer Cinema 是其中一段被命名的历史，更早与更晚的影片也持续存在。本专题选取有明确文本依据的代表作，不把“读起来像”的影片算入。",
      "Queer cinema here means films whose stories turn on same-sex desire, gender crossing, or LGBTQ lives, not a single manifesto. 1990s New Queer Cinema is one named chapter; earlier and later films continue around it. This selection uses works with a clear textual basis and does not include films merely because they “feel” queer."
    ),
    people: [
      { name: "Stephen Frears", role: director },
      { name: "Gus Van Sant", role: director },
      { name: "李安", role: director },
      { name: "王家卫", role: director },
      { name: "Céline Sciamma", role: director },
      { name: "张元", role: director },
    ],
    filmIds: [
      11240, 468, 9261, 18329, 142, 258480, 376867, 531428, 44322, 26371, 294,
      226,
    ],
    sources: [
      {
        title: "New Queer Cinema",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/New_Queer_Cinema",
      },
    ],
  },
  {
    slug: "shadows-of-espionage",
    titleZh: "暗影年代：战争与间谍电影",
    titleEn: "Shadows of Espionage",
    category: "culture",
    period: text("1930年代–2010年代", "1930s–2010s"),
    countries: [
      text("美国", "United States"),
      text("英国", "United Kingdom"),
      text("法国", "France"),
      text("德国", "Germany"),
    ],
    description: text(
      "本专题关注战争时期欧洲、抵抗运动与冷战情报世界中的电影：秘密身份、分裂忠诚、出卖，以及道德含混的政治空间。它不是动作间谍片或当代系列电影的合集，而是克制、阴翳、偏黑色电影气质的情报与政治叙事。",
      "This collection looks at wartime Europe, resistance, and Cold War intelligence: secret identities, divided loyalties, betrayal, and morally ambiguous political worlds. It is not a list of action spy movies or modern franchises, but of restrained, noir-inflected films about information, trust, and political fog."
    ),
    people: [
      { name: "Alfred Hitchcock", role: director },
      { name: "Carol Reed", role: director },
      { name: "Jean-Pierre Melville", role: director },
      { name: "Martin Ritt", role: director },
      { name: "Francis Ford Coppola", role: director },
      { name: "Tomas Alfredson", role: director },
    ],
    filmIds: [
      260, 289, 303, 1092, 982, 13580, 15247, 15383, 592, 11963, 582, 49517,
    ],
    sources: [
      {
        title: "Spy film",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Spy_film",
      },
    ],
  },
];
