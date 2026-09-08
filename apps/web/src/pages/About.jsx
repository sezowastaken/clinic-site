import { Link } from "react-router-dom";
import { doctor } from "../content/doctor";
import { Container, SectionLabel } from "../shared/ui";

/** Basit ikonlar (inline SVG). */
function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
  };
  if (name === "check") return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 3l7 3v5c0 4.5-3 8.4-7 9.5C8 19.4 5 15.5 5 11V6l7-3Z" /><path d="m9.5 11.5 1.8 1.8 3.2-3.6" /></svg>;
  if (name === "eye") return <svg {...common}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
  if (name === "sliders") return <svg {...common}><path d="M4 6h11M19 6h1M4 12h5M13 12h7M4 18h9M17 18h3" /><circle cx="17" cy="6" r="2" /><circle cx="11" cy="12" r="2" /><circle cx="15" cy="18" r="2" /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  return null;
}

const CHECKLIST = [
  "İstanbul Tıp Fakültesi mezunu Tıp Doktoru",
  "Plastik, Rekonstrüktif ve Estetik Cerrahi ihtisası",
  "American Board of Plastic Surgery — Board Sertifikalı",
];

const JOURNEY = [
  {
    title: "İstanbul Tıp Fakültesi",
    desc: "Tıp Doktoru (MD) eğitimi.",
  },
  {
    title: "Cerrahpaşa Tıp Fakültesi",
    desc: "Plastik, Rekonstrüktif ve Estetik Cerrahi ihtisası.",
  },
  {
    title: "American Board of Plastic Surgery",
    desc: "Board sertifikasyonu.",
  },
  {
    title: "Profesyonel Üyelikler",
    desc: "Türk Plastik Rekonstrüktif ve Estetik Cerrahi Derneği.",
  },
];

const PRINCIPLES = [
  {
    icon: "shield",
    title: "Güvenlik Önce Gelir",
    desc: "Hastalarımın güvenliği ve konforu her kararın merkezinde yer alır.",
  },
  {
    icon: "eye",
    title: "Şeffaflık",
    desc: "İlk görüşmeden itibaren tüm süreci açık ve anlaşılır biçimde aktarırım.",
  },
  {
    icon: "sliders",
    title: "Kişiselleştirme",
    desc: "Her birey için beklenti ve anatomiye göre kişiye özel plan oluştururum.",
  },
  {
    icon: "clock",
    title: "Titiz Takip",
    desc: "Operasyon sonrası dönemde iyileşme sürecini yakından izlerim.",
  },
];

const MEMBERSHIP_LOGOS = [
  { src: "/assets/general/istanbul-tıp.png", alt: "İstanbul Tıp Fakültesi" },
  { src: "/assets/general/cerrahpasa.png", alt: "Cerrahpaşa Tıp Fakültesi" },
  { src: "/assets/general/asps.png", alt: "American Society of Plastic Surgeons" },
  { src: "/assets/general/plastik-cerrahi-dernegi.png", alt: "Plastik Cerrahi Derneği" },
];

