import { Routes, Route } from "react-router-dom";
import SiteLayout from "./layouts/SiteLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Results from "./pages/Results";
import Videos from "./pages/Videos";
import Contact from "./pages/Contact";
import KVKK from "./pages/KVKK";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="/hakkinda" element={<About />} />
        <Route path="/hizmetler" element={<Services />} />
        <Route path="/sonuclar" element={<Results />} />
        <Route path="/videolar" element={<Videos />} />
        <Route path="/iletisim" element={<Contact />} />
        <Route path="/kvkk" element={<KVKK />} />
      </Route>
    </Routes>
  );
}
