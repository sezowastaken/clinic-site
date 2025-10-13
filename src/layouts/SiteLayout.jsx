import { Link, NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/hakkinda", label: "Hakkında" },
  { to: "/hizmetler", label: "Hizmetler" },
  { to: "/sonuclar", label: "Sonuçlar" },
  { to: "/videolar", label: "Videolar" },
  { to: "/iletisim", label: "Randevu & İletişim" },
];

export default function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">
            Dr. Ad Soyad
          </Link>
          <nav className="flex gap-4 text-sm">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-2 py-1 rounded-md ${isActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`
                }
                end={n.to === "/"}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Page */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} Dr. Ad Soyad · Adres ·
          {" "}
          <Link to="/kvkk" className="underline">KVKK</Link>
        </div>
      </footer>
    </div>
  );
}
