import { useEffect, useState } from "react";
import { mapAppointmentFromApi } from "./appointments";
import { mapRequestFromApi } from "./requests";

async function request(path) {
  const res = await fetch(path, { credentials: "include" });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const error = new Error(body?.error?.message || "İstek başarısız oldu.");
    error.code = body?.error?.code;
    throw error;
  }

  return body;
}

function fetchDashboard() {
  return request("/api/admin/dashboard");
}

function formatRequestedTime(date, time) {
  return `${date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}, ${time}`;
}

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
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchDashboard()
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Özet verileri yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const todayAppointments = (dashboard?.todayAppointments ?? []).map(mapAppointmentFromApi);
  const latestPendingRequests = (dashboard?.latestPendingRequests ?? []).map(mapRequestFromApi);
  const nextAppointment = dashboard?.nextAppointment ? mapAppointmentFromApi(dashboard.nextAppointment) : null;

  const kpis = dashboard
    ? [
        { label: "Bugünkü Randevular", value: String(dashboard.todayAppointmentCount) },
        { label: "Bekleyen Site Talepleri", value: String(dashboard.pendingWebsiteRequestCount) },
        { label: "Bu Haftaki Randevular", value: String(dashboard.currentWeekAppointmentCount) },
        {
          label: "Sıradaki Randevu",
          value: nextAppointment ? `${nextAppointment.time} — ${nextAppointment.patient}` : "Randevu yok",
        },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold">Özet</h1>

      {loading && (
        <p className="mt-4 text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Yükleniyor...</p>
      )}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {dashboard && (
        <>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-[var(--color-border)] p-4">
                <p className="text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">{k.label}</p>
                <p className="mt-2 text-2xl font-bold">{k.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-xl border border-[var(--color-border)] p-4 sm:p-5">
              <h2 className="font-semibold">Bugünün Programı</h2>
              {todayAppointments.length === 0 ? (
                <p className="mt-3 text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
                  Bugün için randevu yok.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-[var(--color-border)]">
                  {todayAppointments.map((a) => (
                    <li key={a.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <span className="font-medium">{a.time}</span>{" "}
                        <span className="text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
                          — {a.patient}
                        </span>
                        <p className="text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">
                          {a.service}
                        </p>
                      </div>
                      <StatusBadge status={a.statusLabel} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-[var(--color-border)] p-4 sm:p-5">
              <h2 className="font-semibold">Yeni Randevu Talepleri</h2>
              {latestPendingRequests.length === 0 ? (
                <p className="mt-3 text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
                  Bekleyen talep yok.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-[var(--color-border)]">
                  {latestPendingRequests.map((r) => (
                    <li key={r.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <span className="font-medium">{r.patient}</span>
                        <p className="text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">
                          {r.service} · {formatRequestedTime(r.requestedDate, r.requestedTime)}
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
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
