import { Link } from "react-router-dom";
import { doctor } from "../content/doctor";
import { services } from "../content/services";
import { Container, SectionLabel } from "../shared/ui";

const RIBBON = [
  "Plastik, Rekonstrüktif ve Estetik Cerrahi",
  "Board Sertifikasyonu",
  "Kişiye Özel Planlama",
  "Planlı Takip Süreci",
];

const GALLERY = [
  { src: "/assets/general/work-01.png", alt: "Hasta ile danışma görüşmesi" },
  { src: "/assets/general/work-02.png", alt: "Estetik prosedürün illüstrasyonu" },
  { src: "/assets/general/work-03.png", alt: "Klinik ortamından bir kare" },
];

function GuideIcon({ name }) {
  const common = {
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
  };
  if (name === "face")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 10h.01M15 10h.01M9 15c.9.7 2 1 3 1s2.1-.3 3-1" />
      </svg>
    );
  if (name === "breast")
    return (
      <svg {...common}>
        <path d="M12 3c1.5 3 3 4 5 4-1 5-3.5 8-5 8s-4-3-5-8c2 0 3.5-1 5-4Z" />
      </svg>
    );
  if (name === "body")
    return (
      <svg {...common}>
        <circle cx="12" cy="5" r="2.5" />
        <path d="M12 8v7M8 21l4-6 4 6M7 11h10" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .8-1 1.7M12 17h.01" />
    </svg>
  );
}

const homeServices = services.filter((s) => s.featuredOnHome);

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ivory">
        <Container className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[5fr_6fr] lg:gap-16 lg:py-24">
          <div>
            <SectionLabel>Plastik, Rekonstrüktif ve Estetik Cerrahi</SectionLabel>
            <h1 className="font-display mt-6 text-4xl leading-[1.05] text-charcoal sm:text-5xl lg:text-6xl">
              Doğal sonuçlar için kişiye özel cerrahi yaklaşım.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted">
              Bütünsel planlama ve minimal invaziv tekniklerle, size özgü
              oranları koruyan cerrahi mükemmellik.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link to="/randevu" className="btn-primary">
                Randevu Al
              </Link>
              <Link to="/hakkinda" className="text-link">
                Yaklaşımımı Keşfedin
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-beige bg-parchment">
              <img
                src={doctor.photo}
                alt={`${doctor.name} portre görseli`}
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]"
                loading="eager"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Trust ribbon */}
      <section className="bg-burgundy text-ivory">
        <Container>
          <ul className="grid grid-cols-1 divide-y divide-ivory/15 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-ivory/15">
            {RIBBON.map((item) => (
              <li
                key={item}
                className="px-2 py-5 text-center text-sm font-medium tracking-wide sm:px-6 lg:text-left"
              >
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Philosophy */}
      <section className="bg-sage-surface">
        <Container className="py-20 text-center sm:py-24">
          <p className="font-display text-5xl text-sage/70" aria-hidden="true">
            &rdquo;
          </p>
          <blockquote className="mx-auto mt-4 max-w-3xl">
            <p className="font-display text-2xl leading-snug text-charcoal sm:text-3xl">
              Amacım sizi başka birine dönüştürmek değil; size özgü oranları
              koruyarak daha dengeli ve doğal bir sonuç planlamak.
            </p>
          </blockquote>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-charcoal/70">
            Her hastanın anatomisi ve beklentisi parmak izi kadar benzersizdir.
            Cerrahi yaklaşımım, bu benzersizliği merkeze alarak uzun vadede kalıcı
            ve estetik olarak doyurucu sonuçlar elde etmeyi hedefler.
          </p>
        </Container>
      </section>

      {/* Featured services */}
      <section className="bg-ivory">
        <Container className="py-20 sm:py-24">
          <div className="max-w-2xl">
            <SectionLabel>Hizmetlerimiz</SectionLabel>
            <h2 className="font-display mt-4 text-3xl text-charcoal sm:text-4xl">
              Öne çıkan işlemler
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Doğal güzelliğinizi öne çıkaran, güven veren ve kişiye özel
              planlanan cerrahi prosedürler.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {homeServices.map((item) => (
              <article
                key={item.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-beige bg-cream transition-colors duration-300 hover:border-sage"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg text-charcoal">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                    {item.homeDesc}
                  </p>
                  <Link
                    to={`/hizmetler#${item.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-burgundy transition-colors hover:text-burgundy-dark"
                  >
                    Detaylar
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Treatment guide */}
      <section className="bg-parchment">
        <Container className="py-20 sm:py-24">
          <SectionLabel>Tedavi Rehberi</SectionLabel>
          <h2 className="font-display mt-4 text-3xl text-charcoal sm:text-4xl">
            Nereden başlamak istersiniz?
          </h2>

          <div className="mt-10 grid grid-cols-1 border border-beige sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "face", label: "Yüz", to: "/hizmetler" },
              { icon: "breast", label: "Meme", to: "/hizmetler" },
              { icon: "body", label: "Vücut", to: "/hizmetler" },
            ].map((cat) => (
              <Link
                key={cat.label}
                to={cat.to}
                className="group flex min-h-40 flex-col justify-between border-beige bg-ivory p-6 transition-colors duration-300 hover:bg-cream [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-r"
              >
                <span className="text-burgundy">
                  <GuideIcon name={cat.icon} />
                </span>
                <span className="font-display text-xl text-charcoal">{cat.label}</span>
              </Link>
            ))}
            <Link
              to="/iletisim"
              className="group flex min-h-40 flex-col justify-between bg-apricot-surface p-6 transition-colors duration-300 hover:bg-apricot/25"
            >
              <span className="text-burgundy">
                <GuideIcon name="unsure" />
              </span>
              <span className="text-sm font-medium leading-relaxed text-charcoal">
                Hangi işlemin uygun olduğunu bilmiyorum.
              </span>
            </Link>
          </div>
        </Container>
      </section>

      {/* Gallery */}
      <section className="bg-ivory">
        <Container className="py-20 sm:py-24">
          <div className="max-w-2xl">
            <SectionLabel>Klinikten</SectionLabel>
            <h2 className="font-display mt-4 text-3xl text-charcoal sm:text-4xl">
              Çalışmalarımızdan
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((g) => (
              <div
                key={g.src}
                className="overflow-hidden rounded-2xl border border-beige"
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="bg-charcoal text-ivory">
        <Container className="py-20 text-center sm:py-24">
          <h2 className="font-display mx-auto max-w-2xl text-3xl sm:text-4xl">
            Size özel bir planı birlikte oluşturalım
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/70">
            Beklentilerinizi dinleyip size uygun tedavi planını görüşmek üzere
            bir randevu oluşturun.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/randevu" className="btn-primary">
              Randevu Al
            </Link>
            <Link
              to="/iletisim"
              className="text-sm font-semibold text-ivory underline decoration-1 underline-offset-4 transition-colors hover:text-apricot"
            >
              İletişime Geç
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
