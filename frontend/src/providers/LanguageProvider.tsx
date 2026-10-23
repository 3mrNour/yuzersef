import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { copy, type Lang, type SiteCopy } from "../content";

interface LanguageValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: SiteCopy;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageValue | null>(null);

function readStoredLang(): Lang {
  try {
    return localStorage.getItem("yuzersef.lang") === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    document.title = copy[lang].meta.title;

    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", copy[lang].meta.description);

    try {
      localStorage.setItem("yuzersef.lang", lang);
    } catch {
      // Storage can be unavailable in private browsing.
    }
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(
    () => setLangState((current) => (current === "ar" ? "en" : "ar")),
    [],
  );

  const value = useMemo<LanguageValue>(
    () => ({ lang, dir, t: copy[lang], setLang, toggleLang }),
    [lang, dir, setLang, toggleLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
