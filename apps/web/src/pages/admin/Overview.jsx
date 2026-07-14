const KPIS = [
  { label: "Bugünkü Randevular", value: "5" },
  { label: "Bekleyen Site Talepleri", value: "3" },
  { label: "Bu Haftaki Randevular", value: "18" },
  { label: "Sıradaki Randevu", value: "14:30 — Ayşe Yılmaz" },
];

const TODAY_SCHEDULE = [
  { time: "09:00", patient: "Elif Demir", service: "Burun Estetiği", status: "Onaylandı" },
  { time: "11:30", patient: "Mehmet Kaya", service: "Liposuction", status: "Onaylandı" },
  { time: "14:30", patient: "Ayşe Yılmaz", service: "Meme Büyütme", status: "Bekliyor" },
  { time: "16:00", patient: "Zeynep Arslan", service: "Yüz Germe", status: "Onaylandı" },
];

const NEW_REQUESTS = [
  { patient: "Fatma Şahin", service: "Karın Germe", requestedTime: "18 Temmuz, 10:00" },
  { patient: "Can Öztürk", service: "Göz Kapağı Estetiği", requestedTime: "19 Temmuz, 15:30" },
  { patient: "Deniz Aydın", service: "Burun Estetiği", requestedTime: "20 Temmuz, 11:00" },
];

function StatusBadge({ status }) {
  const isPending = status === "Bekliyor";
  return (
    <span
      className={[
        "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
        isPending ? "bg-amber-100 text-amber-800" : "bg-[var(--color-secondary)] text-[var(--color-primary)]",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

export default function Overview() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Özet</h1>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">{k.label}</p>
            <p className="mt-2 text-2xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-[var(--color-border)] p-4 sm:p-5">
          <h2 className="font-semibold">Bugünün Programı</h2>
          <ul className="mt-3 divide-y divide-[var(--color-border)]">
            {TODAY_SCHEDULE.map((a) => (
              <li key={a.time + a.patient} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="font-medium">{a.time}</span>{" "}
                  <span className="text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
                    — {a.patient}
                  </span>
                  <p className="text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">
                    {a.service}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--color-border)] p-4 sm:p-5">
          <h2 className="font-semibold">Yeni Randevu Talepleri</h2>
          <ul className="mt-3 divide-y divide-[var(--color-border)]">
            {NEW_REQUESTS.map((r) => (
              <li key={r.patient} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="font-medium">{r.patient}</span>
                  <p className="text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">
                    {r.service} · {r.requestedTime}
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  title="Yakında"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)] opacity-40 cursor-not-allowed shrink-0"
                >
                  İncele
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
