import { toDateKey } from "./appointments";

export function buildMonthGrid(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function mapWindowFromApi(item) {
  const start = new Date(item.startsAt);
  const end = new Date(item.endsAt);
  return {
    dateKey: toDateKey(start),
    start: formatTime(start),
    end: formatTime(end),
  };
}

/** A canonical string for a day's ranges, used to compare schedules across dates. */
export function canonicalRanges(ranges) {
  return [...ranges]
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((r) => `${r.start}-${r.end}`)
    .join("|");
}

/** Short label + tone for a calendar day cell. Text always conveys the status (never color alone). */
export function dayCellLabel(ranges) {
  if (!ranges || ranges.length === 0) return { text: "Kapalı", tone: "closed" };
  if (ranges.length === 1) {
    const r = ranges[0];
    if (r.start === "09:00" && r.end === "18:00") return { text: "Tam gün", tone: "full" };
    return { text: `${r.start}–${r.end}`, tone: "partial" };
  }
  return { text: `${ranges.length} zaman aralığı`, tone: "partial" };
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

export function bulkUpdateAvailability({ dates, ranges }) {
  return request("/api/admin/availability/bulk", {
    method: "PUT",
    body: JSON.stringify({ dates, ranges }),
  });
}
