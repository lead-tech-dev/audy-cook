import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Lang } from "@/types";
import { translations, TranslationKey } from "./translations";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = (localStorage.getItem("audycook_lang") as Lang) || "fr";
    return saved === "en" ? "en" : "fr";
  });

  useEffect(() => {
    localStorage.setItem("audycook_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const t = (key: TranslationKey) => translations[key][lang] || translations[key].fr;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
