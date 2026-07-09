import { IMAGES } from "./images";
import type { Slide } from "./types";

// Placeholder copy — replace with the exact Figma hero copy once available.
export const slides: Slide[] = [
  {
    id: "croissants",
    badge: "НОВИНКА!",
    title: "Круассаны Deya — вкус, рождённый с любовью",
    description:
      "Нежное слоёное тесто и щедрая начинка в каждом круассане. Производим по традиционным рецептам с 1994 года и поставляем в более чем 25 стран мира.",
    ctaLabel: "Посмотреть каталог",
    ctaHref: "/catalog",
    image: IMAGES.croissantJam,
  },
  {
    id: "waffles",
    title: "Вафли Deya — хрустящее удовольствие",
    description:
      "Собственное производство полного цикла: от выбора ингредиентов до упаковки. Каждая вафля проходит строгий контроль качества.",
    ctaLabel: "Посмотреть каталог",
    ctaHref: "/catalog",
    image: IMAGES.waferCandyMiller,
  },
  {
    id: "candies",
    title: "Конфеты Deya — сладкие моменты каждый день",
    description:
      "Широкий ассортимент вкусов для всей семьи. Узнаваемый стиль и качество, которому доверяют покупатели в 25+ странах.",
    ctaLabel: "Посмотреть каталог",
    ctaHref: "/catalog",
    image: IMAGES.chocolateGlazer,
  },
];