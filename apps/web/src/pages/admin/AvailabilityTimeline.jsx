import { useRef, useState } from "react";

// Visible window 08:00–20:00 on a 30-minute grid.
const DAY_START = 8 * 60;
const DAY_END = 20 * 60;
const SNAP = 30;
const MIN_DUR = 30;
const MAX_RANGES = 6;
const SLOT_PX = 28; // height of one 30-minute slot
const TOTAL_PX = ((DAY_END - DAY_START) / SNAP) * SLOT_PX;
const HANDLE_PX = 9;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const snap = (m) => Math.round(m / SNAP) * SNAP;
const minToPx = (m) => ((m - DAY_START) / SNAP) * SLOT_PX;
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

/** Lowest free minute below `point` and highest free minute above it, given sorted blocks. */
function freeGap(sorted, point) {
  let lo = DAY_START;
  let hi = DAY_END;
  for (const b of sorted) {
    if (b.end <= point) lo = Math.max(lo, b.end);
    else if (b.start >= point && b.start < hi) hi = b.start;
  }
  return [lo, hi];
}

export default function AvailabilityTimeline({ ranges, onChange, disabled }) {
  const containerRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [selected, setSelected] = useState(null); // index of block showing actions
  const [splitArmed, setSplitArmed] = useState(null); // index awaiting split click

  const items = drag?.preview ?? toItems(ranges);

  function localY(e) {
    const rect = containerRef.current.getBoundingClientRect();
    return clamp(e.clientY - rect.top, 0, TOTAL_PX);
  }

  function hitTest(y, list) {
    for (let i = 0; i < list.length; i++) {
      const top = minToPx(list[i].start);
      const bottom = minToPx(list[i].end);
      if (y >= top && y <= bottom) {
        let zone = "body";
        if (y <= top + HANDLE_PX) zone = "top";
        else if (y >= bottom - HANDLE_PX) zone = "bottom";
        return { index: i, zone };
      }
    }
    return null;
  }

  function commit(list) {
    onChange(toRanges(list));
  }

  function handleSplit(y, list) {
    const block = list[splitArmed];
    setSplitArmed(null);
    setSelected(null);
    if (!block) return;
    const point = snap(clamp(DAY_START + (y / SLOT_PX) * SNAP, block.start, block.end));
    if (point - block.start < MIN_DUR || block.end - point < MIN_DUR) return; // both parts need 30 min
    const next = list.filter((_, i) => i !== splitArmed);
    next.push({ start: block.start, end: point }, { start: point, end: block.end });
    commit(next);
  }

  function onPointerDown(e) {
    if (disabled) return;
    const list = toItems(ranges);
    const y = localY(e);

    if (splitArmed !== null) {
      handleSplit(y, list);
      return;
    }

    const hit = hitTest(y, list);
    e.currentTarget.setPointerCapture(e.pointerId);

    if (hit) {
      setDrag({ mode: hit.zone, index: hit.index, startY: y, orig: list, moved: false, preview: list });
    } else {
      if (list.length >= MAX_RANGES) return;
      const anchor = snap(clamp(DAY_START + (y / SLOT_PX) * SNAP, DAY_START, DAY_END));
      setDrag({ mode: "create", anchor, startY: y, orig: list, moved: false, preview: list });
    }
  }

  function onPointerMove(e) {
    if (!drag) return;
    const y = localY(e);
    const moved = drag.moved || Math.abs(y - drag.startY) > 3;
    const cur = snap(clamp(DAY_START + (y / SLOT_PX) * SNAP, DAY_START, DAY_END));
    const sorted = drag.orig;
    let preview = drag.orig;

    if (drag.mode === "create") {
      const [lo, hi] = freeGap(sorted, drag.anchor);
      let start = clamp(Math.min(drag.anchor, cur), lo, hi - MIN_DUR);
      let end = clamp(Math.max(drag.anchor, cur), lo + MIN_DUR, hi);
      if (end - start < MIN_DUR) end = clamp(start + MIN_DUR, lo + MIN_DUR, hi);
      preview = [...sorted, { start, end }];
    } else {
      const block = sorted[drag.index];
      const prev = sorted[drag.index - 1];
      const next = sorted[drag.index + 1];
      const lower = prev ? prev.end : DAY_START;
      const upper = next ? next.start : DAY_END;

      if (drag.mode === "move") {
        const dur = block.end - block.start;
        const ns = clamp(snap(block.start + (cur - snap(DAY_START + (drag.startY / SLOT_PX) * SNAP))), lower, upper - dur);
        preview = sorted.map((b, i) => (i === drag.index ? { start: ns, end: ns + dur } : b));
      } else if (drag.mode === "top") {
        const ns = clamp(cur, lower, block.end - MIN_DUR);
        preview = sorted.map((b, i) => (i === drag.index ? { start: ns, end: block.end } : b));
      } else if (drag.mode === "bottom") {
        const ne = clamp(cur, block.start + MIN_DUR, upper);
        preview = sorted.map((b, i) => (i === drag.index ? { start: block.start, end: ne } : b));
      }
    }

    setDrag({ ...drag, moved, preview });
  }

  function onPointerUp(e) {
    if (!drag) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);

    if (!drag.moved) {
      if (drag.mode === "create") setSelected(null);
      else setSelected((prev) => (prev === drag.index ? null : drag.index));
    } else if (drag.mode === "create" || drag.preview) {
      commit(drag.preview);
      setSelected(null);
    }
    setDrag(null);
  }

  function removeBlock(index) {
    const list = toItems(ranges).filter((_, i) => i !== index);
    setSelected(null);
    setSplitArmed(null);
    commit(list);
  }

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">
        <span>{items.length}/{MAX_RANGES} aralık</span>
        {splitArmed !== null && <span className="text-[var(--color-primary)] font-medium">Bölmek için blok içinde bir noktaya tıklayın</span>}
      </div>

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={`relative mt-2 select-none rounded-lg border border-[var(--color-border)] ${
          disabled ? "opacity-50" : splitArmed !== null ? "cursor-crosshair" : "cursor-pointer"
        }`}
        style={{ height: TOTAL_PX, touchAction: "none" }}
      >
        {/* Hour grid */}
        {Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => {
          const m = DAY_START + i * 60;
          return (
            <div key={m} className="absolute left-0 right-0 flex" style={{ top: minToPx(m) }}>
              <span className="w-12 -translate-y-2 pl-2 text-[11px] text-[color-mix(in srgb, var(--color-text) 50%, transparent)]">
                {fmt(m)}
              </span>
              <span className="flex-1 border-t border-[var(--color-border)]" />
            </div>
          );
        })}
        {/* Half-hour faint lines */}
        {Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => {
          const m = DAY_START + i * 60 + 30;
          return (
            <div
              key={m}
              className="absolute left-12 right-0 border-t border-dashed border-[color-mix(in srgb, var(--color-border) 60%, transparent)]"
              style={{ top: minToPx(m) }}
            />
          );
        })}

        {/* Blocks */}
        {items.map((block, i) => {
          const top = minToPx(block.start);
          const height = minToPx(block.end) - top;
          const isSelected = selected === i && !drag;
          return (
            <div
              key={i}
              className="absolute left-12 right-1 rounded-md border bg-[color-mix(in srgb, var(--color-primary) 16%, transparent)] border-[var(--color-primary)] text-[var(--color-primary)]"
              style={{ top, height }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-1 text-center text-xs font-semibold">
                {fmt(block.start)}–{fmt(block.end)}
              </span>
              <span className="pointer-events-none absolute inset-x-0 top-0 h-2 cursor-ns-resize" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2 cursor-ns-resize" />

              {isSelected && (
                <div className="absolute right-1 bottom-1 flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSplitArmed(i)}
                    className="h-6 px-2 rounded bg-white/90 border border-[var(--color-primary)] text-[11px] font-medium hover:bg-white"
                  >
                    Böl
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(i)}
                    className="h-6 px-2 rounded bg-white/90 border border-red-300 text-[11px] font-medium text-red-700 hover:bg-white"
                  >
                    Sil
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-[color-mix(in srgb, var(--color-text) 55%, transparent)]">
        Boş alanı sürükleyerek aralık ekleyin. Blokları taşıyın, kenarlardan boyutlandırın veya seçip bölün.
      </p>
    </div>
  );
}
