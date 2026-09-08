import { Link } from "react-router-dom";
import { services as SERVICES, serviceCategories } from "../content/services";
import { Container, SectionLabel } from "../shared/ui";

const FAQ = [
  {
    q: "İyileşme süreci ne kadar sürer?",
    a: "İyileşme süresi işleme ve kişiye göre değişir. Genel iyileşme, ilk kontrol zamanlaması ve günlük yaşama dönüş, size özel plan çerçevesinde ilk görüşmede ayrıntılı olarak paylaşılır.",
  },
  {
    q: "Operasyonlar nerede gerçekleştiriliyor?",
    a: "Operasyonlar, gerekli donanıma ve güvenlik standartlarına sahip tam teşekküllü ve akredite sağlık kuruluşlarında gerçekleştirilir.",
  },
  {
    q: "Konsültasyon sürecinde neler konuşuluyor?",
    a: "İlk görüşmede beklentileriniz dinlenir, uygun seçenekler ve süreç değerlendirilir; riskler ve gerçekçi sonuçlar şeffaf biçimde ele alınır.",
  },
];

function ServiceRow({ service }) {
  return (
    <div
      id={service.slug}
      className="scroll-mt-28 border-b border-beige py-6"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between md:gap-8">
        <div className="md:w-1/3">
          <h4 className="font-display text-lg text-charcoal">{service.title}</h4>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted md:w-2/3">
          {service.desc}
        </p>
      </div>
      <div className="mt-3">
        <Link
          to="/randevu"
          className="inline-flex items-center gap-1 text-sm font-semibold text-burgundy transition-colors hover:text-burgundy-dark"
        >
          Randevu Al
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

function CategoryBlock({ category, index }) {
  const items = SERVICES.filter((s) => s.category === category.name);
  const imageFirst = index % 2 === 0;

  return (
    <section id={category.id} className="scroll-mt-24">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={imageFirst ? "" : "lg:order-2"}>
          <div className="overflow-hidden rounded-2xl border border-beige bg-parchment">
            <img
              src={category.image}
              alt={category.imageAlt}
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className={imageFirst ? "" : "lg:order-1"}>
          <h3 className="font-display text-2xl text-charcoal sm:text-3xl">
            {category.name} Estetiği
          </h3>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            {category.desc}
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-beige">
        {items.map((service) => (
          <ServiceRow key={service.slug} service={service} />
        ))}
      </div>
    </section>
  );
}

export default function Services() {
  return (
    <>
      {/* Header */}
      <section className="bg-ivory">
        <Container className="py-16 sm:py-20">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl text-charcoal sm:text-5xl lg:text-6xl">
                Hizmetler
              </h1>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                Estetik cerrahi, kişisel oranların ve doğal güzelliğin bir
                yansımasıdır. Her bireyin anatomik yapısı benzersizdir; bu
                nedenle çalışmalarımız standart prosedürlerin ötesinde, kişiye
                özel planlanır.
              </p>
            </div>
            <SectionLabel className="shrink-0">Klinik Uzmanlık</SectionLabel>
          </div>

          {/* Category nav */}
          <nav className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-y border-beige py-4">
            {serviceCategories.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="label-caps text-ink-muted transition-colors hover:text-burgundy"
              >
                {c.name}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      {/* Categories */}
      <section className="bg-ivory">
        <Container className="space-y-20 pb-20 sm:space-y-24 sm:pb-24">
          {serviceCategories.map((category, index) => (
            <CategoryBlock key={category.id} category={category} index={index} />
          ))}
        </Container>
      </section>

      {/* Consultation prompt */}
      <section className="bg-parchment">
        <Container className="py-16 text-center sm:py-20">
          <h2 className="font-display mx-auto max-w-2xl text-2xl text-charcoal sm:text-3xl">
            Hangi işlemin size uygun olduğundan emin değil misiniz?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-muted">
            Her estetik yolculuk benzersizdir. Kişiye özel bir değerlendirme için
            ön görüşme planlayın; sizin için en doğru planı birlikte oluşturalım.
          </p>
          <div className="mt-8">
            <Link to="/iletisim" className="btn-primary">
              Ön Görüşme Planla
            </Link>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-ivory">
        <Container className="py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <div>
              <SectionLabel>Sıkça Sorulan Sorular</SectionLabel>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                Operasyon süreçleri ve iyileşme dönemi hakkında merak
                edilenler.
              </p>
            </div>
            <div className="border-t border-beige">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group border-b border-beige"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg text-charcoal marker:hidden">
                    {item.q}
                    <span className="text-burgundy transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-sm leading-relaxed text-ink-muted">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
