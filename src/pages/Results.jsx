export default function Results() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Öncesi / Sonrası</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-slate-200 rounded-xl" />
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">
        *Sonuçlar kişiden kişiye değişebilir.
      </p>
    </div>
  );
}
