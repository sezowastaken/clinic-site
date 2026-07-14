import { services } from "../../content/services";

export const REQUEST_STATUSES = ["Bekliyor", "Onaylandı", "Reddedildi"];

export const REQUEST_STATUS_STYLES = {
  Bekliyor: "bg-amber-100 text-amber-800",
  Onaylandı: "bg-green-100 text-green-800",
  Reddedildi: "bg-red-100 text-red-700",
};

let nextRequestId = 1;
export function createRequestId() {
  return `req-${nextRequestId++}`;
}

function serviceTitle(slug) {
  return services.find((s) => s.slug === slug)?.title ?? slug;
}

function daysFromNow(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

/** Mock website appointment requests, generated relative to today. */
export function createSeedRequests() {
  return [
    {
      id: createRequestId(),
      patient: "Fatma Şahin",
      phone: "0538 111 22 33",
      email: "fatma.sahin@example.com",
      service: serviceTitle("tummy-tuck"),
      requestedDate: daysFromNow(4),
      requestedTime: "10:00",
      submittedAt: daysFromNow(-1),
      patientNote: "Yaz aylarında uygun olabilirim.",
      internalNote: "",
      status: "Bekliyor",
    },
    {
      id: createRequestId(),
      patient: "Can Öztürk",
      phone: "0539 222 33 44",
      email: "",
      service: serviceTitle("blepharoplasty"),
      requestedDate: daysFromNow(5),
      requestedTime: "15:30",
      submittedAt: daysFromNow(-1),
      patientNote: "",
      internalNote: "",
      status: "Bekliyor",
    },
    {
      id: createRequestId(),
      patient: "Deniz Aydın",
      phone: "0540 333 44 55",
      email: "deniz.aydin@example.com",
      service: serviceTitle("rhinoplasty"),
      requestedDate: daysFromNow(6),
      requestedTime: "11:00",
      submittedAt: daysFromNow(-2),
      patientNote: "Daha önce danışma yapmıştım.",
      internalNote: "",
      status: "Bekliyor",
    },
    {
      id: createRequestId(),
      patient: "Selin Kurt",
      phone: "0541 444 55 66",
      email: "",
      service: serviceTitle("facelift"),
      requestedDate: daysFromNow(2),
      requestedTime: "09:30",
      submittedAt: daysFromNow(-3),
      patientNote: "",
      internalNote: "Telefonla teyit edildi.",
      status: "Onaylandı",
    },
    {
      id: createRequestId(),
      patient: "Burak Yıldız",
      phone: "0542 555 66 77",
      email: "",
      service: serviceTitle("liposuction"),
      requestedDate: daysFromNow(3),
      requestedTime: "13:30",
      submittedAt: daysFromNow(-4),
      patientNote: "Fiyat bilgisi istiyor.",
      internalNote: "Bütçe uygun değil, hasta vazgeçti.",
      status: "Reddedildi",
    },
  ];
}
