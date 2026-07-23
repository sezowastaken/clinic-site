import { Link, NavLink, Outlet } from "react-router-dom";
import { doctor } from "../content/doctor";

/* Basit logo */
function LogoMark({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M42.17 20.17 27.83 5.83c1.31 1.31.57 4.36-1.63 7.94-1.35 2.19-3.24 4.57-5.55 6.9s-4.71 4.2-6.9 5.55c-3.58 2.2-6.63 2.94-7.94 1.63L20.17 42.17c1.31 1.31 4.36.57 7.94-1.63 2.19-1.35 4.57-3.24 6.9-5.55s4.2-4.71 5.55-6.9c2.2-3.58 2.94-6.63 1.63-7.94Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function SiteLayout() {
  const nav = [
    { to: "/", label: "Ana Sayfa" },
    { to: "/hakkinda", label: "Hakkında" },
    { to: "/hizmetler", label: "Hizmetler" },
    { to: "/videolar", label: "Videolar" },
    { to: "/iletisim", label: "İletişim" },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-semibold flex items-center gap-2 hover:opacity-90 transition"
            aria-label="Ana Sayfa"
          >
            <span className="text-[var(--color-primary)]"><LogoMark /></span>
            <span>{doctor.name}</span>
          </Link>

          <nav className="hidden md:flex gap-2 text-sm">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  [
                    "px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
                    isActive
                      ? "bg-[var(--color-text)] text-white"
                      : "hover:bg-[var(--color-secondary)]",
                  ].join(" ")
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/randevu-sorgula"
              className="inline-flex h-10 items-center justify-center rounded-lg px-2 sm:px-4 text-xs sm:text-sm font-medium hover:bg-[var(--color-secondary)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              Randevu Sorgula
            </Link>
            <Link
              to="/randevu"
              className="inline-flex h-10 items-center justify-center rounded-lg px-4 font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition will-change-transform shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              Randevu Al
            </Link>
          </div>
        </div>
      </header>

      {/* SAYFA İÇERİĞİ */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[var(--color-border)] py-8 text-sm">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[color-mix(in srgb, var(--color-text) 65%, transparent)]">
            © {new Date().getFullYear()} {doctor.name}. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-5">
            <Link
              to="/randevu-sorgula"
              className="underline underline-offset-2 hover:text-[var(--color-primary)] transition"
            >
              Randevu Sorgula
            </Link>
            <Link
              to="/kvkk"
              className="underline underline-offset-2 hover:text-[var(--color-primary)] transition"
            >
              KVKK
            </Link>
            <a
              href="#"
              className="underline underline-offset-2 hover:text-[var(--color-primary)] transition"
            >
              Kullanım Şartları
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 mt-4 flex justify-center sm:justify-end">
          <Link
            to="/admin/login"
            className="text-xs text-[color-mix(in srgb, var(--color-text) 40%, transparent)] hover:text-[color-mix(in srgb, var(--color-text) 65%, transparent)] transition"
          >
            Personel Girişi
          </Link>
        </div>
      </footer>
    </div>
  );
}
