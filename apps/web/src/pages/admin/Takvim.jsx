import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { addDays, getWeekStart, startMinutes, toDateKey, STATUS_STYLES } from "./appointments";
import AppointmentDetailModal from "./AppointmentDetailModal";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const WORK_START_MIN = 9 * 60;
const WORK_END_MIN = 18 * 60;
const HOUR_HEIGHT = 64; // px
const DAY_HEIGHT = ((WORK_END_MIN - WORK_START_MIN) / 60) * HOUR_HEIGHT;
const HOURS = Array.from(
  { length: (WORK_END_MIN - WORK_START_MIN) / 60 + 1 },
  (_, i) => WORK_START_MIN / 60 + i
);
const SLOT_MINUTES = 30;
const SLOTS_PER_DAY = (WORK_END_MIN - WORK_START_MIN) / SLOT_MINUTES;

function formatSlotTime(minutesFromStart) {
  const total = WORK_START_MIN + minutesFromStart;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function Takvim() {
  const { appointments, appointmentsLoading, appointmentsError, openNewAppointmentModal } = useOutletContext();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [detailAppointmentId, setDetailAppointmentId] = useState(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  function goToWeek(offset) {
    setWeekStart((d) => addDays(d, offset * 7));
  }

  function goToToday() {
    setWeekStart(getWeekStart(new Date()));
    setSelectedDay(new Date());
  }

  function appointmentsForDay(day) {
    return appointments
      .filter((a) => toDateKey(a.date) === toDateKey(day))
      .sort((a, b) => startMinutes(a.time) - startMinutes(b.time));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Takvim</h1>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => goToWeek(-1)}
            className="h-9 px-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
          >
            ‹ Önceki Hafta
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="h-9 px-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
          >
            Bugün
          </button>
          <button
            type="button"
            onClick={() => goToWeek(1)}
            className="h-9 px-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition"
          >
            Sonraki Hafta ›
          </button>
        </div>
      </div>

      {appointmentsError && <p className="mt-4 text-sm text-red-600">{appointmentsError}</p>}
      {appointmentsLoading && (
        <p className="mt-4 text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
          Randevular yükleniyor...
        </p>
      )}

      {/* Desktop weekly grid */}
      <div className="hidden md:block mt-6 border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          <div className="border-b border-[var(--color-border)]" />
          {days.map((day) => (
            <div key={toDateKey(day)} className="border-b border-l border-[var(--color-border)] px-2 py-2 text-center">
              <p className="text-xs text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
                {WEEKDAYS[(day.getDay() + 6) % 7]}
              </p>
              <p
                className={`text-sm font-semibold ${
                  toDateKey(day) === toDateKey(new Date()) ? "text-[var(--color-primary)]" : ""
                }`}
              >
                {day.getDate()} {day.toLocaleDateString("tr-TR", { month: "short" })}
              </p>
            </div>
          ))}
        </div>

        <div className="grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          {/* Hour labels */}
          <div className="relative" style={{ height: DAY_HEIGHT }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute -translate-y-2 right-2 text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]"
                style={{ top: (h - HOURS[0]) * HOUR_HEIGHT }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {days.map((day) => (
            <div key={toDateKey(day)} className="relative border-l border-[var(--color-border)]" style={{ height: DAY_HEIGHT }}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-[var(--color-border)]"
                  style={{ top: (h - HOURS[0]) * HOUR_HEIGHT }}
                />
              ))}

              {Array.from({ length: SLOTS_PER_DAY }, (_, i) => i).map((slotIdx) => (
                <button
                  key={slotIdx}
                  type="button"
                  onClick={() => openNewAppointmentModal({ date: day, time: formatSlotTime(slotIdx * SLOT_MINUTES) })}
                  className="absolute inset-x-0 hover:bg-[var(--color-secondary)]/60 transition"
                  style={{ top: slotIdx * (HOUR_HEIGHT / 2), height: HOUR_HEIGHT / 2 }}
                  aria-label={`${formatSlotTime(slotIdx * SLOT_MINUTES)} için randevu ekle`}
                />
              ))}

              {appointmentsForDay(day).map((a) => {
                const top = (startMinutes(a.time) - WORK_START_MIN) * (HOUR_HEIGHT / 60);
                const height = Math.max(a.duration * (HOUR_HEIGHT / 60), 28);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setDetailAppointmentId(a.id)}
                    className={`absolute inset-x-1 rounded-md px-2 py-1 text-left text-xs shadow-sm overflow-hidden ${STATUS_STYLES[a.status]}`}
                    style={{ top, height }}
                  >
                    <p className="font-semibold truncate">
                      {a.time} · {a.patient}
                    </p>
                    <p className="truncate">{a.service}</p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: selected-day appointment list */}
      <div className="md:hidden mt-6">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {days.map((day) => {
            const isSelected = toDateKey(day) === toDateKey(selectedDay);
            return (
              <button
                key={toDateKey(day)}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-lg text-sm transition ${
                  isSelected ? "bg-[var(--color-primary)] text-white" : "hover:bg-[var(--color-secondary)]"
                }`}
              >
                <span className="text-xs">{WEEKDAYS[(day.getDay() + 6) % 7]}</span>
                <span className="font-semibold">{day.getDate()}</span>
              </button>
            );
          })}
        </div>

        <ul className="mt-3 space-y-2">
          {appointmentsForDay(selectedDay).length === 0 && (
            <li className="text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)] py-4 text-center">
              Bu gün için randevu yok.
            </li>
          )}
          {appointmentsForDay(selectedDay).map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setDetailAppointmentId(a.id)}
                className="w-full text-left rounded-xl border border-[var(--color-border)] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">
                    {a.time} · {a.patient}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_STYLES[a.status]}`}>
                    {a.statusLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">{a.service}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <AppointmentDetailModal appointmentId={detailAppointmentId} onClose={() => setDetailAppointmentId(null)} />
    </div>
  );
}
