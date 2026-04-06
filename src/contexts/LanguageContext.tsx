import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "bn" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: <T extends string | string[]>(bn: T, en: T) => T;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "bn",
  setLang: () => {},
  t: (bn) => bn,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === "undefined") return "bn";
    const saved = window.localStorage.getItem("oasis_language");
    return saved === "en" ? "en" : "bn";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("oasis_language", lang);
  }, [lang]);

  const t = <T extends string | string[]>(bn: T, en: T): T => (lang === "bn" ? bn : en);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
