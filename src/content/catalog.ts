import { IMAGES } from "./images";
import type { Product } from "./types";

// Full catalog listing. Ketler variants reuse the one real product photo we
// have; Taggis/Trocler use the placeholder until real photography exists.

// Real copy from the Figma export — generic enough (mentions multiple
// fillings as examples) that it applies to every Ketler flavor/pack as-is.
const KETLER_DESCRIPTION =
  "Круассан с 27 слоями воздушного теста, приготовленного из муки высшего сорта, и натуральной начинкой — отличный выбор для тех, кто заботится о качестве своего перекуса. В начинке используется настоящий бельгийский шоколад, малиновый джем и тд., без лишних добавок и заменителей. Упакован поштучно — удобно взять с собой на работу, учёбу или в дорогу. Ketler — когда важно не только быстро и сытно, но и по-настоящему натурально.";

const KETLER_FLAVOR_OPTIONS = [
  { label: "Шоколад", slug: "ketler-chocolate" },
  { label: "Персик", slug: "ketler-peach" },
  { label: "Малина", slug: "ketler-raspberry" },
  { label: "Варёная сгущенка", slug: "ketler-condensed-milk" },
  { label: "Ванильно-клубничный", slug: "ketler-vanilla-strawberry" },
  { label: "Ванильно-пломбирный", slug: "ketler-vanilla-custard" },
];

// Box weight/shelf life verified for the chocolate SKU only; reused across
// flavors since it's the same packaging line. Product codes beyond B-083
// (the one verified in the reference) are sequential placeholders.
function ketlerCharacteristics(code: string) {
  return [
    { label: "Вес ящика", value: "1,5 кг" },
    { label: "Срок хранения", value: "5 месяцев" },
    { label: "Код товара", value: code },
  ];
}

