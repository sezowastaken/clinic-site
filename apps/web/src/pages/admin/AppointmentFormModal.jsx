import { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal";
import { STATUS_OPTIONS, SOURCE_OPTIONS } from "./appointments";
import { services } from "../../content/services";

const DURATIONS = [30, 45, 60, 90, 120];

function toInputDate(date) {
  const d = date ?? new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function AppointmentForm({ initialDate, initialTime, onCancel, onSubmit }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: services[0]?.slug ?? "",
      date: toInputDate(initialDate),
      startTime: initialTime ?? "09:00",
      duration: "60",
      source: SOURCE_OPTIONS[0]?.value ?? "phone",
      status: "confirmed",
      patientNote: "",
      internalNote: "",
    },
  });

  async function submit(data) {
    setSubmitError("");
    const [year, month, day] = data.date.split("-").map(Number);
    const [hour, minute] = data.startTime.split(":").map(Number);
    const startsAt = new Date(year, month - 1, day, hour, minute).toISOString();

    setSubmitting(true);
    const result = await onSubmit({
      patientName: data.name,
      phone: data.phone,
      email: data.email || undefined,
      serviceSlug: data.service,
      startsAt,
      durationMinutes: Number(data.duration),
      source: data.source,
      status: data.status,
      patientNote: data.patientNote || undefined,
      internalNote: data.internalNote || undefined,
    });
    setSubmitting(false);

    if (!result?.ok) {
      setSubmitError(result?.error || "Randevu kaydedilemedi.");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Ad Soyad</label>
          <input className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("name", { required: true })} />
          {errors.name && <p className="text-sm text-red-600 mt-1">Zorunlu alan.</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Telefon</label>
          <input className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("phone", { required: true })} />
          {errors.phone && <p className="text-sm text-red-600 mt-1">Zorunlu alan.</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">E-posta (opsiyonel)</label>
          <input className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("email")} />
        </div>
        <div>
          <label className="block text-sm mb-1">İşlem</label>
          <select className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("service", { required: true })}>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Tarih</label>
          <input
            type="date"
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2"
            {...register("date", { required: true })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Başlangıç saati</label>
          <input
            type="time"
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2"
            {...register("startTime", { required: true })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Süre</label>
          <select className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("duration", { required: true })}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} dk
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Kaynak</label>
          <select className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("source", { required: true })}>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Durum</label>
          <select className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("status", { required: true })}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Hasta notu (opsiyonel)</label>
        <textarea rows="2" className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("patientNote")} />
      </div>
      <div>
        <label className="block text-sm mb-1">İç not (opsiyonel)</label>
        <textarea rows="2" className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("internalNote")} />
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-5 rounded-lg font-medium border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="h-10 px-5 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {submitting ? "Kaydediliyor..." : "Randevuyu Kaydet"}
        </button>
      </div>
    </form>
  );
}

export default function AppointmentFormModal({ open, initialDate, initialTime, onClose, onSubmit }) {
  if (!open) return null;

  return (
    <Modal title="Yeni Randevu" onClose={onClose} widthClassName="max-w-2xl">
      <AppointmentForm
        key={`${toInputDate(initialDate)}-${initialTime ?? ""}`}
        initialDate={initialDate}
        initialTime={initialTime}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
