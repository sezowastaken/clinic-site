/* Shared layout primitives for the public site. */

export function Container({ className = "", children }) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({ children, className = "" }) {
  return <span className={`label-caps text-burgundy ${className}`}>{children}</span>;
}
