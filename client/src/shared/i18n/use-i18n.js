// src/shared/i18n/use-i18n.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const I18nContext = createContext(null);

export function I18nProvider({ locale, messages, children }) {
  // Используем стейт для сообщений и локали
  const [currentMessages, setCurrentMessages] = useState(messages);
  const [currentLocale, setCurrentLocale] = useState(locale);

  // Обновляем сообщения и локаль при их изменении
  useEffect(() => {
    if (messages && messages !== currentMessages) {
      setCurrentMessages(messages);
    }
  }, [messages, currentMessages]);

  useEffect(() => {
    if (locale && locale !== currentLocale) {
      setCurrentLocale(locale);
    }
  }, [locale, currentLocale]);

  const t = (key) => {
    const parts = key.split(".");
    let value = currentMessages;

    for (const part of parts) {
      value = value?.[part];
    }

    if (!value) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Missing translation: ${key}`);
      }
      return key;
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{
      locale: currentLocale,
      t
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

// ✅ Хук для получения только локали
export function useLocale() {
  const { locale } = useI18n();
  return locale;
}

// ✅ Хук для получения только функции перевода
export function useTranslations() {
  const { t } = useI18n();
  return t;
}