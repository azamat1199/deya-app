// Typed lookup for the real photos in public/images. Content files import
// from here instead of hardcoding path strings, so a path only ever needs
// to change in one place.
export const IMAGES = {
  heroFactory: "/images/hero-factory.jpg",
  factoryAerial: "/images/factory-aerial.jpg",
  croissantJam: "/images/croissant-jam.jpg",
  waferCandyMiller: "/images/wafer-candy-miller.jpg",
  chocolateGlazer: "/images/chocolate-glazer.jpg",
  cookiesStack: "/images/cookies-stack.jpg",
  productApachi: "/images/product-apachi.jpg",
  productKetler: "/images/product-ketler.jpg",
  productCaptainMiller: "/images/product-captain-miller.jpg",
  productQuadro: "/images/product-quadro.jpg",
  exportTrucks: "/images/export-trucks.jpg",
  historyChocolate: "/images/history-chocolate.jpg",
  // Year-specific archive photos supplied for the /about timeline. Only these
  // four exist; the remaining years fall back to historyChocolate.
  history1996: "/images/Photo_1996.png",
  history1998: "/images/Photo_1998.png",
  history2001: "/images/Photo_2001.png",
  history2003: "/images/Photo2003.png",
  founderPortrait: "/images/founder-portrait.jpg",
  productFrust: "/images/product-frust.jpg",
  certificateSanitary: "/images/certificate-sanitary.jpg",
  certificateHalal: "/images/certificate-halal.jpg",
  certificateIso22000: "/images/certificate-iso22000.jpg",
  placeholder: "/images/product-ketler.jpg",
  photoMan: "/images/Photo_man.png",
} as const;
