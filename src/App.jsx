export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="p-10 rounded-2xl bg-white shadow-xl max-w-lg w-[90%]">
        <h1 className="text-3xl font-bold text-emerald-700 mb-4">
          Tailwind v4 gerçekten çalışıyor 🎉
        </h1>
        <p className="text-slate-600 leading-relaxed">
          Bu kutu Tailwind sınıflarıyla stillendi (bg-slate-100, shadow-xl, rounded-2xl vb.).
        </p>
        <button className="mt-6 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
          Buton örneği
        </button>
      </div>
    </div>
  );
}
