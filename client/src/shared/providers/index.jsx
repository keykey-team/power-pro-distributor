// src/shared/providers/index.jsx
"use client";

import { ModalsProvider } from "@shared/context/ModalsContext";
import { I18nProvider } from "@shared/i18n/use-i18n";

export default function Providers({ children, locale, messages }) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <ModalsProvider>
        {children}
      </ModalsProvider>
    </I18nProvider>
  );
}