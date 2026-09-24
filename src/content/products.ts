import { IMAGES } from "./images";
import type { Product } from "./types";

// Real product names/badges copied verbatim from the Figma export.
export const featuredProducts: Product[] = [
  {
    slug: "apachi",
    categorySlug: "wafer-candies",
    title: "Конфеты вафельные глазированные «Apachi»",
    image: IMAGES.productApachi,
    badge: { text: "Новинка", variant: "new" },
  },
  {
    slug: "ketler-croissant",
    categorySlug: "croissants",
    title: "Круассан «Ketler» с шоколадной начинкой",
    image: IMAGES.productKetler,
    badge: { text: "Хит продаж", variant: "hit" },
  },
  {
    slug: "captain-miller-premium",
    categorySlug: "wafer-candies",
    title: "Конфеты вафельные глазированные «Captain Miller Premium»",
    image: IMAGES.productCaptainMiller,
  },
  {
    slug: "quadro",
    categorySlug: "waffles",
    title: "Вафли «Quadro» с фисташковой начинкой",
    image: IMAGES.productQuadro,
    badge: { text: "Новинка", variant: "new" },
  },
];
