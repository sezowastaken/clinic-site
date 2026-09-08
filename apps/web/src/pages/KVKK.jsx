import { Container, SectionLabel } from "../shared/ui";

export default function KVKK() {
  return (
    <section className="bg-ivory">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Yasal</SectionLabel>
          <h1 className="font-display mt-4 text-4xl text-charcoal sm:text-5xl">
            KVKK Aydınlatma Metni
          </h1>

          <div className="mt-8 space-y-4 text-base leading-relaxed text-ink-muted">
            <p>
              Buraya 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
              hazırlanacak aydınlatma metninin içeriği gelecektir.
            </p>
            <p className="rounded-2xl border border-beige bg-cream px-5 py-4 text-sm">
              Bu bölüm bir yer tutucudur. Nihai yasal metin, klinik tarafından
              sağlandıktan sonra bu sayfaya eklenecektir.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
