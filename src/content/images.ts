// Typed lookup for the real photos in public/images. Content files import
// from here instead of hardcoding path strings, so a path only ever needs
// to change in one place.
export const IMAGES = {
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
  founderPortrait: "/images/founder-portrait.jpg",
} as const;
