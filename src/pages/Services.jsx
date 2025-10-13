import { services } from "../content/services";

export default function Services() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Hizmetler</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div key={s.slug} className="p-5 rounded-xl border bg-white">
            <h2 className="font-semibold mb-2">{s.title}</h2>
            <p className="text-sm text-slate-600">{s.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
