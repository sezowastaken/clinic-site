import { useRef, useState } from "react";

// Horizontal timeline over the visible window 08:00–20:00 on a 30-minute grid.
const DAY_START = 8 * 60;
const DAY_END = 20 * 60;
const SPAN = DAY_END - DAY_START;
const SNAP = 30;
const MIN_DUR = 30;
const MAX_RANGES = 6;
const EDGE_PX = 8;

const MIN_WIDTH = 640; // scroll the inner track below this width
const HEIGHT = 120;
const TRACK_TOP = 22;
const TRACK_BOTTOM = 8;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const snap = (m) => Math.round(m / SNAP) * SNAP;
const pct = (m) => ((m - DAY_START) / SPAN) * 100;
const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const parse = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function toItems(ranges) {
  return ranges
    .map((r) => ({ start: parse(r.start), end: parse(r.end) }))
    .sort((a, b) => a.start - b.start);
}

function toRanges(items) {
  return [...items]
    .sort((a, b) => a.start - b.start)
    .map((it) => ({ start: fmt(it.start), end: fmt(it.end) }));
}

function freeGap(sorted, point) {
  let lo = DAY_START;
  let hi = DAY_END;
  for (const b of sorted) {
    if (b.end <= point) lo = Math.max(lo, b.end);
    else if (b.start >= point && b.start < hi) hi = b.start;
  }
  return [lo, hi];
}

const splitValid = (block, point) => point - block.start >= MIN_DUR && block.end - point >= MIN_DUR;

