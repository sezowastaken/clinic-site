import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, toDateKey } from "./appointments";
import {
  REASONS,
  buildMonthGrid,
  getDayStatus,
  validateNewRange,
  combineDateAndTime,
  mapWindowFromApi,
  fetchAvailability,
  createAvailability,
  deleteAvailability,
} from "./availability";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const STATUS_LABELS = {
  unavailable: "Müsait değil",
  partial: "Kısmen müsait",
  full: "Tam gün müsait",
};

const STATUS_DOT_STYLES = {
  unavailable: "bg-red-400",
  partial: "bg-amber-400",
  full: "bg-green-500",
};

const STATUS_BADGE_STYLES = {
  unavailable: "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-800",
  full: "bg-green-100 text-green-800",
};

function DayEditor({ date, entry, saving, actionError, onAddRange, onRemoveRange, onMarkUnavailable, onCopyTo }) {
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("13:00");
  const [error, setError] = useState("");
  const [reason, setReason] = useState(entry.reason);
  const [copyTarget, setCopyTarget] = useState("");

  const status = getDayStatus(entry);

  function handleAdd() {
    const err = validateNewRange(entry.ranges, start, end);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    onAddRange({ start, end });
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">
          {date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })}
        </h2>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_BADGE_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      {entry.reason && entry.ranges.length === 0 && (
        <p className="mt-2 text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
          Sebep: {entry.reason}
        </p>
      )}

      {actionError && <p className="mt-2 text-sm text-red-600">{actionError}</p>}

      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2">Müsait saat aralıkları</h3>
        {entry.ranges.length === 0 ? (
          <p className="text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
            Bu gün için tanımlı saat aralığı yok.
          </p>
        ) : (
          <ul className="space-y-2">
            {entry.ranges.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <span>
                  {r.start} – {r.end}
                </span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onRemoveRange(r.id)}
                  className="text-xs font-medium text-red-700 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Kaldır
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs mb-1">Başlangıç</label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Bitiş</label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleAdd}
            className="h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {saving ? "Kaydediliyor..." : "Ekle"}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-5 pt-4 border-t border-[var(--color-border)]">
        <h3 className="text-sm font-semibold mb-2">Günü müsait değil yap</h3>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs mb-1">Sebep (opsiyonel)</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-sm"
            >
              <option value="">Belirtilmedi</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => onMarkUnavailable(reason)}
            className="h-9 px-4 rounded-lg text-sm font-medium border border-red-200 text-red-700 hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Tüm Günü Müsait Değil Yap
          </button>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[var(--color-border)]">
        <h3 className="text-sm font-semibold mb-2">Başka bir güne kopyala</h3>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs mb-1">Hedef tarih</label>
            <input
              type="date"
              value={copyTarget}
              onChange={(e) => setCopyTarget(e.target.value)}
              className="border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={!copyTarget || saving}
            onClick={() => onCopyTo(copyTarget)}
            className="h-9 px-4 rounded-lg text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Kopyala
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Musaitlik() {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const grid = useMemo(() => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()), [viewDate]);
  const selectedKey = toDateKey(selectedDate);
  const selectedEntry = availability[selectedKey] ?? { ranges: [], reason: "" };

  const loadAvailability = useCallback(async () => {
    const dates = buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()).filter(Boolean);
    const rangeStart = dates[0];
    const rangeEnd = addDays(dates[dates.length - 1], 1);

    setLoading(true);
    setError("");
    try {
      const data = await fetchAvailability({
        dateFrom: rangeStart.toISOString(),
        dateTo: rangeEnd.toISOString(),
      });
      const map = {};
      data.items.forEach((item) => {
        const w = mapWindowFromApi(item);
        if (!map[w.dateKey]) map[w.dateKey] = { ranges: [], reason: "" };
        map[w.dateKey].ranges.push({ id: w.id, start: w.start, end: w.end });
      });
      setAvailability(map);
    } catch (err) {
      setError(err.message || "Müsaitlik yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [viewDate]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  function goToMonth(offset) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + offset, 1));
  }

  function goToToday() {
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }

  async function handleAddRange({ start, end }) {
    setActionError("");
    setSaving(true);
    try {
      await createAvailability({
        startsAt: combineDateAndTime(selectedDate, start).toISOString(),
        endsAt: combineDateAndTime(selectedDate, end).toISOString(),
      });
      await loadAvailability();
    } catch (err) {
      setActionError(
        err.code === "AVAILABILITY_CONFLICT" ? "Bu saat aralığı mevcut bir aralıkla çakışıyor." : err.message || "Kaydedilemedi."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveRange(rangeId) {
    setActionError("");
    setSaving(true);
    try {
      await deleteAvailability(rangeId);
      await loadAvailability();
    } catch (err) {
      setActionError(err.message || "Kaldırılamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkUnavailable(reason) {
    const entry = availability[selectedKey];
    if (entry && entry.ranges.length > 0) {
      const confirmed = window.confirm(
        "Bu gün için tanımlı müsaitlik aralıkları silinecek. Onaylıyor musunuz?"
      );
      if (!confirmed) return;
    }

    setActionError("");
    setSaving(true);
    try {
      const ranges = entry?.ranges ?? [];
      await Promise.all(ranges.map((r) => deleteAvailability(r.id)));
      await loadAvailability();
    } catch (err) {
      setActionError(err.message || "İşlem başarısız oldu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyTo(targetDateInput) {
    const [year, month, day] = targetDateInput.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day);
    const source = availability[selectedKey] ?? { ranges: [] };

    setActionError("");
    setSaving(true);
    try {
      await Promise.all(
        source.ranges.map((r) =>
          createAvailability({
            startsAt: combineDateAndTime(targetDate, r.start).toISOString(),
            endsAt: combineDateAndTime(targetDate, r.end).toISOString(),
          })
        )
      );
      await loadAvailability();
    } catch (err) {
      setActionError(
        err.code === "AVAILABILITY_CONFLICT" ? "Hedef günde çakışan bir aralık var." : err.message || "Kopyalanamadı."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Müsaitlik</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && (
        <p className="mt-4 text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Yükleniyor...</p>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        {/* Monthly calendar */}
        <div className="rounded-xl border border-[var(--color-border)] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              className="h-9 w-9 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
              aria-label="Önceki ay"
            >
              ‹
            </button>
            <div className="flex items-center gap-3">
              <span className="font-semibold">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={goToToday}
                className="h-8 px-3 rounded-lg text-sm border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
              >
                Bugün
              </button>
            </div>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              className="h-9 w-9 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
              aria-label="Sonraki ay"
            >
              ›
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
            {grid.map((date, idx) => {
              if (!date) return <div key={idx} />;
              const key = toDateKey(date);
              const status = getDayStatus(availability[key]);
              const isSelected = key === selectedKey;
              const isToday = key === toDateKey(new Date());
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={[
                    "aspect-square rounded-lg text-sm transition flex flex-col items-center justify-center gap-1",
                    isSelected ? "bg-[var(--color-primary)] text-white font-semibold" : "hover:bg-[var(--color-secondary)]",
                    isToday && !isSelected ? "ring-1 ring-[var(--color-primary)]" : "",
                  ].join(" ")}
                >
                  <span>{date.getDate()}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : STATUS_DOT_STYLES[status]}`} />
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" /> Müsait değil
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Kısmen müsait
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Tam gün müsait
            </span>
          </div>
        </div>

        {/* Selected-day editor */}
        <DayEditor
          key={selectedKey}
          date={selectedDate}
          entry={selectedEntry}
          saving={saving}
          actionError={actionError}
          onAddRange={handleAddRange}
          onRemoveRange={handleRemoveRange}
          onMarkUnavailable={handleMarkUnavailable}
          onCopyTo={handleCopyTo}
        />
      </div>
    </div>
  );
}
