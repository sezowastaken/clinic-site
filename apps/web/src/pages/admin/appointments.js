import { services } from "../../content/services";

export const STATUSES = ["Bekliyor", "Onaylandı", "Tamamlandı", "İptal", "Gelmedi"];

export const SOURCES = ["Telefon", "WhatsApp", "E-posta", "Instagram", "Tanıdık / Referans", "Diğer"];

export const STATUS_STYLES = {
  Bekliyor: "bg-amber-100 text-amber-800",
  Onaylandı: "bg-[var(--color-secondary)] text-[var(--color-primary)]",
  Tamamlandı: "bg-green-100 text-green-800",
  İptal: "bg-red-100 text-red-700",
  Gelmedi: "bg-gray-200 text-gray-700",
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

let nextId = 1;
export function createAppointmentId() {
  return `appt-${nextId++}`;
}

function serviceTitle(slug) {
  return services.find((s) => s.slug === slug)?.title ?? slug;
}

/** Mock appointments generated relative to today so they always land in the default week view. */
export function createSeedAppointments() {
  const weekStart = getWeekStart(new Date());

  return [
    {
      id: createAppointmentId(),
      patient: "Elif Demir",
      phone: "0532 111 22 33",
      email: "",
      service: serviceTitle("rhinoplasty"),
      date: addDays(weekStart, 0),
      time: "09:00",
      duration: 60,
      status: "Onaylandı",
      source: "Telefon",
      patientNote: "",
      internalNote: "İlk muayene.",
    },
    {
      id: createAppointmentId(),
      patient: "Mehmet Kaya",
      phone: "0533 222 33 44",
      email: "mehmet.kaya@example.com",
      service: serviceTitle("liposuction"),
      date: addDays(weekStart, 1),
      time: "11:30",
      duration: 45,
      status: "Bekliyor",
      source: "WhatsApp",
      patientNote: "Hafta sonu uygun.",
      internalNote: "",
    },
    {
      id: createAppointmentId(),
      patient: "Ayşe Yılmaz",
      phone: "0534 333 44 55",
      email: "",
      service: serviceTitle("breast-augmentation"),
      date: addDays(weekStart, 1),
      time: "14:30",
      duration: 60,
      status: "Onaylandı",
      source: "Instagram",
      patientNote: "",
      internalNote: "",
    },
    {
      id: createAppointmentId(),
      patient: "Deniz Aydın",
      phone: "0537 666 77 88",
      email: "",
      service: serviceTitle("tummy-tuck"),
      date: addDays(weekStart, 2),
      time: "13:00",
      duration: 60,
      status: "Gelmedi",
      source: "Diğer",
      patientNote: "",
      internalNote: "",
    },
    {
      id: createAppointmentId(),
      patient: "Zeynep Arslan",
      phone: "0535 444 55 66",
      email: "",
      service: serviceTitle("facelift"),
      date: addDays(weekStart, 3),
      time: "16:00",
      duration: 90,
      status: "Tamamlandı",
      source: "Tanıdık / Referans",
      patientNote: "",
      internalNote: "Kontrol randevusu planlanacak.",
    },
    {
      id: createAppointmentId(),
      patient: "Can Öztürk",
      phone: "0536 555 66 77",
      email: "",
      service: serviceTitle("blepharoplasty"),
      date: addDays(weekStart, 4),
      time: "10:00",
      duration: 45,
      status: "İptal",
      source: "E-posta",
      patientNote: "",
      internalNote: "Hasta iptal etti.",
    },
  ];
}
