import { Link } from "react-router-dom";
import { doctor } from "../content/doctor";
import { services } from "../content/services";

/** Basit i18n – şu an TR */
const lang = "tr";
const copy = {
  tr: {
    heroTitle: "Uzmanlık ve Özenle Estetik Cerrahi",
    heroDesc:
      "Doktorun yaklaşımı ve deneyimine kısa bir giriş. Doğal sonuçlara odaklı, board sertifikalı plastik cerrahi.",
    btnBook: "Randevu Al",
    btnCallMe: "Geri Aranmak İstiyorum",
    servicesTitle: "Hizmetlerimiz",
    workTitle: "Çalışmalarımızdan",
    work: [
      { src: "/assets/general/work-01.png", alt: "Hasta ile danışma görüşmesi" },
      { src: "/assets/general/work-02.png", alt: "Estetik prosedürün illüstrasyonu" },
      { src: "/assets/general/work-03.png", alt: "Mutlu hasta yorumu görseli" },
    ],
  },
};
const t = copy[lang];
const homeServices = services.filter((s) => s.featuredOnHome);

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section
        id="hero"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid gap-10 lg:grid-cols-2 lg:items-center"
      >
        <div>
          <h1 className="text-4xl/tight sm:text-5xl lg:text-6xl font-extrabold">
            {t.heroTitle}
          </h1>
          <p className="mt-4 text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
            {t.heroDesc}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/randevu"
              className="inline-flex h-12 items-center justify-center rounded-lg px-6 font-semibold text-white bg-[var(--color-primary)] shadow hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              {t.btnBook}
            </Link>
            <Link
              to="/iletisim"
              className="inline-flex h-12 items-center justify-center rounded-lg px-6 font-semibold border border-[var(--color-border)] bg-[var(--color-secondary)] hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 transition will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              {t.btnCallMe}
            </Link>
          </div>
        </div>

        <div>
          <div className="aspect-[4/3] rounded-xl overflow-hidden shadow group">
            <img
              src={doctor.photo}
              alt={`${doctor.name} portre görseli`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-center">{t.servicesTitle}</h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeServices.map((item) => (
              <article
                key={item.slug}
                className="rounded-xl p-6 text-center bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition will-change-transform"
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-4 group">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
                  {item.homeDesc}
                </p>
                <div className="mt-4">
                  <Link
                    to="/hizmetler"
                    className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-secondary)] hover:-translate-y-0.5 active:translate-y-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                  >
                    Detaylar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-center">{t.workTitle}</h2>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {t.work.map((g) => (
              <div
                key={g.src}
                className="
                  overflow-hidden rounded-lg shadow group
                  w-[90%] h-[220px]
                  sm:w-[300px] sm:h-[240px]
                  lg:w-[400px] lg:h-[360px]
                  transition-all duration-300
                "
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
