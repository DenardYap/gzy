import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./translations/en";
import zh from "./translations/zh";
import zhc from "./translations/zhc";
const lng = "zh";
const fallbackLng = "en";
const availableLanguages = ["en", "zh", "zhc"];

i18n
  .use(Backend)
  .use(LanguageDetector) // detect user language
  .use(initReactI18next)
  .init({
    resources: {
      en,
      zh,
      zhc,
    },
    lng,
    fallbackLng, // fallback language is english.

    detection: {
      checkWhitelist: true, // options for language detection
    },

    debug: false,

    whitelist: availableLanguages,

    interpolation: {
      escapeValue: false, // no need for react. it escapes by default
    },
  });

export default i18n;
