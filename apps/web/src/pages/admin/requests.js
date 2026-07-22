import { STATUS_LABELS, fetchAppointments, updateAppointment } from "./appointments";

export const REQUEST_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function mapRequestFromApi(item) {
  const requestedDate = new Date(item.startsAt);

  return {
    id: item.id,
    patient: item.patientName,
    phone: item.phone,
    email: item.email || "",
    service: item.service.name,
    serviceSlug: item.service.slug,
    requestedDate,
    requestedTime: formatTime(requestedDate),
    submittedAt: new Date(item.createdAt),
    patientNote: item.patientNote || "",
    internalNote: item.internalNote || "",
    status: item.status,
    statusLabel: STATUS_LABELS[item.status] ?? item.status,
  };
}

export async function fetchPendingWebsiteRequests() {
  const data = await fetchAppointments({ source: "website", status: "pending" });
  return { ...data, items: data.items.map(mapRequestFromApi) };
}

export async function fetchProcessedWebsiteRequests() {
  const data = await fetchAppointments({ source: "website" });
  const items = data.items.map(mapRequestFromApi).filter((r) => r.status === "confirmed" || r.status === "rejected");
  return { ...data, items, total: items.length };
}

export function approveRequest(id) {
  return updateAppointment(id, { status: "confirmed" });
}

export function rejectRequest(id) {
  return updateAppointment(id, { status: "rejected" });
}

export function editAndApproveRequest(id, updates) {
  return updateAppointment(id, { ...updates, status: "confirmed" });
}
