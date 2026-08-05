export interface Dictionary {
  nav: {
    about: string;
    products: string;
    partners: string;
    careers: string;
    news: string;
    contacts: string;
  };
  buttons: {
    viewCatalog: string;
    toCatalog: string;
    sendRequest: string;
    downloadCatalog: string;
    readMore: string;
    send: string;
    showMoreNews: string;
    backToList: string;
    backToHome: string;
    allNews: string;
    openInYandexMap: string;
    partnerForm: string;
    becomePartner: string;
    allCatalog: string;
    showMoreProducts: string;
    contactSales: string;
    vacancies: string;
  };
  categories: {
    croissants: string;
    waffles: string;
    waferCandies: string;
    candies: string;
    cookies: string;
  };
  footer: {
    navigation: string;
    products: string;
    address: string;
    addressValue: string;
    newsletter: string;
    newsletterText: string;
    newsletterConsent: string;
    contacts: string;
    hotline: string;
    documents: string;
    privacyPolicy: string;
    consent: string;
    workingHours: string;
    workingHoursValue: string;
    copyright: string;
    designCredit: string;
    devCredit: string;
  };
  form: {
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    messagePlaceholder: string;
    consentPersonalDataPrefix: string;
    consentLinkText: string;
    consentMiddle: string;
    consentPrivacyLinkText: string;
    privacyPolicyLinkText: string;
    consentMarketing: string;
    emailInvalid: string;
    newsletterSuccess: string;
    success: string;
    error: string;
  };
  common: {
    phone: string;
    phoneRaw: string;
    eng: string;
    rus: string;
  };
  about: {
    history: {
      title: string;
      timelineLabel: string;
      /** One paragraph per timeline year. */
      years: {
        y1994: string;
        y1996: string;
        y1998: string;
        y2001: string;
        y2003: string;
        y2009: string;
        y2014: string;
        y2016: string;
        y2021: string;
        y2022: string;
        y2026: string;
      };
    };
  };
  home: {
    placeholderTitle: string;
    newsTeaser: {
      heading: string;
      /** Shown instead of the grid when no posts are available. */
      empty: string;
    };
    exportMap: {
      /** Screen-reader description of the export-destinations diagram. */
      mapLabel: string;
      truckAlt: string;
      modalTitle: string;
    };
  };
  blog: {
    /** Heading of the related-posts section on a post's detail page. */
    otherArticles: string;
  };
}

type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : DotPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = DotPaths<Dictionary>;
