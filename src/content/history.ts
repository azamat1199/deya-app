import { IMAGES } from "./images";
import type { TranslationKey } from "@/lib/i18n/dictionary";

export interface HistorySlide {
  year: string;
  image: string;
  /** i18n key for this year's paragraph — no copy lives in the JSX. */
  paragraphKey: TranslationKey;
}

// Years are the client's list. Only 1996/1998/2001/2003 have their own archive
// photo in public/images; the rest reuse the generic history shot until real
// per-year photography is supplied.
export const historySlides: HistorySlide[] = [
  { year: "1994", image: IMAGES.historyChocolate, paragraphKey: "about.history.years.y1994" },
  { year: "1996", image: IMAGES.history1996, paragraphKey: "about.history.years.y1996" },
  { year: "1998", image: IMAGES.history1998, paragraphKey: "about.history.years.y1998" },
  { year: "2001", image: IMAGES.history2001, paragraphKey: "about.history.years.y2001" },
  { year: "2003", image: IMAGES.history2003, paragraphKey: "about.history.years.y2003" },
  { year: "2009", image: IMAGES.historyChocolate, paragraphKey: "about.history.years.y2009" },
  { year: "2014", image: IMAGES.historyChocolate, paragraphKey: "about.history.years.y2014" },
  { year: "2016", image: IMAGES.historyChocolate, paragraphKey: "about.history.years.y2016" },
  { year: "2021", image: IMAGES.historyChocolate, paragraphKey: "about.history.years.y2021" },
  { year: "2022", image: IMAGES.historyChocolate, paragraphKey: "about.history.years.y2022" },
  { year: "2026", image: IMAGES.historyChocolate, paragraphKey: "about.history.years.y2026" },
];
