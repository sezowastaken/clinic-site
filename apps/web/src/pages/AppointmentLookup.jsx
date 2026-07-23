import { useState } from "react";
import { useForm } from "react-hook-form";
import { lookupAppointment } from "../api/public-booking";

const STATUS_LABELS = {
  pending: "Onay Bekliyor",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
  rejected: "Reddedildi",
  no_show: "Gelmedi",
};

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
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">Randevu Sorgula</h1>
      <p className="mt-3 text-center text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
        Randevu talebinizin durumunu öğrenmek için ad soyad ve telefon numaranızı girin.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-10 rounded-2xl border border-[var(--color-border)] p-4 sm:p-8 space-y-4"
        noValidate
      >
        <div>
          <label className="block text-sm mb-1" htmlFor="patientName">
            Ad Soyad
          </label>
          <input
            id="patientName"
            autoComplete="name"
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2"
            {...register("patientName", { required: true })}
          />
          {errors.patientName && <p className="text-sm text-red-600 mt-1">Ad soyad zorunludur.</p>}
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="phone">
            Telefon Numarası
          </label>
          <input
            id="phone"
            autoComplete="tel"
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2"
            {...register("phone", { required: true })}
          />
          {errors.phone && <p className="text-sm text-red-600 mt-1">Telefon numarası zorunludur.</p>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {loading ? "Sorgulanıyor..." : "Sorgula"}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">{result.patientName} için randevular</h2>
          {result.appointments.map((appointment, idx) => (
            <div key={idx} className="rounded-2xl border border-[var(--color-border)] p-4 sm:p-6">
              <dl className="divide-y divide-[var(--color-border)] text-sm">
                <div className="flex justify-between py-2">
                  <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Hizmet</dt>
                  <dd className="font-medium">{appointment.serviceName}</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Tarih</dt>
                  <dd className="font-medium">
                    {new Date(appointment.startsAt).toLocaleDateString("tr-TR")}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Saat</dt>
                  <dd className="font-medium">
                    {new Date(appointment.startsAt).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Durum</dt>
                  <dd className="font-medium">{STATUS_LABELS[appointment.status] || appointment.status}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
