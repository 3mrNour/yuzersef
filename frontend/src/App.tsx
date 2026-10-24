import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DesignDraftProvider } from "./features/studio/DesignDraft";
import { Home } from "./pages/Home";
import { RequestPage } from "./pages/RequestPage";
import { TrackPage } from "./pages/TrackPage";
import { StudioPage } from "./pages/StudioPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { AccountPage } from "./pages/AccountPage";

const DevPrintAreaPage = lazy(async () => {
  const module = await import("./pages/DevPrintAreaPage");
  return { default: module.DevPrintAreaPage };
});

const DevStudio3D = lazy(async () => {
  const module = await import("./pages/DevStudio3D");
  return { default: module.DevStudio3D };
});

export function App() {
  return (
    <BrowserRouter>
      <DesignDraftProvider>
        <Routes>
          <Route path="admin" element={<AdminPage />} />
          <Route element={<Layout />}>
            <Route path="auth" element={<AuthPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route index element={<Home />} />
            <Route path="request" element={<RequestPage />} />
            <Route path="track" element={<TrackPage />} />
            <Route path="studio" element={<StudioPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            {import.meta.env.DEV ? (
              <Route
                path="dev/print-area"
                element={
                  <Suspense fallback={null}>
                    <DevPrintAreaPage />
                  </Suspense>
                }
              />
            ) : null}
            {import.meta.env.DEV ? (
              <Route
                path="dev/studio-3d"
                element={
                  <Suspense fallback={null}>
                    <DevStudio3D />
                  </Suspense>
                }
              />
            ) : null}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </DesignDraftProvider>
    </BrowserRouter>
  );
}
