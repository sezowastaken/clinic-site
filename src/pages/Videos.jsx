import { videos } from "../content/videos";

export default function Videos() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Videolar</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {videos.map((v) => (
          <div key={v.id} className="rounded-xl overflow-hidden border bg-white">
            <div className="aspect-video">
              <iframe
                src={v.embed}
                title={v.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4">
              <h2 className="font-semibold">{v.title}</h2>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                {v.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
