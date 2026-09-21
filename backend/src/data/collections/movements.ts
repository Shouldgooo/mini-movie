import { text, type CollectionDefinition } from "./types.js";

const director = text("导演", "Director");
const writer = text("编剧", "Writer");
const founder = text("发起人 / 导演", "Founder / director");
const leftBank = text("导演（左岸）", "Director (Left Bank)");

export const MOVEMENT_COLLECTIONS: CollectionDefinition[] = [
  {
    slug: "french-new-wave",
    titleZh: "法国新浪潮",
    titleEn: "French New Wave",
    category: "movement",
    featured: true,
    period: text("1950年代末–1960年代", "late 1950s–1960s"),
    countries: [text("法国", "France")],
    description: text(
      "法国新浪潮大致出现在1950年代末至1960年代。一群年轻导演离开制片厂，用实景、自然光和更灵活的剪辑拍摄当代生活。戈达尔、特吕弗、夏布洛尔、里维特、侯麦常被视为核心；瓦尔达与雷乃等左岸作者有时也被写入同一叙事，史学边界并不固定。",
      "The French New Wave emerged in the late 1950s and 1960s, as younger directors left the studios to film contemporary life with location shooting, natural light, and looser editing. Godard, Truffaut, Chabrol, Rivette, and Rohmer are often treated as a core group; Varda and Resnais of the Left Bank are sometimes placed in the same story, though historians do not draw the border in one way."
    ),
    people: [
      { name: "Jean-Luc Godard", role: director },
      { name: "François Truffaut", role: director },
      { name: "Agnès Varda", role: director },
      { name: "Éric Rohmer", role: director },
      { name: "Jacques Rivette", role: director },
      { name: "Claude Chabrol", role: director },
      { name: "Alain Resnais", role: leftBank },
    ],
    filmIds: [
      5562, 147, 269, 1818, 1628, 499, 5544, 4024, 2786, 2363, 1626, 43026,
    ],
    sources: [
      {
        title: "French New Wave",
        publisher: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/art/French-New-Wave",
      },
    ],
  },
  {
    slug: "taiwan-new-cinema",
    titleZh: "台湾新电影",
    titleEn: "Taiwan New Cinema",
    category: "movement",
    featured: true,
    period: text("1980年代", "1980s"),
    countries: [text("中国台湾", "Taiwan")],
    description: text(
      "台湾新电影兴起于1980年代初，由中影等机构支持的年轻导演开始拍摄当代台湾社会。它不只是侯孝贤与杨德昌两人的别名：万仁、柯一正、曾壮祥、陈坤厚等也参与了早期集体作品。对白、长镜头与历史记忆改变了此后华语作者电影的方向。",
      "Taiwan New Cinema took shape in the early 1980s, when younger filmmakers supported by Central Motion Picture began photographing contemporary Taiwan. It is not simply another name for Hou Hsiao-hsien and Edward Yang: Wan Jen, Ko I-cheng, Tseng Chuang-hsiang, and Chen Kunhou also worked on the early collective films. Dialogue, long takes, and historical memory shifted later Chinese-language auteur cinema."
    ),
    people: [
      { name: "侯孝贤", role: director },
      { name: "杨德昌", role: director },
      { name: "万仁", role: director },
      { name: "柯一正", role: director },
      { name: "曾壮祥", role: director },
      { name: "陈坤厚", role: director },
      { name: "吴念真", role: writer },
    ],
    filmIds: [
      130922, 176650, 105703, 106373, 92989, 106380, 45999, 45996, 78450,
      99599, 49982, 15804,
    ],
    sources: [
      {
        title: "Taiwanese New Wave",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Taiwanese_New_Wave",
      },
    ],
  },
  {
    slug: "iranian-new-wave",
    titleZh: "伊朗新浪潮",
    titleEn: "Iranian New Wave",
    category: "movement",
    featured: true,
    period: text("1960年代末起", "from the late 1960s"),
    countries: [text("伊朗", "Iran")],
    description: text(
      "伊朗新浪潮通常从1960年代末的诗意与社会写实传统说起，1979年后又在审查与实景拍摄中发展出新的国际面向。儿童、乡村道路、真实与扮演的边界，是基亚罗斯塔米、马克马巴夫与帕纳希等人常被讨论的方法。运动分期在不同电影史中并不完全一致。",
      "Iranian New Wave is usually traced from the poetic and social-realist films of the late 1960s, then from a later international period shaped by censorship and location shooting after 1979. Children, rural roads, and the line between documentary and performance are methods often discussed in Kiarostami, Makhmalbaf, and Panahi. Histories do not periodize the movement in identical ways."
    ),
    people: [
      { name: "Abbas Kiarostami", role: director },
      { name: "Dariush Mehrjui", role: director },
      { name: "Mohsen Makhmalbaf", role: director },
      { name: "Samira Makhmalbaf", role: director },
      { name: "Jafar Panahi", role: director },
      { name: "Majid Majidi", role: director },
    ],
    filmIds: [
      43984, 49964, 30017, 47104, 30020, 46785, 21334, 43978, 28988, 14633,
    ],
    sources: [
      {
        title: "Iranian New Wave",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Iranian_New_Wave",
      },
    ],
  },
  {
    slug: "korean-new-cinema",
    titleZh: "韩国新电影",
    titleEn: "Korean New Cinema",
    category: "movement",
    period: text("1990年代末–2000年代", "late 1990s–2000s"),
    countries: [text("韩国", "South Korea")],
    description: text(
      "所谓韩国新电影，多指1990年代末以降韩国电影工业复苏后的作者与类型实验，而不是一份共同宣言。李沧东、朴赞郁、奉俊昊、洪常秀、金基德等导演同时出现在国际影展与本土票房中。本专题只选这一时期里较常被讨论的代表作，边界本身仍有争议。",
      "“Korean New Cinema” usually names the authorial and genre experiments that followed the industry’s late-1990s revival, not a shared manifesto. Lee Chang-dong, Park Chan-wook, Bong Joon-ho, Hong Sang-soo, and Kim Ki-duk appeared at festivals and in domestic cinemas at once. This selection stays with frequently discussed films from that period; the label itself remains debated."
    ),
    people: [
      { name: "李沧东", role: director },
      { name: "朴赞郁", role: director },
      { name: "奉俊昊", role: director },
      { name: "洪常秀", role: director },
      { name: "金基德", role: director },
      { name: "许秦豪", role: director },
    ],
    filmIds: [95482, 26935, 41245, 2440, 11423, 670, 113, 1280, 1255, 47909],
    sources: [
      {
        title: "New Korean Cinema",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Cinema_of_South_Korea",
      },
    ],
  },
  {
    slug: "dogme-95",
    titleZh: "Dogme 95",
    titleEn: "Dogme 95",
    category: "movement",
    period: text("1995–2000年代中期", "1995–mid-2000s"),
    countries: [text("丹麦", "Denmark")],
    description: text(
      "Dogme 95 由拉斯·冯·提尔与托马斯·温特伯格于1995年在哥本哈根提出，强调实景、同期声、手持摄影，并拒绝类型片式的技术修饰。核心成员还包括克劳·雅各布森与克里斯蒂安·莱夫林。它是一份有编号的证书运动，而不是宽泛的“写实风格”标签。",
      "Dogme 95 was announced in Copenhagen in 1995 by Lars von Trier and Thomas Vinterberg. It asked for location shooting, live sound, and handheld cameras, and refused genre-film polish. Søren Kragh-Jacobsen and Kristian Levring were also among the original brethren. It is a numbered certificate movement, not a loose label for any realist style."
    ),
    people: [
      { name: "Lars von Trier", role: founder },
      { name: "Thomas Vinterberg", role: founder },
      { name: "Søren Kragh-Jacobsen", role: director },
      { name: "Kristian Levring", role: director },
      { name: "Lone Scherfig", role: director },
      { name: "Harmony Korine", role: director },
    ],
    filmIds: [309, 452, 139, 112, 10613, 42881, 102],
    sources: [
      {
        title: "Dogme 95",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Dogme_95",
      },
    ],
  },
  {
    slug: "italian-neorealism",
    titleZh: "意大利新现实主义",
    titleEn: "Italian Neorealism",
    category: "movement",
    period: text("1940年代中期–1950年代初", "mid-1940s–early 1950s"),
    countries: [text("意大利", "Italy")],
    description: text(
      "意大利新现实主义出现在二战结束前后，常用非职业演员、实景和当代贫困题材，处理占领、失业与日常生活。罗西里尼、德·西卡、维斯康蒂是最常被引用的名字。运动高峰相对短暂，1950年代初已逐渐转向其他形式，史学对其起止年份仍有讨论。",
      "Italian neorealism formed around the end of the Second World War, often using non-professional actors, real locations, and stories of occupation, unemployment, and daily poverty. Rossellini, De Sica, and Visconti are the names most often cited. The peak was relatively brief, and by the early 1950s the films were already turning elsewhere; historians still debate the dates."
    ),
    people: [
      { name: "Roberto Rossellini", role: director },
      { name: "Vittorio De Sica", role: director },
      { name: "Luchino Visconti", role: director },
      { name: "Cesare Zavattini", role: writer },
    ],
    filmIds: [307, 43469, 8429, 5156, 43445, 833, 43379, 8016],
    sources: [
      {
        title: "Neorealism",
        publisher: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/art/Neorealism-Italian-art",
      },
    ],
  },
  {
    slug: "japanese-new-wave",
    titleZh: "日本新浪潮",
    titleEn: "Japanese New Wave",
    category: "movement",
    period: text("1950年代末–1960年代", "late 1950s–1960s"),
    countries: [text("日本", "Japan")],
    description: text(
      "日本新浪潮多用来描述1950年代末以后，大岛渚、今村昌平、吉田喜重、篠田正浩等导演对工作室体制与既有题材的反叛。它没有一份统一宣言，敕使河原宏等艺术座导演有时被一并讨论。本专题选取较常被电影史列入这一脉络的作品，并不将边界视为绝对。",
      "Japanese New Wave usually describes the late-1950s revolt of Oshima, Imamura, Yoshida, Shinoda, and others against studio routine and inherited subjects. There was no single manifesto, and Art Theatre Guild directors such as Teshigahara are sometimes discussed alongside it. This selection stays with films commonly placed in that history and does not treat the border as absolute."
    ),
    people: [
      { name: "大岛渚", role: director },
      { name: "今村昌平", role: director },
      { name: "吉田喜重", role: director },
      { name: "篠田正浩", role: director },
      { name: "敕使河原宏", role: director },
    ],
    filmIds: [98639, 88527, 42984, 16672, 61475, 50696, 104744, 94466],
    sources: [
      {
        title: "Japanese New Wave",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Japanese_New_Wave",
      },
    ],
  },
  {
    slug: "new-german-cinema",
    titleZh: "德国新电影",
    titleEn: "New German Cinema",
    category: "movement",
    period: text("1960年代中期–1980年代初", "mid-1960s–early 1980s"),
    countries: [text("西德", "West Germany")],
    description: text(
      "德国新电影常从1962年《奥伯豪森宣言》与克鲁格等人的早期作品算起，并在1970年代因法斯宾德、赫尔佐格、文德斯、施隆多夫而获得国际可见度。它反对当时西德的商业娱乐片，转向历史、移民与旅行。成员风格差异很大，不宜理解成单一美学。",
      "New German Cinema is often dated from the 1962 Oberhausen Manifesto and early films by Kluge, then from the 1970s international visibility of Fassbinder, Herzog, Wenders, and Schlöndorff. It turned against West German commercial entertainment toward history, migration, and travel. The filmmakers’ styles differ widely and should not be read as one aesthetic."
    ),
    people: [
      { name: "Rainer Werner Fassbinder", role: director },
      { name: "Werner Herzog", role: director },
      { name: "Wim Wenders", role: director },
      { name: "Volker Schlöndorff", role: director },
      { name: "Alexander Kluge", role: director },
    ],
    filmIds: [89785, 216, 2000, 2204, 10834, 11222, 661, 659],
    sources: [
      {
        title: "New German Cinema",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/New_German_Cinema",
      },
    ],
  },
];
