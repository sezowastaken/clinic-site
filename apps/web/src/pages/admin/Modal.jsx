export default function Modal({ title, onClose, children, widthClassName = "max-w-lg" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full ${widthClassName} bg-[var(--color-bg)] text-[var(--color-text)] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90dvh] overflow-y-auto`}
      >
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="h-8 w-8 rounded-lg hover:bg-[var(--color-secondary)] flex items-center justify-center transition"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
