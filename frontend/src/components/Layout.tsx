import { Outlet } from "react-router-dom";
import { useLanguage } from "../providers/LanguageProvider";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ScrollManager } from "./ScrollManager";

export function Layout() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ScrollManager />
      <a
        href="#main"
        className="fixed start-4 top-3 z-[60] -translate-y-24 rounded-full bg-sand px-5 py-3 text-sm font-semibold text-forest-950 transition-transform focus:translate-y-0"
      >
        {t.common.skipToContent}
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
