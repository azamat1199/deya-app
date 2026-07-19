import type { Locale } from "./i18n/config";

const RU_MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Formats an ISO date ("2025-07-10") for display, e.g. "10 июля 2025" / "July 10, 2025". */
export function formatPostDate(isoDate: string, locale: Locale): string {
  const [year, month, day] = isoDate.split("-").map(Number);

  if (locale === "ru") {
    return `${day} ${RU_MONTHS[month - 1]} ${year}`;
  }
  return `${EN_MONTHS[month - 1]} ${day}, ${year}`;
}
