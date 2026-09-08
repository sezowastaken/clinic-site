import { Link } from "react-router-dom";
import { doctor } from "../content/doctor";

const NAV_LINKS = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/hakkinda", label: "Hakkında" },
  { to: "/hizmetler", label: "Hizmetler" },
  { to: "/videolar", label: "Videolar" },
  { to: "/iletisim", label: "İletişim" },
];

const LEGAL_LINKS = [
  { to: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { to: "#", label: "Kullanım Şartları" },
];

function FooterLink({ to, children }) {
  const isExternalAnchor = to === "#";
  const className =
    "text-sm text-ivory/70 transition-colors duration-300 hover:text-ivory";
  if (isExternalAnchor) {
    return (
      <a href={to} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-charcoal text-ivory">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl tracking-tight">{doctor.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory/60">
              Doğal sonuçlar için kişiye özel cerrahi yaklaşım. Plastik,
              Rekonstrüktif ve Estetik Cerrahi.
            </p>
          </div>

          <nav aria-label="Site bağlantıları">
            <p className="label-caps text-ivory/50">Navigasyon</p>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <FooterLink to={l.to}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Yasal bağlantılar">
            <p className="label-caps text-ivory/50">Yasal</p>
            <ul className="mt-4 flex flex-col gap-3">
              {LEGAL_LINKS.map((l) => (
                <li key={l.label}>
                  <FooterLink to={l.to}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Kurumsal bağlantılar">
            <p className="label-caps text-ivory/50">Kurumsal</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <FooterLink to="/randevu-sorgula">Randevu Sorgula</FooterLink>
              </li>
              <li>
                <FooterLink to="/admin/login">Personel Girişi</FooterLink>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 border-t border-ivory/10 pt-6 text-center text-sm text-ivory/50">
          © {year} {doctor.name}. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
