import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./en";
import te from "./te";
import hi from "./hi";

const i18n = new I18n({
  en,
  te,
  hi,
});

i18n.enableFallback = true;
i18n.defaultLocale = "en";

export const LANGUAGE_KEY = "app_language";

export const initLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

  if (savedLanguage) {
    i18n.locale = savedLanguage;
    return savedLanguage;
  }

  const deviceLanguage =
    Localization.getLocales?.()[0]?.languageCode || "en";

  const supportedLanguages = ["en", "te", "hi"];

  i18n.locale = supportedLanguages.includes(deviceLanguage)
    ? deviceLanguage
    : "en";

  return i18n.locale;
};

export const setAppLanguage = async (languageCode) => {
  i18n.locale = languageCode;
  await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
};

export const getCurrentLanguage = () => {
  return i18n.locale || "en";
};

export const t = (key, params) => {
  return i18n.t(key, params);
};

export default i18n;