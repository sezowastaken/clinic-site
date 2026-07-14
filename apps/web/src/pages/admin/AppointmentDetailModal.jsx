import Modal from "./Modal";
import { STATUS_STYLES } from "./appointments";

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-[var(--color-border)] last:border-0">
      <dt className="text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

export default function AppointmentDetailModal({ appointment, onClose }) {
  if (!appointment) return null;

  const dateLabel = appointment.date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Modal title="Randevu Detayı" onClose={onClose}>
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[appointment.status]}`}>
        {appointment.status}
      </span>
      <dl className="mt-3">
        <Field label="Hasta" value={appointment.patient} />
        <Field label="Telefon" value={appointment.phone} />
        <Field label="E-posta" value={appointment.email} />
        <Field label="İşlem" value={appointment.service} />
        <Field label="Tarih ve saat" value={`${dateLabel} · ${appointment.time} (${appointment.duration} dk)`} />
        <Field label="Kaynak" value={appointment.source} />
        <Field label="Hasta notu" value={appointment.patientNote} />
        <Field label="İç not" value={appointment.internalNote} />
      </dl>
    </Modal>
  );
}
