import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="grid gap-8 lg:grid-cols-2 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Estetik & Güven</h1>
          <p className="text-slate-600 mb-6">
            Kısa değer önerisi. Randevu ve iletişim için hızlı aksiyon.
          </p>
          <div className="flex gap-3">
            <Link to="/iletisim" className="px-4 py-2 rounded-lg bg-slate-900 text-white">
              Randevu Al
            </Link>
            <a href="https://wa.me/90XXXXXXXXXX" className="px-4 py-2 rounded-lg border">
              WhatsApp
            </a>
          </div>
        </div>
        <div className="aspect-video rounded-2xl bg-slate-200" />
      </section>
    </div>
  );
}
