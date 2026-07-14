import { addDays, toDateKey, startMinutes } from "./appointments";

export const REASONS = ["Ameliyat", "İzin", "Toplantı", "Klinik kapalı"];

const WORK_START_MIN = startMinutes("09:00");
const WORK_END_MIN = startMinutes("18:00");

let nextRangeId = 1;
export function createRangeId() {
  return `range-${nextRangeId++}`;
}

export function buildMonthGrid(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function mergeRanges(ranges) {
  const sorted = [...ranges].sort((a, b) => startMinutes(a.start) - startMinutes(b.start));
  const merged = [];
  for (const r of sorted) {
    const last = merged[merged.length - 1];
    if (last && startMinutes(r.start) <= startMinutes(last.end)) {
      if (startMinutes(r.end) > startMinutes(last.end)) last.end = r.end;
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}

/** A day is unavailable by default unless it has an entry with at least one range. */
export function getDayStatus(entry) {
  if (!entry || entry.ranges.length === 0) return "unavailable";
  const merged = mergeRanges(entry.ranges);
  const coversFullDay = merged.some(
    (r) => startMinutes(r.start) <= WORK_START_MIN && startMinutes(r.end) >= WORK_END_MIN
  );
  return coversFullDay ? "full" : "partial";
}

export function validateNewRange(existingRanges, start, end) {
  if (!start || !end) return "Başlangıç ve bitiş saati gereklidir.";
  if (startMinutes(end) <= startMinutes(start)) return "Bitiş saati başlangıç saatinden sonra olmalıdır.";
  const overlaps = existingRanges.some(
    (r) => startMinutes(start) < startMinutes(r.end) && startMinutes(end) > startMinutes(r.start)
  );
  if (overlaps) return "Bu saat aralığı mevcut bir aralıkla çakışıyor.";
  return null;
}

export function cloneRanges(ranges) {
  return ranges.map((r) => ({ ...r, id: createRangeId() }));
}

/** Mock availability seed relative to today; days without an entry are unavailable by default. */
export function createSeedAvailability() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const map = {};

  map[toDateKey(addDays(today, 1))] = {
    ranges: [{ id: createRangeId(), start: "09:00", end: "18:00" }],
    reason: "",
  };
  map[toDateKey(addDays(today, 2))] = {
    ranges: [
      { id: createRangeId(), start: "10:00", end: "13:00" },
      { id: createRangeId(), start: "15:00", end: "18:00" },
    ],
    reason: "",
  };
  map[toDateKey(addDays(today, 3))] = {
    ranges: [],
    reason: "Ameliyat",
  };
  map[toDateKey(addDays(today, 5))] = {
    ranges: [{ id: createRangeId(), start: "09:00", end: "13:00" }],
    reason: "",
  };

  return map;
}
