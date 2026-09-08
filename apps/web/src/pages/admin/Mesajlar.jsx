import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchMessages, markMessageRead, mapMessageFromApi } from "./messages";

const TABS = [
  { id: "unread", label: "Okunmamış" },
  { id: "all", label: "Tümü" },
];

function formatDateTime(date) {
  return date.toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function matchesSearch(message, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    message.name.toLowerCase().includes(q) ||
    message.phone.toLowerCase().includes(q) ||
    message.email.toLowerCase().includes(q)
  );
}

function MessageCard({ message, onMarkRead, marking }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{message.name}</p>
          <p className="text-sm text-[color-mix(in srgb, var(--color-text) 65%, transparent)]">
            {message.phone}
            {message.email && ` · ${message.email}`}
          </p>
          <p className="text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">
            {formatDateTime(message.createdAt)}
          </p>
          {message.message && (
            <p className="mt-2 text-sm italic text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
              “{message.message}”
            </p>
          )}
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
            message.isRead ? "bg-[var(--color-secondary)] text-[color-mix(in srgb, var(--color-text) 65%, transparent)]" : "bg-amber-100 text-amber-800"
          }`}
        >
          {message.isRead ? "Okundu" : "Yeni"}
        </span>
      </div>
      {!message.isRead && (
        <div className="mt-4">
          <button
            type="button"
            disabled={marking}
            onClick={() => onMarkRead(message)}
            className="h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {marking ? "İşleniyor..." : "Okundu olarak işaretle"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Mesajlar() {
  const { refreshUnreadMessagesCount } = useOutletContext();
  const [tab, setTab] = useState("unread");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMessages();
      setMessages(data.items.map(mapMessageFromApi));
    } catch (err) {
      setError(err.message || "Mesajlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      messages
        .filter((m) => tab === "all" || !m.isRead)
        .filter((m) => matchesSearch(m, search)),
    [messages, tab, search]
  );

  const unreadCount = useMemo(() => messages.filter((m) => !m.isRead).length, [messages]);

  async function handleMarkRead(message) {
    setMarkingId(message.id);
    try {
      await markMessageRead(message.id);
      await Promise.all([load(), refreshUnreadMessagesCount?.()]);
    } catch (err) {
      setError(err.message || "Mesaj güncellenemedi.");
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Mesajlar</h1>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ad, telefon veya e-posta ara..."
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
            {t.id === "unread" && unreadCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="py-8 text-center text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
            Yükleniyor...
          </p>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
            {tab === "unread" ? "Okunmamış mesaj yok." : "Mesaj bulunamadı."}
          </p>
        ) : (
          visible.map((m) => (
            <MessageCard key={m.id} message={m} onMarkRead={handleMarkRead} marking={markingId === m.id} />
          ))
        )}
      </div>
    </div>
  );
}
