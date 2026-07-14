import { Link } from "react-router-dom";
import { services as SERVICES } from "../content/services";

export default function Services() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Başlık */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Hizmetlerimiz
        </h1>
        <p className="mt-3 md:mt-4 text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
          Doğal güzelliğinizi öne çıkaran, güven veren ve kişiye özel planlanan
          estetik prosedürlerimizi keşfedin.
        </p>
      </div>

      {/* Kartlar */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((s) => (
          <article
            key={s.slug}
            className="group bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm
                       transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 will-change-transform"
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={s.src}
                alt={s.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <div className="p-5 flex flex-col h-full">
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="mt-1 text-sm text-[color-mix(in srgb, var(--color-text) 70%, transparent)] flex-1">
                {s.desc}
              </p>

              <div className="mt-4 flex items-center gap-3">
                {/* Detay linkini şimdilik anchor ile verdim; 
                   ileride /hizmetler/:slug route açınca to={`/hizmetler/${s.slug}`} yaparız */}
                <Link
                  to={`/hizmetler#${s.slug}`}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg
                             border border-[var(--color-border)]
                             hover:bg-[var(--color-secondary)] hover:-translate-y-0.5 active:translate-y-0
                             transition focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                >
                  Detaylı Bilgi
                </Link>

                <Link
                  to="/randevu"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-semibold rounded-lg
                             text-white bg-[var(--color-primary)] shadow
                             hover:shadow-md hover:-translate-y-0.5 active:translate-y-0
                             transition focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                >
                  Randevu Al
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Alt CTA şeridi */}
      <div className="mt-14 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Hangi işlem size uygun?</h2>
        <p className="mt-2 text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
          Sizin için en doğru planı birlikte oluşturalım.
        </p>
        <Link
          to="/iletisim"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl px-6 font-semibold
                     text-white bg-[var(--color-primary)] shadow hover:shadow-md hover:-translate-y-0.5
                     active:translate-y-0 transition focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        >
          Ücretsiz Ön Görüşme
        </Link>
      </div>
    </section>
  );
}
