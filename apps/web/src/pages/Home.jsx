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

const VALUES = [
  {
    no: "01",
    title: "Bütünsel Değerlendirme",
    desc: "Her görüşme, anatominizi ve beklentilerinizi birlikte ele alan kapsamlı bir planlama sürecidir.",
  },
  {
    no: "02",
    title: "Şeffaf Süreç",
    desc: "Ameliyat öncesinden iyileşme sonrasına kadar her aşama açıkça anlatılır, sorularınız yanıtlanır.",
  },
  {
    no: "03",
    title: "Kişiye Özel Takip",
    desc: "Planlı kontrollerle iyileşme süreciniz yakından izlenir, sonuç uzun vadede değerlendirilir.",
  },
];

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

      {/* Credentials strip */}
      <section className="border-y border-beige bg-ivory">
        <Container className="py-5">
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center sm:gap-x-4">
            {RIBBON.map((item, i) => (
              <li key={item} className="flex items-center gap-x-3 sm:gap-x-4">
                <span className="label-caps text-ink-muted">{item}</span>
                {i < RIBBON.length - 1 && (
                  <span
                    className="h-1 w-1 shrink-0 rounded-full bg-burgundy/40"
                    aria-hidden="true"
                  />
                )}
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

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-beige bg-beige sm:grid-cols-2 lg:grid-cols-4">
            {homeServices.map((item, idx) => (
              <article
                key={item.slug}
                className="group flex flex-col bg-ivory p-6 transition-colors duration-300 hover:bg-cream"
              >
                <span className="font-display text-sm text-burgundy">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-3 text-lg text-charcoal">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                  {item.homeDesc}
                </p>
                <Link
                  to={`/hizmetler#${item.slug}`}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-burgundy transition-colors group-hover:gap-2 hover:text-burgundy-dark"
                >
                  Detaylar
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="bg-ivory">
        <Container className="py-20 sm:py-24">
          <div className="max-w-2xl">
            <SectionLabel>Neden Biz</SectionLabel>
            <h2 className="font-display mt-4 text-3xl text-charcoal sm:text-4xl">
              Süreç boyunca yanınızdayız
            </h2>
          </div>
          <div className="mt-12 grid gap-x-12 gap-y-10 border-t border-beige pt-10 sm:grid-cols-3">
            {VALUES.map((item) => (
              <div key={item.no}>
                <span className="font-display text-sm text-burgundy">{item.no}</span>
                <h3 className="font-display mt-2 text-xl text-charcoal">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.desc}</p>
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
