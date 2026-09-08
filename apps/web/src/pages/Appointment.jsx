import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { services } from "../content/services";
import { fetchAvailability, submitAppointmentRequest } from "../api/public-booking";
import { Container } from "../shared/ui";

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

function SummaryRow({ label, value, placeholder }) {
  return (
    <div>
      <p className="label-caps text-ink-muted">{label}</p>
      {value ? (
        <p className="mt-1 text-sm font-medium text-charcoal">{value}</p>
      ) : (
        <p className="mt-1 text-sm italic text-ink-muted/70">{placeholder}</p>
      )}
    </div>
  );
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
      <section className="bg-ivory">
        <Container className="max-w-xl py-20 text-center sm:py-24">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage-surface text-sage">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-charcoal sm:text-4xl">
            Randevu talebiniz alındı
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            {selectedService?.title} için {selectedDate?.toLocaleDateString("tr-TR")} tarihinde saat{" "}
            {selectedSlot?.label} talebiniz alınmıştır. Bu bir kesin randevu değildir; klinik onayını bekleyen
            bir taleptir. Ekibimiz en kısa sürede sizinle iletişime geçecektir.
          </p>

          <p className="mt-6 text-sm text-ink-muted">
            Randevu talebinizi adınız ve telefon numaranız ile sorgulayabilirsiniz.
          </p>
          <p className="mt-2">
            <Link to="/randevu-sorgula" className="text-link">
              Randevu durumunu sorgula
            </Link>
          </p>
        </Container>
      </section>
    );
  }

  const dateLabel = selectedDate?.toLocaleDateString("tr-TR");

  return (
    <section className="bg-ivory">
      <Container className="py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
          {/* Main column */}
          <div>
            <h1 className="font-display text-4xl text-charcoal sm:text-5xl">Randevu Al</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              Lütfen randevu talebinizi oluşturmak için aşağıdaki adımları tamamlayın.
              Talebiniz, klinik onayı sonrası kesinleşir.
            </p>

            {/* Step indicator */}
            <ol className="mt-8 flex items-center gap-2 sm:gap-3">
              {STEP_LABELS.map((label, idx) => (
                <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3 last:flex-none">
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      idx === step
                        ? "bg-burgundy text-ivory"
                        : idx < step
                        ? "bg-burgundy/15 text-burgundy"
                        : "bg-parchment text-ink-muted",
                    ].join(" ")}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={[
                      "text-xs font-semibold uppercase tracking-wider",
                      idx === step ? "text-charcoal" : "hidden text-ink-muted sm:inline",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                  {idx < STEP_LABELS.length - 1 && (
                    <span className="hidden h-px flex-1 bg-beige sm:block" />
                  )}
                </li>
              ))}
            </ol>

            <div className="mt-10">
              {/* Step 0: service selection */}
              {step === 0 && (
                <div>
                  <h2 className="font-display text-2xl text-charcoal">Hizmet Seçimi</h2>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {services.map((s) => {
                      const active = selectedService?.slug === s.slug;
                      return (
                        <button
                          key={s.slug}
                          type="button"
                          onClick={() => setSelectedService(s)}
                          aria-pressed={active}
                          className={[
                            "rounded-2xl border p-5 text-left transition-colors duration-300",
                            active
                              ? "border-burgundy bg-apricot-surface"
                              : "border-beige bg-cream hover:border-sage",
                          ].join(" ")}
                        >
                          <span className="font-display text-lg text-charcoal">{s.title}</span>
                          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{s.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      disabled={!selectedService}
                      onClick={() => setStep(1)}
                      className="btn-primary"
                    >
                      İleri: Tarih & Saat
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: date + time */}
              {step === 1 && (
                <div>
                  <h2 className="font-display text-2xl text-charcoal">Tarih ve Saat</h2>

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => goToMonth(-1)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-beige text-charcoal transition-colors hover:bg-parchment"
                      aria-label="Önceki ay"
                    >
                      ‹
                    </button>
                    <span className="font-display text-lg text-charcoal">
                      {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={() => goToMonth(1)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-beige text-charcoal transition-colors hover:bg-parchment"
                      aria-label="Sonraki ay"
                    >
                      ›
                    </button>
                  </div>

                  {slotNotice && <p className="mt-4 text-sm text-[var(--color-error,#ba1a1a)]">{slotNotice}</p>}

                  {availabilityLoading && (
                    <p className="mt-4 text-sm text-ink-muted">Müsaitlik yükleniyor...</p>
                  )}
                  {availabilityError && (
                    <p className="mt-4 text-sm text-[#ba1a1a]">{availabilityError}</p>
                  )}

                  <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-ink-muted">
                    {WEEKDAYS.map((w) => (
                      <div key={w} className="py-1 font-semibold">{w}</div>
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
                            "aspect-square rounded-lg text-sm transition-colors",
                            isDisabled
                              ? "cursor-not-allowed text-ink-muted/40"
                              : isSelected
                              ? "bg-burgundy font-semibold text-ivory"
                              : "text-charcoal hover:bg-parchment",
                          ].join(" ")}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <div className="mt-6">
                      <h3 className="mb-3 text-sm font-semibold text-charcoal">
                        {selectedDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })}{" "}
                        için müsait saatler
                      </h3>
                      {selectedDaySlots.length === 0 ? (
                        <p className="text-sm text-ink-muted">
                          Bu tarihte müsait saat bulunmuyor, lütfen başka bir gün seçin.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {selectedDaySlots.map((slot) => (
                            <button
                              key={slot.startsAt}
                              type="button"
                              onClick={() => {
                                setSelectedSlot(slot);
                                setSlotNotice("");
                              }}
                              className={[
                                "h-11 rounded-lg border text-sm transition-colors",
                                selectedSlot?.startsAt === slot.startsAt
                                  ? "border-burgundy bg-burgundy font-semibold text-ivory"
                                  : "border-beige text-charcoal hover:bg-parchment",
                              ].join(" ")}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <button type="button" onClick={() => setStep(0)} className="btn-secondary">
                      Geri
                    </button>
                    <button
                      type="button"
                      disabled={!selectedDate || !selectedSlot || availabilityLoading || !!availabilityError}
                      onClick={() => setStep(2)}
                      className="btn-primary"
                    >
                      İleri: Bilgileriniz
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: patient info */}
              {step === 2 && (
                <form onSubmit={handleSubmit(onPatientSubmit)}>
                  <h2 className="font-display text-2xl text-charcoal">Bilgileriniz</h2>
                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="field-label" htmlFor="ap-name">Ad Soyad</label>
                      <input id="ap-name" className="field-input" {...register("name", { required: true })} />
                      {errors.name && <p className="mt-1 text-sm text-[#ba1a1a]">Ad soyad zorunludur.</p>}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="ap-phone">Telefon</label>
                      <input id="ap-phone" className="field-input" {...register("phone", { required: true })} />
                      {errors.phone && <p className="mt-1 text-sm text-[#ba1a1a]">Telefon zorunludur.</p>}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="ap-email">E-posta (opsiyonel)</label>
                      <input id="ap-email" className="field-input" {...register("email")} />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="ap-note">Not (opsiyonel)</label>
                      <textarea id="ap-note" rows="3" className="field-input resize-y" {...register("note")} />
                    </div>
                    <div>
                      <label className="flex items-start gap-3 text-sm text-charcoal">
                        <input type="checkbox" className="mt-1 accent-[#793f43]" {...register("kvkk", { required: true })} />
                        <span>
                          <Link to="/kvkk" className="text-link">KVKK Aydınlatma Metni</Link>
                          &apos;ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum.
                        </span>
                      </label>
                      {errors.kvkk && (
                        <p className="mt-1 text-sm text-[#ba1a1a]">Devam etmek için KVKK onayı gereklidir.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                      Geri
                    </button>
                    <button type="submit" className="btn-primary">
                      İleri: Onay
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: review + submit */}
              {step === 3 && patient && (
                <div>
                  <h2 className="font-display text-2xl text-charcoal">Talebinizi gözden geçirin</h2>
                  <dl className="mt-6 divide-y divide-beige rounded-2xl border border-beige bg-cream px-5 text-sm">
                    <div className="flex justify-between py-3">
                      <dt className="text-ink-muted">Hizmet</dt>
                      <dd className="font-medium text-charcoal">{selectedService?.title}</dd>
                    </div>
                    <div className="flex justify-between py-3">
                      <dt className="text-ink-muted">Tarih</dt>
                      <dd className="font-medium text-charcoal">{dateLabel}</dd>
                    </div>
                    <div className="flex justify-between py-3">
                      <dt className="text-ink-muted">Saat</dt>
                      <dd className="font-medium text-charcoal">{selectedSlot?.label}</dd>
                    </div>
                    <div className="flex justify-between py-3">
                      <dt className="text-ink-muted">Ad Soyad</dt>
                      <dd className="font-medium text-charcoal">{patient.name}</dd>
                    </div>
                    <div className="flex justify-between py-3">
                      <dt className="text-ink-muted">Telefon</dt>
                      <dd className="font-medium text-charcoal">{patient.phone}</dd>
                    </div>
                    {patient.email && (
                      <div className="flex justify-between py-3">
                        <dt className="text-ink-muted">E-posta</dt>
                        <dd className="font-medium text-charcoal">{patient.email}</dd>
                      </div>
                    )}
                    {patient.note && (
                      <div className="flex justify-between gap-4 py-3">
                        <dt className="text-ink-muted">Not</dt>
                        <dd className="text-right font-medium text-charcoal">{patient.note}</dd>
                      </div>
                    )}
                  </dl>

                  <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                    Bu talep, klinik tarafından onaylanana kadar kesin randevu anlamına gelmez.
                  </p>

                  {submitError && <p className="mt-4 text-sm text-[#ba1a1a]">{submitError}</p>}

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={submitting}
                      className="btn-secondary"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={confirmAndSubmit}
                      disabled={submitting}
                      className="btn-primary"
                    >
                      {submitting ? "Gönderiliyor..." : "Onayla ve Gönder"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-beige bg-cream p-6">
              <h2 className="font-display text-xl text-charcoal">Randevu Özeti</h2>
              <div className="mt-5 space-y-4 border-t border-beige pt-5">
                <SummaryRow label="Seçilen Hizmet" value={selectedService?.title} placeholder="Henüz seçilmedi" />
                <SummaryRow label="Tarih" value={dateLabel} placeholder="Henüz seçilmedi" />
                <SummaryRow label="Saat" value={selectedSlot?.label} placeholder="Henüz seçilmedi" />
                <SummaryRow
                  label="İletişim Bilgileri"
                  value={patient?.name ? `${patient.name} · ${patient.phone}` : null}
                  placeholder="Henüz girilmedi"
                />
              </div>
              <p className="mt-6 rounded-lg bg-parchment px-4 py-3 text-xs leading-relaxed text-ink-muted">
                Talebiniz klinik onayına tabidir. Ekibimiz en kısa sürede sizinle
                iletişime geçerek randevunuzu teyit eder.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
