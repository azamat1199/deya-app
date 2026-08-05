import { IMAGES } from "./images";
import type { BlogBlock, NewsPost } from "./types";

const LOREM_A =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget nunc vitae justo vulputate tincidunt. Proin nec erat id erat bibendum iaculis. Suspendisse potenti. Sed vehicula mauris nec dolor convallis, nec gravida nibh malesuada. Aliquam erat volutpat. Cras vestibulum lectus vitae eros pretium, nec faucibus magna ullamcorper.";
const LOREM_B =
  "Integer faucibus magna ac elit gravida, nec placerat nisi accumsan. Proin posuere sapien vel posuere vehicula. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed viverra, elit at euismod tincidunt, lorem purus sagittis massa, in rhoncus augue ipsum sed erat.";
const LOREM_C =
  "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed cursus turpis sed urna tincidunt, vitae mattis velit fermentum. Aliquam non justo sit amet sapien luctus aliquam. Integer ut bibendum orci, nec aliquet metus. Aenean nec mi nibh. Suspendisse tristique arcu sit amet purus finibus ultricies.";
const LOREM_HEADING = "Lorem ipsum dolor sit amet, consectetur";
const LOREM_HEADING_LONG =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante";

/**
 * PLACEHOLDER BODY — replace per post as real copy arrives.
 *
 * Returns the section order from the design: paragraph, paragraph, image,
 * heading, paragraph, paragraph. The in-body image reuses the post's own
 * `cover` so no new assets are needed.
 *
 * To give a post real copy, delete the `placeholderBlocks(...)` call on that
 * post and write the array out literally. No code outside this file changes.
 */
function placeholderBlocks(cover: string, alt: string): BlogBlock[] {
  return [
    { type: "paragraph", text: LOREM_A },
    { type: "paragraph", text: LOREM_B },
    { type: "image", src: cover, alt },
    { type: "heading", level: 2, text: LOREM_HEADING },
    { type: "paragraph", text: LOREM_A },
    { type: "paragraph", text: LOREM_B },

    // Second half of the article. Both images reuse existing project assets —
    // the production line and the export convoy — rather than adding files.
    {
      type: "image",
      src: IMAGES.heroFactory,
      alt: "Производственная линия кондитерской фабрики Deya",
    },
    { type: "heading", level: 2, text: LOREM_HEADING_LONG },
    { type: "paragraph", text: LOREM_A },
    { type: "paragraph", text: LOREM_B },
    { type: "paragraph", text: LOREM_C },
    {
      type: "image",
      src: IMAGES.exportTrucks,
      alt: "Грузовики Deya в пути",
    },
  ];
}

