import { toDateKey, startMinutes } from "./appointments";

export const REASONS = ["Ameliyat", "İzin", "Toplantı", "Klinik kapalı"];

const WORK_START_MIN = startMinutes("09:00");
const WORK_END_MIN = startMinutes("18:00");

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

export function combineDateAndTime(date, time) {
  const [hour, minute] = time.split(":").map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute);
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function mapWindowFromApi(item) {
  const start = new Date(item.startsAt);
  const end = new Date(item.endsAt);
  return {
    id: item.id,
    dateKey: toDateKey(start),
    start: formatTime(start),
    end: formatTime(end),
    reason: item.reason || "",
  };
}

async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const error = new Error(body?.error?.message || "İstek başarısız oldu.");
    error.code = body?.error?.code;
    error.status = res.status;
    throw error;
  }

  return body;
}

export function fetchAvailability(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const qs = query.toString();
  return request(`/api/admin/availability${qs ? `?${qs}` : ""}`);
}

export function createAvailability(payload) {
  return request("/api/admin/availability", { method: "POST", body: JSON.stringify(payload) });
}

export function updateAvailability(id, payload) {
  return request(`/api/admin/availability/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteAvailability(id) {
  return request(`/api/admin/availability/${id}`, { method: "DELETE" });
}