export default function AvailabilityTimeline({ ranges, onChange, disabled }) {
  const containerRef = useRef(null);
  const dragRef = useRef(null); // authoritative live gesture; read at commit time
  const suppressClickRef = useRef(false); // swallow the click that follows a drag
  const invalidTimer = useRef(null);
  const [drag, setDrag] = useState(null); // mirror of dragRef, drives the preview render
  const [hover, setHover] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [coarse] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches
  );

  const items = drag?.preview ?? toItems(ranges);

  // Convert a pointer event to a (fractional) minute on the axis.
  function eventMinute(e) {
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || 1;
    const x = clamp(e.clientX - rect.left, 0, w);
    return DAY_START + (x / w) * SPAN;
  }

  // Edge grab zone expressed in minutes, so it stays ~EDGE_PX wide.
  function edgeToleranceMin() {
    const w = containerRef.current?.getBoundingClientRect().width || MIN_WIDTH;
    return (EDGE_PX / w) * SPAN;
  }

  function hitTest(minute, list) {
    const tol = edgeToleranceMin();
    for (let i = 0; i < list.length; i++) {
      const { start, end } = list[i];
      if (minute >= start && minute <= end) {
        if (minute <= start + tol) return { index: i, zone: "start" };
        if (minute >= end - tol) return { index: i, zone: "end" };
        return { index: i, zone: "body" };
      }
    }
    return null;
  }

  function commit(list) {
    onChange(toRanges(list));
  }

  function flashInvalid() {
    setInvalid(true);
    clearTimeout(invalidTimer.current);
    invalidTimer.current = setTimeout(() => setInvalid(false), 900);
  }

  function doSplit(index, minute) {
    const list = toItems(ranges);
    const block = list[index];
    if (!block) return;
    const p = clamp(snap(minute), block.start, block.end);
    if (!splitValid(block, p)) {
      flashInvalid();
      return;
    }
    const next = list.filter((_, i) => i !== index);
    next.push({ start: block.start, end: p }, { start: p, end: block.end });
    commit(next);
  }

  function setGesture(next) {
    dragRef.current = next;
    setDrag(next);
  }

  function onPointerDown(e) {
    if (disabled) return;
    const list = toItems(ranges);
    const minute = eventMinute(e);
    const hit = hitTest(minute, list);
    containerRef.current.setPointerCapture?.(e.pointerId);
    setHover(null);

    if (hit && (hit.zone === "start" || hit.zone === "end")) {
      setGesture({ mode: "resize", edge: hit.zone, index: hit.index, orig: list, downMin: minute, moved: false, preview: list });
    } else if (hit && hit.zone === "body") {
      setGesture({ mode: "split", index: hit.index, orig: list, downMin: minute, moved: false, preview: list });
    } else if (!hit) {
      if (list.length >= MAX_RANGES) return;
      const anchor = snap(clamp(minute, DAY_START, DAY_END));
      setGesture({ mode: "create", anchor, orig: list, downMin: minute, moved: false, preview: list });
    }
  }

  function onPointerMove(e) {
    const d = dragRef.current;
    const minute = eventMinute(e);

    if (!d) {
      const hit = hitTest(minute, toItems(ranges));
      if (hit && (hit.zone === "start" || hit.zone === "end")) setHover({ type: "edge", index: hit.index, edge: hit.zone });
      else if (hit && hit.zone === "body") setHover({ type: "split", index: hit.index, min: clamp(snap(minute), DAY_START, DAY_END) });
      else setHover(null);
      return;
    }

    // A real change is a new 30-minute slot.
    const moved = d.moved || snap(minute) !== snap(d.downMin);
    const sorted = d.orig;
    const cur = snap(clamp(minute, DAY_START, DAY_END));
    let preview = d.orig;

    if (d.mode === "create") {
      const [lo, hi] = freeGap(sorted, d.anchor);
      let start = clamp(Math.min(d.anchor, cur), lo, hi - MIN_DUR);
      let end = clamp(Math.max(d.anchor, cur), lo + MIN_DUR, hi);
      if (end - start < MIN_DUR) end = clamp(start + MIN_DUR, lo + MIN_DUR, hi);
      preview = [...sorted, { start, end }];
    } else if (d.mode === "resize") {
      const block = sorted[d.index];
      const prev = sorted[d.index - 1];
      const next = sorted[d.index + 1];
      if (d.edge === "start") {
        const ns = clamp(cur, prev ? prev.end : DAY_START, block.end - MIN_DUR);
        preview = sorted.map((b, i) => (i === d.index ? { start: ns, end: block.end } : b));
      } else {
        const ne = clamp(cur, block.start + MIN_DUR, next ? next.start : DAY_END);
        preview = sorted.map((b, i) => (i === d.index ? { start: block.start, end: ne } : b));
      }
    }

    setGesture({ ...d, moved, preview });
  }

  function endGesture(e, doCommit) {
    const d = dragRef.current;
    dragRef.current = null;
    try {
      containerRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {
      /* pointer may already be released */
    }
    if (d) {
      if (doCommit) {
        if (d.mode === "split" && !d.moved) doSplit(d.index, d.downMin);
        else if ((d.mode === "create" || d.mode === "resize") && d.moved) commit(d.preview);
      }
      if (d.moved) suppressClickRef.current = true;
    }
    setDrag(null);
  }

  function onClickCapture(e) {
    // Prevent the synthetic click after a drag from reaching child handlers (e.g. split/delete).
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.stopPropagation();
    }
  }

  function removeBlock(index) {
    commit(toItems(ranges).filter((_, i) => i !== index));
  }

  const cursor = disabled
    ? "default"
    : drag?.mode === "resize" || hover?.type === "edge"
      ? "ew-resize"
      : hover?.type === "split"
        ? "crosshair"
        : "default";

  const hourCount = SPAN / 60;
  const lineColor = "color-mix(in srgb, var(--color-text) 14%, transparent)";
  const halfLineColor = "color-mix(in srgb, var(--color-text) 7%, transparent)";

  return (
    <div>
      <div className="overflow-x-auto">
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endGesture(e, true)}
          onPointerCancel={(e) => endGesture(e, false)}
          onLostPointerCapture={(e) => dragRef.current && endGesture(e, false)}
          onClickCapture={onClickCapture}
          onPointerLeave={() => setHover(null)}
          className="relative select-none rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-bg))] shadow-inner"
          style={{ cursor, touchAction: "none", width: "100%", minWidth: MIN_WIDTH, height: HEIGHT }}
        >
          {/* Hour lines + labels */}
          {Array.from({ length: hourCount + 1 }, (_, i) => {
            const m = DAY_START + i * 60;
            const isLast = m === DAY_END;
            return (
              <div key={m} className="absolute top-0 bottom-0" style={{ left: `${pct(m)}%` }}>
                <span
                  className="absolute top-0.5 text-[11px] text-[color-mix(in_srgb,var(--color-text)_50%,transparent)]"
                  style={isLast ? { right: 2 } : { left: 2 }}
                >
                  {fmt(m)}
                </span>
                <span className="absolute top-5 bottom-0" style={{ borderLeft: `1px solid ${lineColor}` }} />
              </div>
            );
          })}
          {/* Half-hour lines */}
          {Array.from({ length: hourCount }, (_, i) => {
            const m = DAY_START + i * 60 + 30;
            return (
              <div
                key={m}
                className="absolute top-5 bottom-0"
                style={{ left: `${pct(m)}%`, borderLeft: `1px solid ${halfLineColor}` }}
              />
            );
          })}

          {/* Split preview line */}
          {!drag && hover?.type === "split" && !coarse && (() => {
            const block = items[hover.index];
            if (!block) return null;
            const ok = splitValid(block, hover.min);
            const color = ok ? "var(--color-primary)" : "#dc2626";
            return (
              <div
                className="pointer-events-none absolute z-10"
                style={{ left: `${pct(hover.min)}%`, top: TRACK_TOP, bottom: TRACK_BOTTOM, borderLeft: `2px dashed ${color}` }}
              />
            );
          })()}

          {/* Blocks */}
          {items.map((block, i) => {
            const activeStart = hover?.type === "edge" && hover.index === i && hover.edge === "start";
            const activeEnd = hover?.type === "edge" && hover.index === i && hover.edge === "end";
            return (
              <div
                key={i}
                className="group absolute rounded-md border border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] text-[var(--color-primary)] shadow-sm transition-shadow hover:shadow-md"
                style={{ left: `${pct(block.start)}%`, width: `${pct(block.end) - pct(block.start)}%`, top: TRACK_TOP, bottom: TRACK_BOTTOM }}
              >
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-semibold">
                  {fmt(block.start)}–{fmt(block.end)}
                </span>

                {/* Resize handles */}
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-md transition-colors"
                  style={{ background: activeStart || coarse ? "color-mix(in srgb, var(--color-primary) 45%, transparent)" : "transparent" }}
                />
                <span
                  className="pointer-events-none absolute inset-y-0 right-0 w-2 rounded-r-md transition-colors"
                  style={{ background: activeEnd || coarse ? "color-mix(in srgb, var(--color-primary) 45%, transparent)" : "transparent" }}
                />

                {/* Delete button */}
                <button
                  type="button"
                  aria-label="Müsaitlik aralığını sil"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => removeBlock(i)}
                  className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-red-600 shadow ring-1 ring-red-200 transition ${
                    coarse ? "opacity-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
                  } hover:bg-red-50`}
                >
                  <span className="text-sm leading-none">×</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {invalid && (
        <p className="mt-1.5 text-xs font-medium text-red-600">Bölme noktası çok yakın (en az 30 dakika).</p>
      )}
      <p className="mt-1.5 text-[11px] text-[color-mix(in_srgb,var(--color-text)_55%,transparent)]">
        Boş alanı sürükleyerek aralık ekleyin. Kenarlardan boyutlandırın, ortasına tıklayarak bölün, × ile silin.
      </p>
    </div>
  );
}
