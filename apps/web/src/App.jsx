import { Routes, Route, Navigate } from "react-router-dom";
import { Agentation } from "agentation";
import { AuthProvider } from "./auth/AuthContext.jsx";
import RequireAdminAuth from "./auth/RequireAdminAuth.jsx";
import SiteLayout from "./layout/SiteLayout.jsx";
import AdminLayout from "./layout/AdminLayout.jsx";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Results from "./pages/Results";
import Videos from "./pages/Videos";
import Contact from "./pages/Contact";
import Appointment from "./pages/Appointment";
import KVKK from "./pages/KVKK";
import AdminLogin from "./pages/admin/Login";
import AdminOverview from "./pages/admin/Overview";
import Takvim from "./pages/admin/Takvim";
import SiteRequests from "./pages/admin/SiteRequests";
import Musaitlik from "./pages/admin/Musaitlik";

export default function App() {
  return (
    <AuthProvider>
      {import.meta.env.DEV && <Agentation />}
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="/hakkinda" element={<About />} />
          <Route path="/hizmetler" element={<Services />} />
          <Route path="/sonuclar" element={<Results />} />
          <Route path="/videolar" element={<Videos />} />
          <Route path="/iletisim" element={<Contact />} />
          <Route path="/randevu" element={<Appointment />} />
          <Route path="/kvkk" element={<KVKK />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<RequireAdminAuth />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="takvim" element={<Takvim />} />
            <Route path="istekler" element={<SiteRequests />} />
            <Route path="musaitlik" element={<Musaitlik />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
