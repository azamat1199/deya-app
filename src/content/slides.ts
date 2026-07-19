import { IMAGES } from "./images";
import type { Slide } from "./types";

// Slide 1 copy/photo is real, taken verbatim from the Figma hero export.
// Slide 2 reuses the croissants spotlight (real copy/photo already used
// elsewhere on the site) — the Figma export only captured the hero in its
// slide-1 state, so slide 2's exact design copy isn't available.
export const slides: Slide[] = [
  {
    id: "factory",
    title: "Кондитерская фабрика Deya",
    description:
      "Мы заново открываем историю вкуса и создаём сладости, которые любят в Узбекистане и за его пределами.",
    ctaLabel: "Посмотреть каталог",
    ctaHref: "/catalog",
    image: IMAGES.heroFactory,
  },
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
];