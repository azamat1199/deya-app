import { IMAGES } from "./images";
import type { NewsPost } from "./types";

// Real copy extracted from the Blog/Новости Figma export.
export const newsPosts: NewsPost[] = [
  {
    slug: "biznes-konferenciya-deya-2025",
    date: "2025-07-10",
    title: "Бизнес-конференция Deya 2025",
    excerpt:
      "Мы открыли двери фабрики для партнёров, провели экскурсию, поделились достижениями и вручили подарки лучшим...",
    cover: IMAGES.factoryAerial,
  },
  {
    slug: "chto-seychas-lyubyat-pokupateli",
    date: "2025-07-02",
    title: "Что сейчас любят покупатели?",
    excerpt:
      "Вкусные новинки, востребованные форматы, неожиданные вкусы — делимся, что сегодня популярно в мире кондитерских изделий....",
    cover: IMAGES.productApachi,
  },
  {
    slug: "idealnye-sladosti",
    date: "2025-05-08",
    title: "Идеальные сладости",
    excerpt:
      "Рассказываем, как рождаются наши вафли, конфеты и печенье — от выбора ингредиентов до упаковки. Загляните в мир, где каждая....",
    cover: IMAGES.chocolateGlazer,
  },
  {
    slug: "istoriya-deya",
    date: "2025-04-14",
    title: "История Deya",
    excerpt:
      "Путь, которым мы гордимся: как небольшое производство выросло в экспортный бренд с узнаваемым стилем и вкусом. Читайте о....",
    cover: IMAGES.exportTrucks,
  },
];