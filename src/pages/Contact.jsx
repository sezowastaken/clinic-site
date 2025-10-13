import { useForm } from "react-hook-form";

export default function Contact() {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful } } = useForm();
  const onSubmit = (data) => { console.log(data); alert("Talep alındı (mock)."); };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Randevu & İletişim</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Ad Soyad</label>
          <input className="w-full border rounded-lg px-3 py-2" {...register("name", { required: true })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Telefon</label>
          <input className="w-full border rounded-lg px-3 py-2" {...register("phone", { required: true })} />
        </div>
        <div>
          <label className="block text-sm mb-1">E-posta (opsiyonel)</label>
          <input className="w-full border rounded-lg px-3 py-2" {...register("email")} />
        </div>
        <div>
          <label className="block text-sm mb-1">İlgilendiğiniz işlem</label>
          <input className="w-full border rounded-lg px-3 py-2" {...register("service")} />
        </div>
        <div>
          <label className="block text-sm mb-1">Not</label>
          <textarea rows="4" className="w-full border rounded-lg px-3 py-2" {...register("notes")} />
        </div>
        <button disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-slate-900 text-white">
          Gönder
        </button>
        {isSubmitSuccessful && <p className="text-green-700 mt-2">Teşekkürler! Size dönüş yapacağız.</p>}
      </form>

      {/* Calendly/Cal.com embed istersen: */}
      {/* <div className="mt-10">
        <iframe src="https://cal.com/USERNAME/30min?embed=1" className="w-full h-[700px] border rounded-xl"></iframe>
      </div> */}
    </div>
  );
}
