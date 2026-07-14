import { useForm } from "react-hook-form";

export default function Contact() {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful } } = useForm();
  const onSubmit = (data) => { console.log(data); alert("Talep alındı (mock)."); };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold mb-2">İletişim</h1>
      <p className="text-[color-mix(in srgb, var(--color-text) 70%, transparent)] mb-6">
        Sorularınız için bize ulaşın, sizi geri arayalım.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <label className="block text-sm mb-1">Mesajınız</label>
          <textarea rows="4" className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2" {...register("notes")} />
        </div>
        <button
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition will-change-transform shadow hover:shadow-md"
        >
          Gönder
        </button>
        {isSubmitSuccessful && <p className="text-green-700 mt-2">Teşekkürler! Size dönüş yapacağız.</p>}
      </form>
    </div>
  );
}