export const catalogProducts: Product[] = [
  {
    slug: "ketler-chocolate",
    categorySlug: "croissants",
    title: "Круассан «Ketler» с шоколадной начинкой",
    image: IMAGES.productKetler,
    badge: { text: "Хит продаж", variant: "hit" },
    description: KETLER_DESCRIPTION,
    gallery: [IMAGES.productKetler, IMAGES.croissantJam],
    flavorOptions: KETLER_FLAVOR_OPTIONS,
    weightOptions: [
      { label: "42 г", slug: "ketler-chocolate" },
      { label: "252 г", slug: "ketler-chocolate-pack" },
    ],
    characteristics: ketlerCharacteristics("B-083"),
  },
  {
    slug: "ketler-raspberry",
    categorySlug: "croissants",
    title: "Круассаны «Ketler» с малиновой начинкой",
    image: IMAGES.productKetler,
    description: KETLER_DESCRIPTION,
    gallery: [IMAGES.productKetler, IMAGES.croissantJam],
    flavorOptions: KETLER_FLAVOR_OPTIONS,
    weightOptions: [
      { label: "42 г", slug: "ketler-raspberry" },
      { label: "252 г", slug: "ketler-raspberry-pack" },
    ],
    characteristics: ketlerCharacteristics("B-084"),
  },
  {
    slug: "ketler-vanilla-strawberry",
    categorySlug: "croissants",
    title: "Круассаны «Ketler» с ванильно-клубничной начинкой",
    image: IMAGES.productKetler,
    description: KETLER_DESCRIPTION,
    gallery: [IMAGES.productKetler, IMAGES.croissantJam],
    flavorOptions: KETLER_FLAVOR_OPTIONS,
    weightOptions: [{ label: "42 г", slug: "ketler-vanilla-strawberry" }],
    characteristics: ketlerCharacteristics("B-085"),
  },
  {
    slug: "ketler-vanilla-custard",
    categorySlug: "croissants",
    title: "Круассаны «Ketler» с ванильно-пломбирной начинкой",
    image: IMAGES.productKetler,
    badge: { text: "Хит продаж", variant: "hit" },
    description: KETLER_DESCRIPTION,
    gallery: [IMAGES.productKetler, IMAGES.croissantJam],
    flavorOptions: KETLER_FLAVOR_OPTIONS,
    weightOptions: [{ label: "42 г", slug: "ketler-vanilla-custard" }],
    characteristics: ketlerCharacteristics("B-086"),
  },
  {
    slug: "ketler-condensed-milk",
    categorySlug: "croissants",
    title: "Круассаны «Ketler» с начинкой варенная сгущёнка",
    image: IMAGES.productKetler,
    badge: { text: "Хит продаж", variant: "hit" },
    description: KETLER_DESCRIPTION,
    gallery: [IMAGES.productKetler, IMAGES.croissantJam],
    flavorOptions: KETLER_FLAVOR_OPTIONS,
    weightOptions: [{ label: "42 г", slug: "ketler-condensed-milk" }],
    characteristics: ketlerCharacteristics("B-087"),
  },
  {
    slug: "ketler-peach",
    categorySlug: "croissants",
    title: "Круассаны «Ketler» с персиковой начинкой",
    image: IMAGES.productKetler,
    description: KETLER_DESCRIPTION,
    gallery: [IMAGES.productKetler, IMAGES.croissantJam],
    flavorOptions: KETLER_FLAVOR_OPTIONS,
    weightOptions: [{ label: "42 г", slug: "ketler-peach" }],
    characteristics: ketlerCharacteristics("B-088"),
  },
  {
    slug: "ketler-raspberry-pack",
    categorySlug: "croissants",
    title: "Круассаны «Ketler» с малиновой начинкой",
    image: IMAGES.productKetler,
    badge: { text: "Новинка", variant: "new" },
    description: KETLER_DESCRIPTION,
    gallery: [IMAGES.productKetler, IMAGES.croissantJam],
    flavorOptions: [
      { label: "Малина", slug: "ketler-raspberry-pack" },
      { label: "Шоколад", slug: "ketler-chocolate-pack" },
    ],
    weightOptions: [
      { label: "42 г", slug: "ketler-raspberry" },
      { label: "252 г", slug: "ketler-raspberry-pack" },
    ],
    characteristics: ketlerCharacteristics("B-089"),
  },
  {
    slug: "ketler-chocolate-pack",
    categorySlug: "croissants",
    title: "Круассаны «Ketler» с шоколадной начинкой",
    image: IMAGES.productKetler,
    badge: { text: "Новинка", variant: "new" },
    description: KETLER_DESCRIPTION,
    gallery: [IMAGES.productKetler, IMAGES.croissantJam],
    flavorOptions: [
      { label: "Малина", slug: "ketler-raspberry-pack" },
      { label: "Шоколад", slug: "ketler-chocolate-pack" },
    ],
    weightOptions: [
      { label: "42 г", slug: "ketler-chocolate" },
      { label: "252 г", slug: "ketler-chocolate-pack" },
    ],
    characteristics: ketlerCharacteristics("B-090"),
  },
  {
    slug: "taggis-triple-chocolate",
    categorySlug: "candies",
    title: "Конфеты «Taggis» три шоколада",
    image: IMAGES.placeholder,
  },
  {
    slug: "taggis-truffle",
    categorySlug: "candies",
    title: "Конфеты «Taggis» трюфель",
    image: IMAGES.placeholder,
  },
  {
    slug: "taggis-coconut",
    categorySlug: "candies",
    title: "Конфеты «Taggis» кокос",
    image: IMAGES.placeholder,
  },
  {
    slug: "taggis-brownie",
    categorySlug: "candies",
    title: "Конфеты «Taggis» со вкусом шоколадного брауни",
    image: IMAGES.placeholder,
  },
  {
    slug: "taggis-pina-colada",
    categorySlug: "candies",
    title: "Конфеты «Taggis» со вкусом пина колады",
    image: IMAGES.placeholder,
  },
  {
    slug: "taggis-tiramisu",
    categorySlug: "candies",
    title: "Конфеты «Taggis» со вкусом тирамису",
    image: IMAGES.placeholder,
  },
  {
    slug: "trocler-sesame",
    categorySlug: "wafer-candies",
    title: "Конфеты глазированные «Trocler» с кунжутом и вафельной крошкой",
    image: IMAGES.placeholder,
  },
];