const PHILOSOPHY = [
  {
    no: "01",
    title: "Mesleki Yolculuk",
    desc: "İstanbul Tıp Fakültesi'nde tamamlanan tıp eğitiminin ardından Cerrahpaşa'da plastik cerrahi ihtisası; hem fonksiyonel hem estetik sonuçları önemseyen bir yaklaşım.",
  },
  {
    no: "02",
    title: "Cerrahi Yaklaşım",
    desc: "Her yüz ve beden benzersizdir. Doğal ve yüz–vücut uyumunu gözeten, minimal ve dengeli sonuçlar hedefleyen bir planlama.",
  },
  {
    no: "03",
    title: "Hasta İletişimi",
    desc: "Süreç şeffaf biçimde anlatılır, sorular yanıtlanır ve kararınızı bilgi ve güvenle vermeniz hedeflenir.",
  },
  {
    no: "04",
    title: "Doğal Sonuç Analizi",
    desc: "Amaç sizi olduğunuz kişiden uzaklaştırmak değil; en doğal ve en iyi halinize ulaşmanıza yardımcı olmaktır.",
  },
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ivory">
        <Container className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[5fr_6fr] lg:gap-16">
          <div className="overflow-hidden rounded-2xl border border-beige bg-parchment">
            <img
              src={doctor.photo}
              alt={`${doctor.name} portre`}
              className="aspect-[4/5] w-full object-cover"
              loading="eager"
            />
          </div>

          <div>
            <SectionLabel>Hakkında</SectionLabel>
            <h1 className="font-display mt-5 text-4xl leading-tight text-charcoal sm:text-5xl">
              Estetikte Doğal Denge
            </h1>
            <p className="font-display mt-3 text-lg italic text-ink-muted">
              {doctor.name} · {doctor.title}
            </p>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-muted">
              Cerrahi mükemmelliği sanatsal bir vizyonla birleştirerek, her bireyin
              kendine has güzelliğini en doğal ve güvenli şekilde ortaya çıkarmayı
              hedeflerim.
            </p>
            <ul className="mt-6 space-y-3">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-charcoal">
                  <span className="mt-0.5 text-sage">
                    <Icon name="check" className="h-5 w-5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link to="/randevu" className="btn-primary">
                Randevu Al
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Bio */}
      <section className="bg-cream">
        <Container className="py-20 sm:py-24">
          <div className="max-w-2xl">
            <SectionLabel>Hakkımda</SectionLabel>
            <h2 className="font-display mt-4 text-3xl text-charcoal sm:text-4xl">
              Kişiye özel, doğal ve güvenli
            </h2>
          </div>
          <div className="mt-10 grid gap-8 text-base leading-relaxed text-ink-muted md:grid-cols-2 md:gap-12">
            <p>
              Tıp eğitimimi <strong className="font-semibold text-charcoal">İstanbul Tıp Fakültesi</strong>'nde
              tamamladıktan sonra,{" "}
              <strong className="font-semibold text-charcoal">Cerrahpaşa Tıp Fakültesi</strong>'nde Plastik,
              Rekonstrüktif ve Estetik Cerrahi ihtisasımı bitirdim. Kariyerim boyunca hem fonksiyonel hem de
              estetik sonuçları bir araya getiren, <em>doğal ve yüz–vücut uyumunu gözeten</em> bir yaklaşım
              benimsedim. Hastalarımın güvenliği, konforu ve beklentilerinin gerçekçi şekilde planlanması benim
              için her zaman önceliktir.
            </p>
            <p>
              Ulusal ve uluslararası derneklerdeki üyeliklerim ve düzenli katıldığım bilimsel toplantılar
              sayesinde güncel teknikleri yakından takip ediyor, kliniğimde <em>kişiye özel</em> tedavi planları
              oluşturuyorum. İlk görüşmeden itibaren tüm süreci şeffaf biçimde anlatarak sorularınızı yanıtlıyor,
              kararınızı <strong className="font-semibold text-charcoal">bilgi ve güvenle</strong> vermenizi
              hedefliyorum. Amacım, sizi olduğunuz kişiden uzaklaştırmak değil;{" "}
              <strong className="font-semibold text-charcoal">en doğal ve en iyi halinize</strong> ulaşmanıza
              yardımcı olmak.
            </p>
          </div>
        </Container>
      </section>

      {/* Quote */}
      <section className="bg-sage-surface">
        <Container className="py-20 text-center sm:py-24">
          <p className="font-display text-5xl text-sage/70" aria-hidden="true">&rdquo;</p>
          <blockquote className="mx-auto mt-4 max-w-3xl">
            <p className="font-display text-2xl leading-snug text-charcoal sm:text-3xl">
              Amacım, sizi olduğunuz kişiden uzaklaştırmak değil; en doğal ve en iyi
              halinize ulaşmanıza yardımcı olmaktır.
            </p>
          </blockquote>
        </Container>
      </section>

      {/* Philosophy grid */}
      <section className="bg-ivory">
        <Container className="py-20 sm:py-24">
          <div className="max-w-2xl">
            <SectionLabel>Felsefemiz &amp; Yaklaşımımız</SectionLabel>
          </div>
          <div className="mt-10 grid gap-x-12 gap-y-10 border-t border-beige pt-10 sm:grid-cols-2">
            {PHILOSOPHY.map((item) => (
              <div key={item.no} className="border-t border-beige pt-6 first:border-t-0 first:pt-0 sm:border-t-0 sm:pt-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-sm text-burgundy">{item.no}</span>
                  <h3 className="font-display text-xl text-charcoal">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Journey timeline */}
      <section className="bg-cream">
        <Container className="py-20 sm:py-24">
          <div className="text-center">
            <SectionLabel>Akademik &amp; Mesleki Geçmiş</SectionLabel>
            <h2 className="font-display mt-4 text-3xl text-charcoal sm:text-4xl">
              Eğitim &amp; Yetkinlikler
            </h2>
          </div>
          <ol className="mx-auto mt-12 max-w-2xl">
            {JOURNEY.map((item, idx) => (
              <li key={item.title} className="relative flex gap-6 pb-10 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-burgundy bg-ivory" />
                  {idx < JOURNEY.length - 1 && <span className="mt-1 w-px flex-1 bg-beige" />}
                </div>
                <div className="pb-2">
                  <h3 className="font-display text-lg text-charcoal">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Membership logos */}
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-10 border-t border-beige pt-10">
            {MEMBERSHIP_LOGOS.map((b) => (
              <img
                key={b.src}
                src={b.src}
                alt={b.alt}
                className="h-14 opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-16"
                loading="lazy"
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Principles */}
      <section className="bg-ivory">
        <Container className="py-20 sm:py-24">
          <div className="max-w-2xl">
            <SectionLabel>Klinik Prensiplerimiz</SectionLabel>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-2xl border border-beige bg-cream p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-parchment text-burgundy">
                  <Icon name={p.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg text-charcoal">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-charcoal text-ivory">
        <Container className="py-20 text-center sm:py-24">
          <h2 className="font-display mx-auto max-w-2xl text-3xl sm:text-4xl">
            Size özel estetik çözümleri keşfedin
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/70">
            Beklentilerinizi dinleyip size uygun tedavi planını birlikte oluşturmak
            için görüşme planlayın.
          </p>
          <div className="mt-8">
            <Link to="/randevu" className="btn-primary">
              Görüşmenizi Planlayın
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
