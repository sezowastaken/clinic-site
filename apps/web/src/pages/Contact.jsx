import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Container, SectionLabel } from "../shared/ui";

export default function Contact() {
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm();

  async function onSubmit(values) {
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email || undefined,
          message: values.notes || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || "Mesaj gönderilemedi.");
      }
    } catch (err) {
      setSubmitError(err.message || "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
      throw err;
    }
  }

  return (
    <section className="bg-ivory">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>İletişim</SectionLabel>
          <h1 className="font-display mt-4 text-4xl text-charcoal sm:text-5xl">
            Bize Ulaşın
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Sorularınız, randevu talepleriniz veya daha fazla bilgi için bizimle
            iletişime geçebilirsiniz. Mesajlarınıza en kısa sürede dönüş yapılır.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          {/* Left: guidance */}
          <div className="space-y-8">
            <div>
              <p className="label-caps text-burgundy">Randevu</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Muayene randevusu oluşturmak veya mevcut talebinizin durumunu
                öğrenmek için randevu sayfalarını kullanabilirsiniz.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link to="/randevu" className="btn-primary">
                  Randevu Al
                </Link>
                <Link to="/randevu-sorgula" className="btn-secondary">
                  Randevu Sorgula
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-beige bg-cream p-5">
              <p className="label-caps text-charcoal">Gizlilik</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Lütfen form üzerinden ayrıntılı sağlık verisi veya tıbbi belge
                göndermeyiniz. Kişisel verileriniz{" "}
                <Link to="/kvkk" className="text-link">
                  KVKK Aydınlatma Metni
                </Link>{" "}
                kapsamında işlenmektedir.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-beige bg-cream p-6 sm:p-8">
            <h2 className="font-display text-2xl text-charcoal">Mesaj Gönderin</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="name">
                    Ad Soyad
                  </label>
                  <input
                    id="name"
                    autoComplete="name"
                    className="field-input"
                    {...register("name", { required: true })}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="phone">
                    Telefon
                  </label>
                  <input
                    id="phone"
                    autoComplete="tel"
                    className="field-input"
                    {...register("phone", { required: true })}
                  />
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor="email">
                  E-posta (opsiyonel)
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="field-input"
                  {...register("email")}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="notes">
                  Mesajınız
                </label>
                <textarea
                  id="notes"
                  rows="5"
                  className="field-input resize-y"
                  {...register("notes")}
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? "Gönderiliyor..." : "Gönder"}
              </button>

              {isSubmitSuccessful && !submitError && (
                <p
                  role="status"
                  className="rounded-lg border border-sage/40 bg-sage-surface px-4 py-3 text-sm text-charcoal"
                >
                  Teşekkürler! Mesajınız alındı, en kısa sürede size dönüş yapacağız.
                </p>
              )}

              {submitError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </p>
              )}
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
