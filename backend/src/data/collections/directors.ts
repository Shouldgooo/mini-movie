import { text, type CollectionDefinition } from "./types.js";

const director = text("导演", "Director");

export const DIRECTOR_COLLECTIONS: CollectionDefinition[] = [
  {
    slug: "wong-kar-wai",
    titleZh: "王家卫",
    titleEn: "Wong Kar-wai",
    category: "director",
    featured: true,
    period: text("1988–", "1988–"),
    countries: [text("中国香港", "Hong Kong")],
    themes: [
      text("都市疏离", "Urban isolation"),
      text("时间与等待", "Time and waiting"),
      text("爱情与记忆", "Love and memory"),
    ],
    description: text(
      "王家卫从《旺角卡门》开始独立执导，以香港都市、错位的爱情和时间感形成可辨识的作者风格。本专题只收录他担任导演的剧情长片，不包括仅参与编剧、制片或出演的作品。",
      "Wong Kar-wai began directing with As Tears Go By and formed a recognizable style around Hong Kong, missed connections, and the feel of time. This collection includes only narrative features he directed, not films he merely wrote, produced, or appeared in."
    ),
    filmIds: [24163, 18311, 11104, 40751, 11220, 18329, 843, 844, 1989, 44865],
    sources: [
      {
        title: "Wong Kar-Wai",
        publisher: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/biography/Wong-Kar-Wai",
      },
    ],
  },
  {
    slug: "edward-yang",
    titleZh: "杨德昌",
    titleEn: "Edward Yang",
    category: "director",
    featured: true,
    period: text("1982–2000", "1982–2000"),
    countries: [text("中国台湾", "Taiwan")],
    themes: [
      text("台北中产生活", "Taipei middle-class life"),
      text("历史创伤", "Historical trauma"),
      text("现代化与伦理", "Modernization and ethics"),
    ],
    description: text(
      "杨德昌是台湾新电影的关键导演之一，作品多以台北为舞台，处理家庭、中产生活与历史暴力。《海滩的一天》到《一一》构成相对完整的作者序列。本专题只收录他执导的剧情长片。",
      "Edward Yang was a central director of Taiwan New Cinema. His films often use Taipei to look at family, middle-class life, and historical violence. From That Day, on the Beach to Yi Yi they form a relatively complete authorial sequence. This collection includes only features he directed."
    ),
    filmIds: [106373, 106380, 78450, 15804, 54233, 54421, 25538],
    sources: [
      {
        title: "Edward Yang",
        publisher: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/biography/Edward-Yang",
      },
    ],
  },
  {
    slug: "hou-hsiao-hsien",
    titleZh: "侯孝贤",
    titleEn: "Hou Hsiao-hsien",
    category: "director",
    period: text("1980–", "1980–"),
    countries: [text("中国台湾", "Taiwan")],
    themes: [
      text("长镜头", "Long takes"),
      text("历史与日常生活", "History and everyday life"),
      text("时间的距离", "Distance in time"),
    ],
    description: text(
      "侯孝贤的剧情长片从1980年代台湾新电影起步，逐渐形成以长镜头、远距离观察历史与日常的方法。本专题按执导作品选片，不包括他担任制片或出演的他人影片。",
      "Hou Hsiao-hsien’s narrative features grew out of 1980s Taiwan New Cinema and toward long takes that watch history and daily life from a distance. This collection follows films he directed, not titles he produced or appeared in for other filmmakers."
    ),
    filmIds: [
      105703, 92989, 45999, 45996, 49982, 96712, 99600, 88811, 45935, 11553,
      11554, 253450,
    ],
    sources: [
      {
        title: "Hou Hsiao-hsien",
        publisher: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/biography/Hou-Hsiao-hsien",
      },
    ],
  },
  {
    slug: "abbas-kiarostami",
    titleZh: "阿巴斯",
    titleEn: "Abbas Kiarostami",
    category: "director",
    period: text("1970–2016", "1970–2016"),
    countries: [text("伊朗", "Iran")],
    themes: [
      text("真实与虚构", "Fact and fiction"),
      text("儿童与道路", "Children and roads"),
      text("汽车中的对话", "Conversation in cars"),
    ],
    description: text(
      "阿巴斯·基亚罗斯塔米的剧情长片常把扮演、纪录片笔法和简单情境叠在一起，从儿童寻找同学到后来的跨国合作。本专题只收录他执导的剧情长片，不包括仅由他编剧或监制的作品。",
      "Abbas Kiarostami’s narrative features often fold performance, documentary texture, and simple situations together, from a child looking for a classmate to later international collaborations. This collection includes only films he directed, not titles he merely wrote or produced."
    ),
    filmIds: [49964, 30017, 83761, 47104, 30020, 43423, 14633, 48303, 102001],
    sources: [
      {
        title: "Abbas Kiarostami",
        publisher: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/biography/Abbas-Kiarostami",
      },
    ],
  },
  {
    slug: "andrei-tarkovsky",
    titleZh: "塔可夫斯基",
    titleEn: "Andrei Tarkovsky",
    category: "director",
    period: text("1962–1986", "1962–1986"),
    countries: [
      text("苏联", "Soviet Union"),
      text("意大利", "Italy"),
      text("瑞典", "Sweden"),
    ],
    themes: [
      text("时间", "Time"),
      text("记忆", "Memory"),
      text("信仰与诗意影像", "Faith and poetic image"),
    ],
    description: text(
      "安德烈·塔可夫斯基的剧情长片数量很少，从《伊万的童年》到《牺牲》构成一条完整而缓慢的作者路径。本专题收录他执导的七部剧情长片，不包括剧场录像或他人剪辑的材料。",
      "Andrei Tarkovsky directed only a handful of narrative features. From Ivan’s Childhood to The Sacrifice they form one slow authorial path. This collection includes those seven films, not theatre recordings or material edited by others."
    ),
    filmIds: [31442, 895, 593, 1396, 1398, 1394, 24657],
    sources: [
      {
        title: "Andrey Arsenyevich Tarkovsky",
        publisher: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/biography/Andrey-Arsenyevich-Tarkovsky",
      },
    ],
  },
  {
    slug: "hirokazu-kore-eda",
    titleZh: "是枝裕和",
    titleEn: "Hirokazu Kore-eda",
    category: "director",
    period: text("1995–", "1995–"),
    countries: [text("日本", "Japan")],
    themes: [
      text("家庭", "Family"),
      text("丧亲与照护", "Grief and care"),
      text("日常伦理", "Everyday ethics"),
    ],
    description: text(
      "是枝裕和从纪录片经验进入剧情长片，作品多观察家庭、儿童与照护关系中的伦理缝隙。本专题只收录他担任导演的剧情长片，按创作时间排列。",
      "Hirokazu Kore-eda came to narrative features from documentary. His films often watch the ethical gaps inside families, childhood, and care. This collection includes only features he directed, in chronological order."
    ),
    filmIds: [
      18872, 17962, 2517, 25050, 79382, 177945, 315846, 374671, 505192, 736732,
    ],
    sources: [
      {
        title: "Koreeda Hirokazu",
        publisher: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/biography/Koreeda-Hirokazu",
      },
    ],
  },
];
