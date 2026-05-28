import React, {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentLanguage,
  initLanguage,
  setAppLanguage,
} from "../i18n";

export const LanguageContext =
  createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] =
    useState("en");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      await initLanguage();

      setLanguage(getCurrentLanguage());
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (
    languageCode
  ) => {
    try {
      await setAppLanguage(languageCode);

      setLanguage(languageCode);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        loading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}