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

// Shown in the "Мы также рекомендуем" block on product detail pages.
// Glazer draže has no real photo yet — uses the placeholder until one exists.
export const recommendedProducts: Product[] = [
  {
    slug: "captain-miller-premium",
    categorySlug: "wafer-candies",
    title: "Конфеты вафельные глазированные «Captain Miller Premium»",
    image: IMAGES.productCaptainMiller,
    badge: { text: "Хит продаж", variant: "hit" },
  },
  {
    slug: "apachi",
    categorySlug: "wafer-candies",
    title: "Конфеты вафельные глазированные «Apachi»",
    image: IMAGES.productApachi,
    badge: { text: "Новинка", variant: "new" },
  },
  {
    slug: "glazer-chocolate-dragee",
    categorySlug: "candies",
    title: "Драже глазированное «Glazer» с шоколадным вкусом",
    image: IMAGES.placeholder,
  },
  {
    slug: "frust-strawberry-cream",
    categorySlug: "waffles",
    title: "Вафли «Frust» со вкусом клубники со сливками",
    image: IMAGES.productFrust,
    badge: { text: "Хит продаж", variant: "hit" },
  },
];
