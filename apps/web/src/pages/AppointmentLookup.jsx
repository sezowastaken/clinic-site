import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { lookupAppointment } from "../api/public-booking";
import { Container } from "../shared/ui";

const STATUS_LABELS = {
  pending: "Onay Bekliyor",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
  rejected: "Reddedildi",
  no_show: "Gelmedi",
};

// Görsel ton — durum anlamını değiştirmez, yalnızca sunumu iyileştirir.
const STATUS_TONES = {
  pending: "bg-apricot-surface text-burgundy",
  confirmed: "bg-sage-surface text-sage",
  completed: "bg-sage-surface text-sage",
  cancelled: "bg-parchment text-ink-muted",
  rejected: "bg-parchment text-ink-muted",
  no_show: "bg-parchment text-ink-muted",
};

const STATUS_LEGEND = [
  { key: "pending", desc: "Randevu talebiniz sistemimize ulaşmıştır ve ekibimiz tarafından inceleme sırasına alınmıştır." },
  { key: "confirmed", desc: "Randevunuz klinik tarafından teyit edilmiştir." },
  { key: "completed", desc: "Randevunuz gerçekleşmiş ve tamamlanmıştır." },
];

function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const tone = STATUS_TONES[status] || "bg-parchment text-ink-muted";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}

export default function AppointmentLookup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function onSubmit(data) {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await lookupAppointment({ patientName: data.patientName, phone: data.phone });
      setResult(response);
    } catch (err) {
      if (err.code === "APPOINTMENT_NOT_FOUND") {
        setError("Randevu bulunamadı. Ad soyad ve telefon numaranızı kontrol edin.");
      } else if (err.code === "TOO_MANY_ATTEMPTS") {
        setError("Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.");
      } else {
        setError(err.message || "Randevu sorgulanamadı. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-ivory">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: form + results */}
          <div>
            <h1 className="font-display text-4xl text-charcoal sm:text-5xl">Randevu Durumu</h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
              Mevcut randevunuzun durumunu öğrenmek için lütfen bilgilerinizi girin.
              Süreçle ilgili en güncel bilgiyi buradan takip edebilirsiniz.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <div>
                <label className="field-label" htmlFor="patientName">Ad Soyad</label>
                <input
                  id="patientName"
                  autoComplete="name"
                  placeholder="Örn: Ayşe Yılmaz"
                  className="field-input"
                  {...register("patientName", { required: true })}
                />
                {errors.patientName && <p className="mt-1 text-sm text-[#ba1a1a]">Ad soyad zorunludur.</p>}
              </div>

              <div>
                <label className="field-label" htmlFor="phone">Telefon Numarası</label>
                <input
                  id="phone"
                  autoComplete="tel"
                  placeholder="05XX XXX XX XX"
                  className="field-input"
                  {...register("phone", { required: true })}
                />
                {errors.phone && <p className="mt-1 text-sm text-[#ba1a1a]">Telefon numarası zorunludur.</p>}
              </div>

              {error && (
                <p role="alert" className="rounded-lg border border-[#ba1a1a]/30 bg-[#ba1a1a]/5 px-4 py-3 text-sm text-[#ba1a1a]">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Sorgulanıyor..." : "Sorgula"}
              </button>
            </form>

            {result && (
              <div className="mt-10 space-y-4">
                <h2 className="font-display text-xl text-charcoal">
                  {result.patientName} için randevular
                </h2>
                {result.appointments.map((appointment, idx) => (
                  <div key={idx} className="rounded-2xl border border-beige bg-cream p-5 sm:p-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-display text-lg text-charcoal">{appointment.serviceName}</span>
                      <StatusBadge status={appointment.status} />
                    </div>
                    <dl className="divide-y divide-beige text-sm">
                      <div className="flex justify-between py-2">
                        <dt className="text-ink-muted">Tarih</dt>
                        <dd className="font-medium text-charcoal">
                          {new Date(appointment.startsAt).toLocaleDateString("tr-TR")}
                        </dd>
                      </div>
                      <div className="flex justify-between py-2">
                        <dt className="text-ink-muted">Saat</dt>
                        <dd className="font-medium text-charcoal">
                          {new Date(appointment.startsAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: status explanations */}
          <div className="lg:border-l lg:border-beige lg:pl-16">
            <h2 className="font-display text-2xl text-burgundy">Durum Açıklamaları</h2>
            <ul className="mt-8 space-y-7">
              {STATUS_LEGEND.map((item) => (
                <li key={item.key} className="flex gap-4">
                  <span className="mt-1">
                    <StatusBadge status={item.key} />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-muted">{item.desc}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-beige pt-6">
              <p className="flex items-center gap-2 text-sm text-ink-muted">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                Bilgileriniz KVKK kapsamında korunmaktadır.
              </p>
              <Link
                to="/iletisim"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-charcoal underline decoration-1 underline-offset-4 transition-colors hover:text-burgundy"
              >
                Destek Ekibi ile İletişime Geç
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
