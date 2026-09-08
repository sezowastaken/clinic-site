/* Tek stroke genişliğinde, tutarlı ve sade çizgi ikon seti. */
export function CategoryIcon({ name, className = "h-6 w-6" }) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
  };
  if (name === "face")
    return (
      <svg {...common}>
        <path d="M8 4.5c-1.6 1-2.4 2.8-2.3 5.2.1 1 0 1.4-.7 2 .7.4.8.7.9 1.5.2 1.7 1.1 3.4 2.6 4.3.6.4.9.8.9 1.5V21" />
        <path d="M8 8.2c1.6-2.4 6.3-2.7 7.6.3.9 2 .5 4.4-.5 6.2-.8 1.4-1.9 2.3-1.9 3.3v1.2" />
      </svg>
    );
  if (name === "breast")
    return (
      <svg {...common}>
        <path d="M12 4c1.2 2.6 2.6 3.6 4.6 3.7-.5 4.8-2.8 8.8-4.6 8.8s-4.1-4-4.6-8.8c2 0 3.4-1.1 4.6-3.7Z" />
      </svg>
    );
  if (name === "body")
    return (
      <svg {...common}>
        <circle cx="12" cy="4.5" r="2.2" />
        <path d="M12 7.2v6.3M8.3 21l3.2-6.3M15.7 21l-3.2-6.3M8.6 10.5h6.8" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M12 3.5 20.5 8v8L12 20.5 3.5 16V8L12 3.5Z" />
      <path d="M12 3.5V20.5M3.5 8l8.5 4.5M20.5 8 12 12.5" />
    </svg>
  );
}