// Real copy extracted from the Blog/Новости Figma export.
export const newsPosts: NewsPost[] = [
  {
    slug: "biznes-konferenciya-deya-2025",
    date: "2025-07-10",
    title: "Бизнес-конференция Deya 2025",
    excerpt:
      "Мы открыли двери фабрики для партнёров, провели экскурсию, поделились достижениями и вручили подарки лучшим...",
    cover: IMAGES.factoryAerial,
    blocks: placeholderBlocks(
      IMAGES.factoryAerial,
      "Бизнес-конференция Deya 2025",
    ),
  },
  {
    slug: "chto-seychas-lyubyat-pokupateli",
    date: "2025-07-02",
    title: "Что сейчас любят покупатели?",
    excerpt:
      "Вкусные новинки, востребованные форматы, неожиданные вкусы — делимся, что сегодня популярно в мире кондитерских изделий....",
    cover: IMAGES.productApachi,
    blocks: placeholderBlocks(
      IMAGES.productApachi,
      "Что сейчас любят покупатели?",
    ),
  },
  {
    slug: "idealnye-sladosti",
    date: "2025-05-08",
    title: "Идеальные сладости",
    excerpt:
      "Рассказываем, как рождаются наши вафли, конфеты и печенье — от выбора ингредиентов до упаковки. Загляните в мир, где каждая....",
    cover: IMAGES.chocolateGlazer,
    blocks: placeholderBlocks(IMAGES.chocolateGlazer, "Идеальные сладости"),
  },
  {
    slug: "istoriya-deya",
    date: "2025-04-14",
    title: "История Deya",
    excerpt:
      "Путь, которым мы гордимся: как небольшое производство выросло в экспортный бренд с узнаваемым стилем и вкусом. Читайте о....",
    cover: IMAGES.exportTrucks,
    blocks: placeholderBlocks(IMAGES.exportTrucks, "История Deya"),
  },

  // ---------------------------------------------------------------------
  // PLACEHOLDER COPY — replace before launch.
  // The four entries above came from the Figma export; these four do not.
  // They exist so the listing fills its 8-card first page and the
  // "load more" control has something to reveal. Deliberately written
  // without any verifiable claim — no awards, partners, dates of record or
  // figures — so nothing here can read as a factual company announcement.
  // Covers are reused from the existing image set.
  // ---------------------------------------------------------------------
  {
    slug: "kak-my-vybiraem-ingredienty",
    date: "2025-03-27",
    title: "Как мы выбираем ингредиенты",
    excerpt:
      "От какао-массы до ванили: рассказываем, на что смотрим при отборе сырья и почему на вкус готового продукта влияет каждая....",
    cover: IMAGES.chocolateGlazer,
    blocks: placeholderBlocks(
      IMAGES.chocolateGlazer,
      "Как мы выбираем ингредиенты",
    ),
  },
  {
    slug: "den-otkrytyh-dverey-na-fabrike",
    date: "2025-03-12",
    title: "День открытых дверей на фабрике",
    excerpt:
      "Показываем цеха изнутри: как выглядит смена, где рождается тесто для круассанов и что происходит с продуктом до упаковки....",
    cover: IMAGES.heroFactory,
    blocks: placeholderBlocks(
      IMAGES.heroFactory,
      "День открытых дверей на фабрике",
    ),
  },
  {
    slug: "upakovka-kotoraya-berezhet-vkus",
    date: "2025-02-19",
    title: "Упаковка, которая бережёт вкус",
    excerpt:
      "Почему форма пачки и материал плёнки — это не только про дизайн: разбираем, как упаковка помогает сохранить свежесть....",
    cover: IMAGES.productQuadro,
    blocks: placeholderBlocks(
      IMAGES.productQuadro,
      "Упаковка, которая бережёт вкус",
    ),
  },
  {
    slug: "chto-my-pechem-k-vesne",
    date: "2025-02-05",
    title: "Что мы печём к весне",
    excerpt:
      "Сезонные вкусы, лёгкие начинки и форматы на каждый день — заглядываем в планы кондитерского цеха на ближайшие месяцы....",
    cover: IMAGES.cookiesStack,
    blocks: placeholderBlocks(IMAGES.cookiesStack, "Что мы печём к весне"),
  },
  {
    slug: "vafli-i-ih-harakter",
    date: "2025-01-29",
    title: "Вафли и их характер",
    excerpt:
      "Хрусткость, толщина листа, плотность начинки — что отличает одну вафлю от другой и почему это заметно с первого....",
    cover: IMAGES.waferCandyMiller,
    blocks: placeholderBlocks(IMAGES.waferCandyMiller, "Вафли и их характер"),
  },
  {
    slug: "smena-nachinaetsya-rano",
    date: "2025-01-16",
    title: "Смена начинается рано",
    excerpt:
      "Утро на производстве: кто выходит первым, что проверяют до запуска линии и почему тишина в цехе длится недолго....",
    cover: IMAGES.historyChocolate,
    blocks: placeholderBlocks(IMAGES.historyChocolate, "Смена начинается рано"),
  },
  {
    slug: "krossany-bez-spehki",
    date: "2024-12-18",
    title: "Круассаны без спешки",
    excerpt:
      "Тесто любит время: рассказываем, сколько часов проходит от замеса до готового круассана и что происходит в паузах....",
    cover: IMAGES.croissantJam,
    blocks: placeholderBlocks(IMAGES.croissantJam, "Круассаны без спешки"),
  },
  {
    slug: "sladkoe-v-dorogu",
    date: "2024-12-04",
    title: "Сладкое в дорогу",
    excerpt:
      "Форматы, которые удобно взять с собой: небольшие пачки, плотная упаковка и вкусы, которые не приедаются в пути....",
    cover: IMAGES.productCaptainMiller,
    blocks: placeholderBlocks(IMAGES.productCaptainMiller, "Сладкое в дорогу"),
  },
];
