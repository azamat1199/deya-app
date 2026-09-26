// Typed lookup for the real photos in public/images. Content files import
// from here instead of hardcoding path strings, so a path only ever needs
// to change in one place.
export const IMAGES = {
  heroFactory: "/images/hero-factory.webp",
  factoryAerial: "/images/factory-aerial.webp",
  /** The current factory exterior, replacing factoryAerial on the home page's
   *  about band. factoryAerial stays — content/news.ts still uses it for a post
   *  cover and a body image. */
  newFactory: "/images/new_factory.webp",
  croissantJam: "/images/croissant-jam.webp",
  waferCandyMiller: "/images/wafer-candy-miller.webp",
  chocolateGlazer: "/images/chocolate-glazer.webp",
  cookiesStack: "/images/cookies-stack.webp",
  productApachi: "/images/product-apachi.webp",
  productKetler: "/images/product-ketler.webp",
  productCaptainMiller: "/images/product-captain-miller.webp",
  productQuadro: "/images/product-quadro.webp",
  exportTrucks: "/images/export-trucks.webp",
  historyChocolate: "/images/history-chocolate.webp",
  // Year-specific archive photos supplied for the /about timeline. Only these
  // four exist; the remaining years fall back to historyChocolate.
  history1996: "/images/Photo_1996.webp",
  history1998: "/images/Photo_1998.webp",
  history2001: "/images/Photo_2001.webp",
  history2003: "/images/Photo2003.webp",
  founderPortrait: "/images/founder-portrait.webp",
  productFrust: "/images/product-frust.webp",
  certificateSanitary: "/images/certificate-sanitary.webp",
  certificateHalal: "/images/certificate-halal.webp",
  certificateIso22000: "/images/certificate-iso22000.webp",
  placeholder: "/images/product-ketler.webp",
  photoMan: "/images/Photo_man.webp",
} as const;
