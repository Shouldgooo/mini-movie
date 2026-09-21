import { db } from "../src/prisma/db.js";

const seedMovies = [
  {
    externalId: "seed-interstellar",
    titleZh: "星际穿越",
    titleEn: "Interstellar",
    posterUrl: null,
    releaseYear: 2014,
  },
  {
    externalId: "seed-spirited-away",
    titleZh: "千与千寻",
    titleEn: "Spirited Away",
    posterUrl: null,
    releaseYear: 2001,
  },
  {
    externalId: "seed-parasite",
    titleZh: "寄生虫",
    titleEn: "Parasite",
    posterUrl: null,
    releaseYear: 2019,
  },
  {
    externalId: "seed-inception",
    titleZh: "盗梦空间",
    titleEn: "Inception",
    posterUrl: null,
    releaseYear: 2010,
  },
  {
    externalId: "seed-your-name",
    titleZh: "你的名字。",
    titleEn: "Your Name",
    posterUrl: null,
    releaseYear: 2016,
  },
  {
    externalId: "seed-shawshank",
    titleZh: "肖申克的救赎",
    titleEn: "The Shawshank Redemption",
    posterUrl: null,
    releaseYear: 1994,
  },
];

async function seed() {
  for (const movie of seedMovies) {
    const existing = await db.orm.public.Movie.where({
      externalId: movie.externalId,
    }).first();

    if (existing) {
      continue;
    }

    await db.orm.public.Movie.create(movie);
    console.log(`Seeded movie: ${movie.titleZh}`);
  }

  console.log("Movie seed complete.");
}

seed().catch((error) => {
  console.error("Movie seed failed.");
  console.error(error);
  process.exit(1);
});
