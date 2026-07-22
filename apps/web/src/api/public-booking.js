async function request(path, options = {}) {
  const res = await fetch(path, {
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

export function fetchAvailability({ serviceSlug, dateFrom, dateTo }) {
  const query = new URLSearchParams({ serviceSlug, dateFrom, dateTo });
  return request(`/api/public/availability?${query.toString()}`);
}

export function submitAppointmentRequest(payload) {
  return request("/api/public/appointment-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
