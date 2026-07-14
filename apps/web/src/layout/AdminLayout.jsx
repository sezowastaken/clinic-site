import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { doctor } from "../content/doctor";
import { createAppointmentId, createSeedAppointments } from "../pages/admin/appointments";
import AppointmentFormModal from "../pages/admin/AppointmentFormModal";
import { createSeedRequests } from "../pages/admin/requests";
import { useAuth } from "../auth/AuthContext.jsx";

const NAV_ITEMS = [
  { label: "Özet", to: "/admin", enabled: true },
  { label: "Takvim", to: "/admin/takvim", enabled: true },
  { label: "Site İstekleri", to: "/admin/istekler", enabled: true },
  { label: "Müsaitlik", to: "/admin/musaitlik", enabled: true },
];

function SidebarNav({ onNavigate, pendingRequestsCount }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) =>
        item.enabled ? (
          <NavLink
            key={item.label}
            to={item.to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between",
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "hover:bg-[var(--color-secondary)]",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <span>{item.label}</span>
                {item.label === "Site İstekleri" && pendingRequestsCount > 0 && (
                  <span
                    className={[
                      "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold",
                      isActive ? "bg-white/90 text-[var(--color-primary)]" : "bg-[var(--color-primary)] text-white",
                    ].join(" ")}
                  >
                    {pendingRequestsCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ) : (
          <span
            key={item.label}
            aria-disabled="true"
            title="Yakında"
            className="px-3 py-2 rounded-lg text-sm font-medium text-[color-mix(in srgb, var(--color-text) 40%, transparent)] cursor-not-allowed"
          >
            {item.label}
          </span>
        )
      )}
    </nav>
  );
}

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appointments, setAppointments] = useState(() => createSeedAppointments());
  const [modalState, setModalState] = useState({ open: false, initialDate: null, initialTime: null });
  const [requests, setRequests] = useState(() => createSeedRequests());
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function openNewAppointmentModal(prefill = {}) {
    setModalState({ open: true, initialDate: prefill.date ?? null, initialTime: prefill.time ?? null });
  }

  function closeNewAppointmentModal() {
    setModalState({ open: false, initialDate: null, initialTime: null });
  }

  function addAppointment(data) {
    setAppointments((prev) => [...prev, { id: createAppointmentId(), ...data }]);
    closeNewAppointmentModal();
  }

  function approveRequest(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Onaylandı" } : r)));
  }

  function rejectRequest(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Reddedildi" } : r)));
  }

  function updateAndApproveRequest(id, updates) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates, status: "Onaylandı" } : r)));
  }

  const pendingRequestsCount = requests.filter((r) => r.status === "Bekliyor").length;

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-dvh flex bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col border-r border-[var(--color-border)] p-4">
        <div className="font-semibold mb-6">{doctor.name}</div>
        <SidebarNav pendingRequestsCount={pendingRequestsCount} />
        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto h-9 px-3 rounded-lg text-sm font-medium text-left text-red-700 hover:bg-red-50 transition"
        >
          Çıkış Yap
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-[var(--color-border)] px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menüyü aç"
              aria-expanded={mobileOpen}
              className="md:hidden h-9 w-9 shrink-0 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-secondary)] transition"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)] capitalize truncate">
              {today}
            </span>
          </div>

          <button
            type="button"
            onClick={() => openNewAppointmentModal()}
            className="h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md shrink-0"
          >
            + Yeni Randevu
          </button>
        </header>

        {/* Mobile nav panel */}
        {mobileOpen && (
          <div className="md:hidden border-b border-[var(--color-border)] p-4">
            <div className="font-semibold mb-3">{doctor.name}</div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} pendingRequestsCount={pendingRequestsCount} />
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 h-9 px-3 w-full rounded-lg text-sm font-medium text-left text-red-700 hover:bg-red-50 transition"
            >
              Çıkış Yap
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">
          <Outlet
            context={{
              appointments,
              openNewAppointmentModal,
              requests,
              approveRequest,
              rejectRequest,
              updateAndApproveRequest,
            }}
          />
        </main>
      </div>

      <AppointmentFormModal
        open={modalState.open}
        initialDate={modalState.initialDate}
        initialTime={modalState.initialTime}
        onClose={closeNewAppointmentModal}
        onSubmit={addAppointment}
      />
    </div>
  );
}
