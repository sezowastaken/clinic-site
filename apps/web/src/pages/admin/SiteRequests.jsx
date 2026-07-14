import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { REQUEST_STATUS_STYLES } from "./requests";
import RequestEditModal from "./RequestEditModal";

const TABS = [
  { id: "pending", label: "Bekleyen" },
  { id: "processed", label: "İşlenmiş" },
];

const PROCESSED_STATUS_FILTERS = ["Tümü", "Onaylandı", "Reddedildi"];

function formatDate(date) {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function matchesSearch(request, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return request.patient.toLowerCase().includes(q) || request.phone.toLowerCase().includes(q);
}

function RequestCard({ request, children }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{request.patient}</p>
          <p className="text-sm text-[color-mix(in srgb, var(--color-text) 65%, transparent)]">
            {request.phone}
            {request.email && ` · ${request.email}`}
          </p>
          <p className="mt-1 text-sm">
            {request.service} — {formatDate(request.requestedDate)}, {request.requestedTime}
          </p>
          <p className="text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">
            Talep tarihi: {formatDate(request.submittedAt)}
          </p>
          {request.patientNote && (
            <p className="mt-2 text-sm italic text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
              “{request.patientNote}”
            </p>
          )}
          {request.internalNote && (
            <p className="mt-2 text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">
              İç not: {request.internalNote}
            </p>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${REQUEST_STATUS_STYLES[request.status]}`}>
          {request.status}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function SiteRequests() {
  const { requests, approveRequest, rejectRequest, updateAndApproveRequest } = useOutletContext();
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [editingRequest, setEditingRequest] = useState(null);

  const pending = useMemo(
    () => requests.filter((r) => r.status === "Bekliyor" && matchesSearch(r, search)),
    [requests, search]
  );

  const processed = useMemo(
    () =>
      requests
        .filter((r) => r.status !== "Bekliyor")
        .filter((r) => matchesSearch(r, search))
        .filter((r) => statusFilter === "Tümü" || r.status === statusFilter)
        .sort((a, b) => b.requestedDate - a.requestedDate),
    [requests, search, statusFilter]
  );

  function handleReject(request) {
    const confirmed = window.confirm(`${request.patient} adlı talebi reddetmek istediğinize emin misiniz?`);
    if (confirmed) rejectRequest(request.id);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Site İstekleri</h1>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ad veya telefon ara..."
          className="h-9 w-56 max-w-full border border-[var(--color-border)] rounded-lg px-3 text-sm"
        />
      </div>

      <div className="mt-4 flex gap-2 border-b border-[var(--color-border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.id
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent hover:text-[var(--color-primary)]"
            }`}
          >
            {t.label}
            {t.id === "pending" && pending.length > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-xs font-semibold text-white">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "processed" && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Durum:</span>
          {PROCESSED_STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg border transition ${
                statusFilter === s
                  ? "border-[var(--color-primary)] bg-[var(--color-secondary)] text-[var(--color-primary)]"
                  : "border-[var(--color-border)] hover:bg-[var(--color-secondary)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {tab === "pending" &&
          (pending.length === 0 ? (
            <p className="py-8 text-center text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
              Bekleyen talep yok.
            </p>
          ) : (
            pending.map((r) => (
              <RequestCard key={r.id} request={r}>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => approveRequest(r.id)}
                    className="h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md"
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRequest(r)}
                    className="h-9 px-4 rounded-lg text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
                  >
                    Düzenle ve Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(r)}
                    className="h-9 px-4 rounded-lg text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50 transition"
                  >
                    Reddet
                  </button>
                </div>
              </RequestCard>
            ))
          ))}

        {tab === "processed" &&
          (processed.length === 0 ? (
            <p className="py-8 text-center text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
              Kayıt bulunamadı.
            </p>
          ) : (
            processed.map((r) => <RequestCard key={r.id} request={r} />)
          ))}
      </div>

      <RequestEditModal request={editingRequest} onClose={() => setEditingRequest(null)} onSave={updateAndApproveRequest} />
    </div>
  );
}
