import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

/* Basit logo */
function LogoMark({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M42.17 20.17 27.83 5.83c1.31 1.31.57 4.36-1.63 7.94-1.35 2.19-3.24 4.57-5.55 6.9s-4.71 4.2-6.9 5.55c-3.58 2.2-6.63 2.94-7.94 1.63L20.17 42.17c1.31 1.31 4.36.57 7.94-1.63 2.19-1.35 4.57-3.24 6.9-5.55s4.2-4.71 5.55-6.9c2.2-3.58 2.94-6.63 1.63-7.94Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Tek parça Navbar (Stitch görünümüne yakın, işlevleri bizdekiyle aynı) */
export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Dr. [Name]" },
    { to: "/services", label: "Services" },
    { to: "/gallery", label: "Gallery" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Sol: Logo + İsim */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-[var(--color-primary)]"><LogoMark /></span>
          <span>Dr. [Name]</span>
        </Link>

        {/* Orta: Menü (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                [
                  "px-3 py-1.5 rounded-lg transition-colors",
                  isActive
                    ? "text-white bg-[var(--color-text)]"
                    : "hover:text-[var(--color-primary)]",
                ].join(" ")
              }
              end={it.to === "/"}
            >
              {it.label}
            </NavLink>
          ))}
        </nav>

        {/* Sağ: Randevu butonu */}
        <div className="flex items-center gap-3">
          <Link
            to="/randevu"
            className="hidden sm:inline-flex h-10 items-center justify-center rounded-lg px-4 font-semibold text-white bg-[var(--color-primary)] hover:opacity-90"
          >
            Randevu Al
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-md hover:bg-[var(--color-secondary)]"
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-[var(--color-text)] mb-1" />
            <span className="block w-5 h-0.5 bg-[var(--color-text)] mb-1" />
            <span className="block w-5 h-0.5 bg-[var(--color-text)]" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <nav className="px-4 py-3 flex flex-col">
            {navItems.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  [
                    "px-3 py-2 rounded-md",
                    isActive
                      ? "text-white bg-[var(--color-text)]"
                      : "hover:bg-[var(--color-secondary)]",
                  ].join(" ")
                }
                end={it.to === "/"}
              >
                {it.label}
              </NavLink>
            ))}
            <Link
              to="/randevu"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-lg px-4 font-semibold text-white bg-[var(--color-primary)]"
            >
              Randevu Al
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
