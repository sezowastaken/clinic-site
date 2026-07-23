import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addDays, toDateKey } from "./appointments";
import {
  buildMonthGrid,
  canonicalRanges,
  dayCellLabel,
  mapWindowFromApi,
  fetchAvailability,
  bulkUpdateAvailability,
} from "./availability";
import AvailabilityTimeline from "./AvailabilityTimeline";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const TONE_STYLES = {
  closed: "bg-[color-mix(in srgb, var(--color-text) 5%, transparent)] text-[color-mix(in srgb, var(--color-text) 55%, transparent)] border-[var(--color-border)]",
  partial: "bg-amber-50 text-amber-800 border-amber-200",
  full: "bg-green-50 text-green-800 border-green-200",
};

function keyToDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function keyInMonth(key, viewDate) {
  const d = keyToDate(key);
  return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
}

export default function Musaitlik() {
  const todayKey = toDateKey(new Date());

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedKeys, setSelectedKeys] = useState([]);
  const [anchorKey, setAnchorKey] = useState(null);
  const [multiSelect, setMultiSelect] = useState(false);

  const [draft, setDraft] = useState([]);
  const [baseline, setBaseline] = useState([]);
  const [mixed, setMixed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const grid = useMemo(() => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()), [viewDate]);
  const sortedSelected = useMemo(() => [...selectedKeys].sort(), [selectedKeys]);

  const draftDirty = useMemo(
    () => canonicalRanges(draft) !== canonicalRanges(baseline),
    [draft, baseline]
  );
  // Keep a ref so guarded handlers can read dirtiness without stale closures.
  const dirtyRef = useRef(false);
  dirtyRef.current = draftDirty;

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
        if (!map[w.dateKey]) map[w.dateKey] = [];
        map[w.dateKey].push({ start: w.start, end: w.end });
      });
      Object.values(map).forEach((ranges) => ranges.sort((a, b) => a.start.localeCompare(b.start)));
      setAvailabilityMap(map);
    } catch (err) {
      setError(err.message || "Müsaitlik yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [viewDate]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Drop selected dates that fall outside the visible month.
  useEffect(() => {
    setSelectedKeys((prev) => prev.filter((k) => keyInMonth(k, viewDate)));
  }, [viewDate]);

  // Rebuild the draft whenever the selection or loaded schedules change.
  useEffect(() => {
    if (sortedSelected.length === 0) {
      setDraft([]);
      setBaseline([]);
      setMixed(false);
      return;
    }
    const first = canonicalRanges(availabilityMap[sortedSelected[0]] || []);
    const allSame = sortedSelected.every((k) => canonicalRanges(availabilityMap[k] || []) === first);
    const base = allSame ? (availabilityMap[sortedSelected[0]] || []).map((r) => ({ ...r })) : [];
    setDraft(base.map((r) => ({ ...r })));
    setBaseline(base);
    setMixed(!allSame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedSelected.join(","), availabilityMap]);

  function guard(action) {
    if (dirtyRef.current && !window.confirm("Kaydedilmemiş değişiklikler var. Vazgeçilsin mi?")) return;
    action();
  }

  function goToMonth(offset) {
    guard(() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + offset, 1)));
  }

  function goToToday() {
    guard(() => {
      const today = new Date();
      setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
      setSelectedKeys([todayKey]);
      setAnchorKey(todayKey);
    });
  }

  function rangeBetween(aKey, bKey) {
    let a = keyToDate(aKey);
    let b = keyToDate(bKey);
    if (a > b) [a, b] = [b, a];
    const out = [];
    for (let d = new Date(a); d <= b; d = addDays(d, 1)) {
      const k = toDateKey(d);
      if (k >= todayKey && keyInMonth(k, viewDate)) out.push(k);
    }
    return out;
  }

  function handleDayClick(date, e) {
    const key = toDateKey(date);
    if (key < todayKey) return; // past dates are not editable

    guard(() => {
      const isMulti = multiSelect || e.ctrlKey || e.metaKey;
      if (e.shiftKey && anchorKey) {
        setSelectedKeys(rangeBetween(anchorKey, key));
        return;
      }
      if (isMulti) {
        setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
        setAnchorKey(key);
        return;
      }
      setSelectedKeys([key]);
      setAnchorKey(key);
    });
  }

  async function handleSave() {
    if (sortedSelected.length === 0) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await bulkUpdateAvailability({
        dates: sortedSelected,
        ranges: draft.map((r) => ({ start: r.start, end: r.end })),
      });
      await loadAvailability();
      setSaveMsg({ type: "ok", text: "Müsaitlik güncellendi." });
    } catch (err) {
      setSaveMsg({
        type: "err",
        text:
          err.code === "AVAILABILITY_CONFLICT"
            ? "Saat aralıkları çakışıyor."
            : err.message || "Kaydedilemedi.",
      });
    } finally {
      setSaving(false);
    }
  }

  const selectionSummary =
    sortedSelected.length === 0
      ? "Düzenlemek için bir veya birden fazla gün seçin"
      : sortedSelected.length === 1
        ? keyToDate(sortedSelected[0]).toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })
        : `${sortedSelected.length} gün seçildi`;

  const hasSelection = sortedSelected.length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Müsaitlik</h1>
        <button
          type="button"
          onClick={() => setMultiSelect((v) => !v)}
          aria-pressed={multiSelect}
          className={`h-9 px-4 rounded-lg text-sm font-medium border transition ${
            multiSelect
              ? "border-[var(--color-primary)] bg-[var(--color-secondary)] text-[var(--color-primary)]"
              : "border-[var(--color-border)] hover:bg-[var(--color-secondary)]"
          }`}
        >
          Çoklu Seçim {multiSelect ? "açık" : "kapalı"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && (
        <p className="mt-4 text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">Yükleniyor...</p>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
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
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((date, idx) => {
              if (!date) return <div key={idx} />;
              const key = toDateKey(date);
              const isPast = key < todayKey;
              const isSelected = selectedKeys.includes(key);
              const isToday = key === todayKey;
              const { text, tone } = dayCellLabel(availabilityMap[key]);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isPast}
                  onClick={(e) => handleDayClick(date, e)}
                  className={[
                    "min-h-16 rounded-lg border p-1 text-left transition flex flex-col",
                    isPast ? "opacity-40 cursor-not-allowed border-transparent" : "hover:brightness-95",
                    isSelected
                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                      : TONE_STYLES[tone],
                    isToday && !isSelected ? "ring-1 ring-[var(--color-primary)]" : "",
                  ].join(" ")}
                >
                  <span className="text-sm font-semibold">{date.getDate()}</span>
                  <span className={`mt-auto text-[11px] leading-tight ${isSelected ? "text-white/90" : ""}`}>
                    {text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selection editor */}
        <div className="rounded-xl border border-[var(--color-border)] p-4 sm:p-5">
          <p className="text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">Seçili günler</p>
          <h2 className="font-semibold">{selectionSummary}</h2>

          {saveMsg && (
            <p className={`mt-3 text-sm ${saveMsg.type === "ok" ? "text-green-700" : "text-red-600"}`}>
              {saveMsg.text}
            </p>
          )}

          {!hasSelection ? (
            <p className="mt-6 text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
              Takvimden gün seçtiğinizde günlük program burada görünür.
            </p>
          ) : (
            <>
              {mixed && (
                <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">
                  Seçili günlerin mevcut programları farklı. Burada oluşturduğunuz program tüm seçili günlerin yerine
                  uygulanacaktır.
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setDraft([{ start: "09:00", end: "18:00" }])}
                  className="flex-1 h-9 rounded-lg text-sm font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md"
                >
                  Tam Gün Müsait
                </button>
                <button
                  type="button"
                  onClick={() => setDraft([])}
                  className="flex-1 h-9 rounded-lg text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
                >
                  Tüm Günü Kapat
                </button>
              </div>

              <div className="mt-4">
                <AvailabilityTimeline ranges={draft} onChange={setDraft} />
              </div>

              <div className="mt-4 flex gap-2 border-t border-[var(--color-border)] pt-4">
                <button
                  type="button"
                  disabled={!draftDirty || saving}
                  onClick={() => setDraft(baseline.map((r) => ({ ...r })))}
                  className="h-9 px-4 rounded-lg text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="flex-1 h-9 rounded-lg text-sm font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {saving ? "Kaydediliyor..." : "Değişiklikleri Uygula"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
