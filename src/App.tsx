import { Navigate, Route, Routes } from "react-router-dom";
import { CATEGORY_PATHS } from "./lib/industries";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { JoinPage } from "./pages/JoinPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {CATEGORY_PATHS.map((path) => (
        <Route key={path} path={path} element={<HomePage />} />
      ))}
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/:handle" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
