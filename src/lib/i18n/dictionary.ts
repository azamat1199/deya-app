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
    allNews: string;
    openInYandexMap: string;
    partnerForm: string;
    becomePartner: string;
    allCatalog: string;
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
  };
  form: {
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    messagePlaceholder: string;
    consentPersonalDataPrefix: string;
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
  home: {
    placeholderTitle: string;
  };
}

type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : DotPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = DotPaths<Dictionary>;