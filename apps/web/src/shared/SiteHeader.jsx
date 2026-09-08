import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { doctor } from "../content/doctor";

const NAV = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/hakkinda", label: "Hakkında" },
  { to: "/hizmetler", label: "Hizmetler" },
  { to: "/videolar", label: "Videolar" },
  { to: "/iletisim", label: "İletişim" },
];

function navClass({ isActive }) {
  return [
    "relative py-1 text-sm font-medium transition-colors duration-300",
    "after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-burgundy after:transition-all after:duration-300",
    isActive
      ? "text-charcoal after:w-full"
      : "text-ink-muted hover:text-charcoal after:w-0 hover:after:w-full",
  ].join(" ");
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile panel whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-beige bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-[1200px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          to="/"
          className="font-display text-xl tracking-tight text-charcoal transition-opacity hover:opacity-80 sm:text-2xl"
          aria-label="Ana Sayfa"
        >
          {doctor.name}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"} className={navClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/randevu-sorgula"
            className="text-sm font-medium text-charcoal transition-colors duration-300 hover:text-burgundy"
          >
            Randevu Sorgula
          </Link>
          <Link to="/randevu" className="btn-primary px-5">
            Randevu Al
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-beige text-charcoal transition-colors hover:bg-parchment md:hidden"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-beige bg-ivory md:hidden">
          <nav className="mx-auto flex max-w-[1200px] flex-col gap-1 px-5 py-4">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-3 text-base font-medium transition-colors",
                    isActive ? "bg-parchment text-charcoal" : "text-ink-muted hover:bg-parchment hover:text-charcoal",
                  ].join(" ")
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-3 border-t border-beige pt-4">
              <Link
                to="/randevu-sorgula"
                className="btn-secondary w-full"
              >
                Randevu Sorgula
              </Link>
              <Link to="/randevu" className="btn-primary w-full">
                Randevu Al
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
