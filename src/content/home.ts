import { IMAGES } from "./images";

export const homeContent = {
  about: {
    eyebrow: "О ФАБРИКЕ",
    heading: "Создаём вкус, которому доверяют с 1994 года",
    paragraphs: [
      "Кондитерская фабрика DEYA начала работу в 1994 году. Сегодня это одно из крупнейших производств Узбекистана, выпускающее более 200 наименований продукции и экспортирующее сладости в более чем 25 стран мира.",
      "Мы компания инновационного подхода и высокого качества. Предприятие выпускает продукцию на высокотехнологичном оборудовании от ведущих турецких и европейских производителей.",
    ],
    // NOT display text and deliberately NOT translated: these are MATCHING
    // KEYS. withEmphasis() searches the rendered paragraph for each of these
    // substrings and wraps the hits in a bold span. Translating them would
    // simply stop them matching. The consequence is known and accepted: on
    // /uz and /en the paragraph renders with no bold emphasis at all, because
    // the text there is not Russian. See the i18n report.
    paragraphHighlights: ["более 200 наименований продукции", "25 стран мира"],
    linkLabel: "Подробнее о фабрике",
    linkHref: "/about",
    factoryImage: IMAGES.newFactory,
  },
  exportMap: {
    heading:
      "Экспортируем качество\nи вкус в более чем 25 стран\n— география международных\nпоставок DEYA",
    truckStripImage: IMAGES.exportTrucks,
  },
  newsTeaser: {
    heading: "Новости из жизни DEYA",
  },
} as const;