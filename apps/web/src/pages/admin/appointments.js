export const STATUS_LABELS = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal",
  rejected: "Reddedildi",
  no_show: "Gelmedi",
};

export const SOURCE_LABELS = {
  website: "Web Sitesi",
  phone: "Telefon",
  whatsapp: "WhatsApp",
  email: "E-posta",
  instagram: "Instagram",
  referral: "Tanıdık / Referans",
  other: "Diğer",
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

export const SOURCE_OPTIONS = Object.entries(SOURCE_LABELS)
  .filter(([value]) => value !== "website")
  .map(([value, label]) => ({ value, label }));

export const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-[var(--color-secondary)] text-[var(--color-primary)]",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  no_show: "bg-gray-200 text-gray-700",
};

export function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayIndex = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dayIndex);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
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

export function fetchAppointments(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const qs = query.toString();
  return request(`/api/admin/appointments${qs ? `?${qs}` : ""}`);
}

export function fetchAppointmentById(id) {
  return request(`/api/admin/appointments/${id}`);
}

export function createAppointment(payload) {
  return request("/api/admin/appointments", { method: "POST", body: JSON.stringify(payload) });
}

export function updateAppointment(id, payload) {
  return request(`/api/admin/appointments/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function mapAppointmentFromApi(item) {
  const start = new Date(item.startsAt);
  const end = new Date(item.endsAt);
  const duration = Math.round((end - start) / 60000);

  return {
    id: item.id,
    patient: item.patientName,
    phone: item.phone,
    email: item.email || "",
    service: item.service.name,
    serviceSlug: item.service.slug,
    date: start,
    time: formatTime(start),
    duration,
    status: item.status,
    statusLabel: STATUS_LABELS[item.status] ?? item.status,
    source: item.source,
    sourceLabel: SOURCE_LABELS[item.source] ?? item.source,
    patientNote: item.patientNote || "",
    internalNote: item.internalNote || "",
    startsAt: item.startsAt,
  };
}
