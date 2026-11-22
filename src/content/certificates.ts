import { IMAGES } from "./images";

export interface Certificate {
  slug: string;
  title: string;
  standard: string;
  image: string;
}

export const certificates: Certificate[] = [
  {
    slug: "sanitary",
    title: "Санитарно-эпидемиологическое заключение",
    standard: "Госсанэпиднадзор Республики Узбекистан",
    image: IMAGES.certificateSanitary,
  },
  {
    slug: "halal",
    title: "Халяль сертификат",
    standard: "World Halal Trust",
    image: IMAGES.certificateHalal,
  },
  {
    slug: "iso-22000",
    title: "Сертификат соответствия",
    standard: "O'z DSt ISO 22000:2019",
    image: IMAGES.certificateIso22000,
  },
];
