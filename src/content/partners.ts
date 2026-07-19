import { IMAGES } from "./images";

export const partnersContent = {
  heading: "Как стать партнёром?",
  description:
    "Если вы поставщик сырья или желаете приобрести нашу продукцию, заполните форму ниже по кнопке и мы свяжемся с вами в ближайшее время.",
  image: IMAGES.historyChocolate,
} as const;

// Real partner names + links from the old site. Logo images aren't wired in
// yet (the source folder is a Google Drive link this tool can't browse) —
// each tile shows the real name/link so nothing here is fabricated.
export const partnerLogos = [
  { name: "Puratos", href: "https://www.puratos.com/" },
  { name: "SSNAB", href: "https://ssnab.ru/" },
  { name: "Esarom", href: "https://www.esarom.com/" },
  { name: "Cevikbas", href: "https://cevikbas.com/tr" },
  { name: "Empire Jams", href: "https://empirejams.com/" },
  { name: "Interfood", href: "https://www.interfood.com/ru/" },
  { name: "Memak", href: "https://memak.com/" },
  { name: "Nefamak", href: "https://nefamak.com/en/home" },
  { name: "Aromsa", href: "https://www.aromsa.com/" },
  { name: "Givaudan", href: "https://www.givaudan.com/" },
  { name: "JB Cocoa", href: "https://www.jbcocoa.com/" },
  { name: "EFKO", href: "https://www.efko.ru/" },
  { name: "Citric", href: "https://citric.uz/" },
  { name: "Eurosnab", href: "https://eurosnab.com/" },
  { name: "WUD", href: "https://www.w-u-d.com/" },
  { name: "Mossa Engineering", href: "https://mossaengineering.com/" },
  { name: "Chocotech", href: "https://www.chocotech.de/" },
  { name: "Symrise", href: "https://www.symrise.com/" },
  { name: "Conflex", href: "https://conflex.ru/" },
  { name: "SMS Kopuz", href: "https://www.smskopuz.com/en/" },
  { name: "Parlak", href: "https://parlak.uz/" },
] as const;
