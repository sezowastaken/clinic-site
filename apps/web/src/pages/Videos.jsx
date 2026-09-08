import { videos } from "../content/videos";
import { Container, SectionLabel } from "../shared/ui";

export default function Videos() {
  const [featured, ...rest] = videos;

  return (
    <section className="bg-ivory">
      <Container className="py-16 sm:py-20">
        <div className="max-w-2xl">
          <SectionLabel>Videolar</SectionLabel>
          <h1 className="font-display mt-4 text-4xl text-charcoal sm:text-5xl">
            Bilgilendirme Videoları
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Sık sorulan sorular, süreçler ve merak edilen konular hakkında kısa
            bilgilendirmeler.
          </p>
        </div>

        {featured && (
          <div className="mt-12 grid gap-8 overflow-hidden rounded-2xl border border-beige bg-cream lg:grid-cols-[1.6fr_1fr]">
            <div className="aspect-video lg:aspect-auto">
              <iframe
                src={featured.embed}
                title={featured.title}
                className="h-full min-h-64 w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <SectionLabel>Öne Çıkan</SectionLabel>
              <h2 className="font-display mt-3 text-2xl text-charcoal">{featured.title}</h2>
              <ul className="mt-4 space-y-2">
                {featured.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {rest.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-2xl border border-beige bg-cream">
                <div className="aspect-video">
                  <iframe
                    src={v.embed}
                    title={v.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-display text-lg text-charcoal">{v.title}</h2>
                  <ul className="mt-3 space-y-2">
                    {v.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
