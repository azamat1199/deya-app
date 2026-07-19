export const contactsContent = {
  heading: "Свяжитесь с нами удобным способом",
  hotline: {
    label: "Горячая линия",
    value: "+998 55 151 55 55",
    raw: "+998551515555",
  },
  email: {
    label: "E-mail",
    value: "info@deya.uz",
  },
  hours: {
    label: "График работы",
    value: "Понедельник — Суббота\nс 9:00 до 18:00",
  },
  social: {
    label: "Мы в социальных сетях",
    links: [
      { label: "Instagram", href: "#" },
      { label: "Telegram канал", href: "#" },
    ],
  },
  address: {
    label: "Наш адрес",
    value: "Республика Узбекистан, 130100, г.Джизак, промышленная зона «А»",
    mapHref: "#",
  },
  form: {
    consentPrefix: "Я подтверждаю ознакомление и даю",
    consentLinkText: "Согласие на обработку моих персональных данных",
    consentMiddle: "в порядке и на условиях, указанных в",
    privacyLinkText: "Политике конфиденциальности",
    marketingConsent:
      "Я даю согласие на получение новостей и специальных предложений от DEYA",
  },
} as const;
