import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { services } from "../content/services";
import { fetchAvailability, submitAppointmentRequest } from "../api/public-booking";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const STEP_LABELS = ["Hizmet", "Tarih & Saat", "Bilgileriniz", "Onay"];
const SLOT_UNAVAILABLE_MESSAGE = "Seçtiğiniz saat artık müsait değil. Lütfen başka bir saat seçin.";

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildMonthGrid(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function monthRange(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  return {
    dateFrom: toDateKey(new Date(year, month, 1)),
    dateTo: toDateKey(new Date(year, month + 1, 0)),
  };
}

export default function Appointment() {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patient, setPatient] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [slotNotice, setSlotNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const grid = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const availabilityByDate = useMemo(() => {
    const map = new Map();
    for (const day of availabilityDays) map.set(day.date, day.slots);
    return map;
  }, [availabilityDays]);

  const selectedDaySlots = useMemo(
    () => (selectedDate ? availabilityByDate.get(toDateKey(selectedDate)) || [] : []),
    [selectedDate, availabilityByDate]
  );

  const loadAvailability = useCallback(() => {
    if (!selectedService) {
      setAvailabilityDays([]);
      setAvailabilityError("");
      setAvailabilityLoading(false);
      return;
    }

    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError("");

    const { dateFrom, dateTo } = monthRange(viewDate);
    fetchAvailability({ serviceSlug: selectedService.slug, dateFrom, dateTo })
      .then((data) => {
        if (!cancelled) setAvailabilityDays(data.days || []);
      })
      .catch((err) => {
        if (!cancelled) setAvailabilityError(err.message || "Müsaitlik bilgisi yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedService, viewDate]);

  useEffect(() => {
    setSelectedDate(null);
    setSelectedSlot(null);
    return loadAvailability();
  }, [loadAvailability]);

  function goToMonth(offset) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + offset, 1));
  }

  function pickDate(date) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlotNotice("");
  }

  function onPatientSubmit(data) {
    setPatient(data);
    setStep(3);
  }

  async function confirmAndSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      await submitAppointmentRequest({
        patientName: patient.name,
        phone: patient.phone,
        email: patient.email || undefined,
        serviceSlug: selectedService.slug,
        startsAt: selectedSlot.startsAt,
        patientNote: patient.note || undefined,
        kvkkConsent: true,
      });
      setSubmitted(true);
    } catch (err) {
      if (err.code === "SLOT_UNAVAILABLE") {
        setSelectedSlot(null);
        setSlotNotice(SLOT_UNAVAILABLE_MESSAGE);
        setStep(1);
        loadAvailability();
      } else {
        setSubmitError(err.message || "Randevu talebi gönderilemedi. Lütfen tekrar deneyin.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-primary)]">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">Randevu talebiniz alındı</h1>
        <p className="mt-3 text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
          {selectedService?.title} için {selectedDate?.toLocaleDateString("tr-TR")} tarihinde saat{" "}
          {selectedSlot?.label} talebiniz alınmıştır. Bu bir kesin randevu değildir; klinik onayını bekleyen
          bir taleptir. Ekibimiz en kısa sürede sizinle iletişime geçecektir.
        </p>

        <p className="mt-6 text-sm text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
          Randevu talebinizi adınız ve telefon numaranız ile sorgulayabilirsiniz.
        </p>
        <p className="mt-2 text-sm">
          <Link
            to="/randevu-sorgula"
            className="underline underline-offset-2 hover:text-[var(--color-primary)] transition"
          >
            Randevu durumunu sorgula
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">Randevu Al</h1>
      <p className="mt-3 text-center text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
        Aşağıdaki adımları tamamlayarak randevu talebi oluşturun. Talebiniz, klinik onayı sonrası
        kesinleşir.
      </p>

      {/* Step indicator */}
      <ol className="mt-8 flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
        {STEP_LABELS.map((label, idx) => (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <span
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full font-semibold",
                idx === step
                  ? "bg-[var(--color-primary)] text-white"
                  : idx < step
                  ? "bg-[var(--color-secondary)] text-[var(--color-primary)]"
                  : "bg-[var(--color-secondary)] text-[color-mix(in srgb, var(--color-text) 50%, transparent)]",
              ].join(" ")}
            >
              {idx + 1}
            </span>
            <span className={idx === step ? "font-semibold" : "hidden sm:inline"}>{label}</span>
            {idx < STEP_LABELS.length - 1 && <span className="hidden sm:inline text-[var(--color-border)]">—</span>}
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-2xl border border-[var(--color-border)] p-4 sm:p-8">
        {/* Step 0: service selection */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold">Bir hizmet seçin</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setSelectedService(s)}
                  className={[
                    "text-left rounded-xl border p-4 transition hover:-translate-y-0.5 active:translate-y-0",
                    selectedService?.slug === s.slug
                      ? "border-[var(--color-primary)] bg-[var(--color-secondary)]"
                      : "border-[var(--color-border)] hover:bg-[var(--color-secondary)]",
                  ].join(" ")}
                >
                  <span className="font-semibold">{s.title}</span>
                  <p className="mt-1 text-sm text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
                    {s.desc}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={!selectedService}
                onClick={() => setStep(1)}
                className="h-11 px-6 rounded-lg font-semibold text-white bg-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step 1: date + time */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold">Tarih ve saat seçin</h2>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                className="h-9 w-9 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
                aria-label="Önceki ay"
              >
                ‹
              </button>
              <span className="font-semibold">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                className="h-9 w-9 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
                aria-label="Sonraki ay"
              >
                ›
              </button>
            </div>

            {slotNotice && (
              <p className="mt-4 text-sm text-red-600">{slotNotice}</p>
            )}

            {availabilityLoading && (
              <p className="mt-4 text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
                Müsaitlik yükleniyor...
              </p>
            )}
            {availabilityError && <p className="mt-4 text-sm text-red-600">{availabilityError}</p>}

            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">{w}</div>
              ))}
              {grid.map((date, idx) => {
                if (!date) return <div key={idx} />;
                const isPast = date < today;
                const hasAvailability = (availabilityByDate.get(toDateKey(date)) || []).length > 0;
                const isDisabled = isPast || availabilityLoading || !!availabilityError || !hasAvailability;
                const isSelected = selectedDate && toDateKey(date) === toDateKey(selectedDate);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => pickDate(date)}
                    className={[
                      "aspect-square rounded-lg text-sm transition",
                      isDisabled
                        ? "text-[color-mix(in srgb, var(--color-text) 30%, transparent)] cursor-not-allowed"
                        : isSelected
                        ? "bg-[var(--color-primary)] text-white font-semibold"
                        : "hover:bg-[var(--color-secondary)]",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2">
                  {selectedDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })}{" "}
                  için müsait saatler
                </h3>
                {selectedDaySlots.length === 0 ? (
                  <p className="text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
                    Bu tarihte müsait saat bulunmuyor, lütfen başka bir gün seçin.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {selectedDaySlots.map((slot) => (
                      <button
                        key={slot.startsAt}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setSlotNotice("");
                        }}
                        className={[
                          "h-10 rounded-lg border text-sm transition",
                          selectedSlot?.startsAt === slot.startsAt
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white font-semibold"
                            : "border-[var(--color-border)] hover:bg-[var(--color-secondary)]",
                        ].join(" ")}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="h-11 px-6 rounded-lg font-semibold border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
              >
                Geri
              </button>
              <button
                type="button"
                disabled={!selectedDate || !selectedSlot || availabilityLoading || !!availabilityError}
                onClick={() => setStep(2)}
                className="h-11 px-6 rounded-lg font-semibold text-white bg-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step 2: patient info */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onPatientSubmit)}>
            <h2 className="text-lg font-semibold">Bilgileriniz</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm mb-1">Ad Soyad</label>
                <input
                  className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2"
                  {...register("name", { required: true })}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">Ad soyad zorunludur.</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Telefon</label>
                <input
                  className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2"
                  {...register("phone", { required: true })}
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1">Telefon zorunludur.</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">E-posta (opsiyonel)</label>
                <input
                  className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2"
                  {...register("email")}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Not (opsiyonel)</label>
                <textarea
                  rows="3"
                  className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2"
                  {...register("note")}
                />
              </div>
              <div>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" {...register("kvkk", { required: true })} />
                  <span>
                    <Link to="/kvkk" className="underline underline-offset-2 hover:text-[var(--color-primary)]">
                      KVKK Aydınlatma Metni
                    </Link>
                    &apos;ni okudum ve kişisel verilerimin
                    işlenmesini kabul ediyorum.
                  </span>
                </label>
                {errors.kvkk && (
                  <p className="text-sm text-red-600 mt-1">Devam etmek için KVKK onayı gereklidir.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 px-6 rounded-lg font-semibold border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
              >
                Geri
              </button>
              <button
                type="submit"
                className="h-11 px-6 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md"
              >
                Devam Et
              </button>
            </div>
          </form>
        )}

        {/* Step 3: review + submit */}
        {step === 3 && patient && (
          <div>
            <h2 className="text-lg font-semibold">Talebinizi gözden geçirin</h2>
            <dl className="mt-4 divide-y divide-[var(--color-border)] text-sm">
              <div className="flex justify-between py-2">
                <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Hizmet</dt>
                <dd className="font-medium">{selectedService?.title}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Tarih</dt>
                <dd className="font-medium">{selectedDate?.toLocaleDateString("tr-TR")}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Saat</dt>
                <dd className="font-medium">{selectedSlot?.label}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Ad Soyad</dt>
                <dd className="font-medium">{patient.name}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Telefon</dt>
                <dd className="font-medium">{patient.phone}</dd>
              </div>
              {patient.email && (
                <div className="flex justify-between py-2">
                  <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">E-posta</dt>
                  <dd className="font-medium">{patient.email}</dd>
                </div>
              )}
              {patient.note && (
                <div className="flex justify-between py-2 gap-4">
                  <dt className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Not</dt>
                  <dd className="font-medium text-right">{patient.note}</dd>
                </div>
              )}
            </dl>

            <p className="mt-4 text-xs text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
              Bu talep, klinik tarafından onaylanana kadar kesin randevu anlamına gelmez.
            </p>

            {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={submitting}
                className="h-11 px-6 rounded-lg font-semibold border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Geri
              </button>
              <button
                type="button"
                onClick={confirmAndSubmit}
                disabled={submitting}
                className="h-11 px-6 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {submitting ? "Gönderiliyor..." : "Onayla ve Gönder"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
