import { IMAGES } from "./images";
import type { NewsPost } from "./types";

// Real copy extracted from the Blog/Новости Figma export.
export const newsPosts: NewsPost[] = [
  {
    slug: "biznes-konferenciya-deya-2025",
    date: "10 июля 2025",
    title: "Бизнес-конференция Deya 2025",
    excerpt:
      "Мы открыли двери фабрики для партнёров, провели экскурсию, поделились достижениями и вручили подарки лучшим...",
    cover: IMAGES.factoryAerial,
  },
  {
    slug: "chto-seychas-lyubyat-pokupateli",
    date: "2 июля 2025",
    title: "Что сейчас любят покупатели?",
    excerpt:
      "Вкусные новинки, востребованные форматы, неожиданные вкусы — делимся, что сегодня популярно в мире кондитерских изделий....",
    cover: IMAGES.productApachi,
  },
  {
    slug: "idealnye-sladosti",
    date: "8 мая 2025",
    title: "Как мы создаём сладости",
    excerpt:
      "Рассказываем, как рождаются наши вафли, конфеты и печенье — от выбора ингредиентов до упаковки. Загляните в мир, где каждая....",
    cover: IMAGES.chocolateGlazer,
  },
  {
    slug: "istoriya-deya",
    date: "14 апреля 2025",
    title: "История Deya",
    excerpt:
      "Путь, которым мы гордимся: как небольшое производство выросло в экспортный бренд с узнаваемым стилем и вкусом. Читайте о....",
    cover: IMAGES.exportTrucks,
  },
];