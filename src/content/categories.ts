import { IMAGES } from "./images";
import type { Category } from "./types";

// Home page category grid shows 4 tiles. The full catalog has a 5th
// category ("Конфеты вафельные") not featured here — see catalog content.
export const homeCategories: Category[] = [
  { slug: "croissants", title: "Круассаны", image: IMAGES.croissantJam },
  { slug: "waffles", title: "Вафли", image: IMAGES.waferCandyMiller },
  { slug: "candies", title: "Конфеты", image: IMAGES.chocolateGlazer },
  { slug: "cookies", title: "Печенье", image: IMAGES.cookiesStack },
];