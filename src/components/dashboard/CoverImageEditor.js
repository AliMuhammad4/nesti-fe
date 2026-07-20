"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Move, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function CoverImageEditor({
  coverUrl,
  initialZoom = 1,
  initialPosition = { x: 50, y: 50 },
  saving = false,
  onClose,
  onSave,
}) {
  const [zoom, setZoom] = useState(clamp(Number(initialZoom) || 1, 1, 3));
  const [position, setPosition] = useState({
    x: clamp(Number(initialPosition?.x) || 50, 0, 100),
    y: clamp(Number(initialPosition?.y) || 50, 0, 100),
  });
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef(null);

  const previewStyle = useMemo(
    () => ({
      transform: `scale(${zoom})`,
      transformOrigin: `${position.x}% ${position.y}%`,
      objectPosition: `${position.x}% ${position.y}%`,
    }),
    [position.x, position.y, zoom],
  );

  useEffect(() => {
    if (!dragging) return undefined;

    const handleMove = (event) => {
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({
        x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
        y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
      });
    };

    const handleUp = () => setDragging(false);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging]);

  const reset = () => {
    setZoom(1);
    setPosition({ x: 50, y: 50 });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Adjust cover photo</h2>
            <p className="mt-0.5 text-xs text-slate-500">Drag to reposition, then zoom until it looks right.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close cover editor"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div
            ref={frameRef}
            role="presentation"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture?.(event.pointerId);
              setDragging(true);
            }}
            className="relative h-[220px] cursor-grab overflow-hidden rounded-xl border border-slate-200 bg-slate-100 active:cursor-grabbing sm:h-[280px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt=""
              draggable={false}
              className="h-full w-full select-none object-cover transition-transform duration-100"
              style={previewStyle}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/10 via-transparent to-slate-900/25" />
            <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
              <Move size={13} />
              Drag image
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((value) => clamp(Number((value - 0.1).toFixed(2)), 1, 3))}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                disabled={zoom <= 1}
                aria-label="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-44 accent-primary"
                aria-label="Cover image zoom"
              />
              <button
                type="button"
                onClick={() => setZoom((value) => clamp(Number((value + 0.1).toFixed(2)), 1, 3))}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                disabled={zoom >= 3}
                aria-label="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
              <span className="w-12 text-xs font-semibold text-slate-500">{Math.round(zoom * 100)}%</span>
            </div>

            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave?.({ zoom, position })}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save cover"}
          </button>
        </div>
      </div>
    </div>
  );
}
