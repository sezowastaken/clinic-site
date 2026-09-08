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

export function fetchMessages(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const qs = query.toString();
  return request(`/api/admin/messages${qs ? `?${qs}` : ""}`);
}

export function markMessageRead(id, isRead = true) {
  return request(`/api/admin/messages/${id}`, { method: "PATCH", body: JSON.stringify({ isRead }) });
}

export function mapMessageFromApi(item) {
  return {
    id: item.id,
    name: item.name,
    phone: item.phone,
    email: item.email || "",
    message: item.message || "",
    isRead: item.isRead,
    createdAt: new Date(item.createdAt),
  };
}
