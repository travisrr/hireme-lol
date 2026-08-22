import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CATEGORY_PATHS } from "./lib/industries";
import { HomePage } from "./pages/HomePage";

const AdminPage = lazy(() =>
  import("./pages/AdminPage").then((module) => ({ default: module.AdminPage })),
);
const HowItWorksPage = lazy(() =>
  import("./pages/HowItWorksPage").then((module) => ({
    default: module.HowItWorksPage,
  })),
);
const JoinPage = lazy(() =>
  import("./pages/JoinPage").then((module) => ({ default: module.JoinPage })),
);
const LegalPage = lazy(() =>
  import("./pages/LegalPage").then((module) => ({ default: module.LegalPage })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })),
);

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {CATEGORY_PATHS.map((path) => (
          <Route key={path} path={path} element={<HomePage />} />
        ))}
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/privacy" element={<LegalPage kind="privacy" />} />
        <Route path="/terms" element={<LegalPage kind="terms" />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/:handle" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
