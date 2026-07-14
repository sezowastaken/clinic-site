import { useForm } from "react-hook-form";
import Modal from "./Modal";
import { services } from "../../content/services";

function toInputDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function RequestEditForm({ request, onCancel, onSave }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: request.patient,
      phone: request.phone,
      email: request.email,
      service: request.service,
      date: toInputDate(request.requestedDate),
      time: request.requestedTime,
      internalNote: request.internalNote,
    },
  });

  function submit(data) {
    const [year, month, day] = data.date.split("-").map(Number);
    onSave(request.id, {
      patient: data.name,
      phone: data.phone,
      email: data.email,
      service: data.service,
      requestedDate: new Date(year, month - 1, day),
      requestedTime: data.time,
      internalNote: data.internalNote,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Ad Soyad</label>
          <input className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("name", { required: true })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Telefon</label>
          <input className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("phone", { required: true })} />
        </div>
        <div>
          <label className="block text-sm mb-1">E-posta (opsiyonel)</label>
          <input className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("email")} />
        </div>
        <div>
          <label className="block text-sm mb-1">İşlem</label>
          <select className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("service", { required: true })}>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
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
          <label className="block text-sm mb-1">Saat</label>
          <input
            type="time"
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2"
            {...register("time", { required: true })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">İç not (opsiyonel)</label>
        <textarea rows="2" className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("internalNote")} />
      </div>

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
          className="h-10 px-5 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md"
        >
          Kaydet ve Onayla
        </button>
      </div>
    </form>
  );
}

export default function RequestEditModal({ request, onClose, onSave }) {
  if (!request) return null;

  return (
    <Modal title="Talebi Düzenle" onClose={onClose} widthClassName="max-w-2xl">
      <RequestEditForm
        key={request.id}
        request={request}
        onCancel={onClose}
        onSave={(id, data) => {
          onSave(id, data);
          onClose();
        }}
      />
    </Modal>
  );
}
