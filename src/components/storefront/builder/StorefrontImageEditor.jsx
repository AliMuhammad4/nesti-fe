'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import { Crosshair, Minus, Plus, RotateCcw, X } from 'lucide-react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min));

export default function StorefrontImageEditor({
  image,
  kind,
  initialX = 50,
  initialY = 50,
  initialZoom = 1,
  onCancel,
  onApply,
}) {
  const isCover = kind === 'cover';
  const minZoom = 1;
  const defaultY = isCover ? 50 : 25;
  const [x, setX] = useState(clamp(initialX, 0, 100));
  const [y, setY] = useState(clamp(initialY, 0, 100));
  const [zoom, setZoom] = useState(clamp(initialZoom, minZoom, 3));
  const frameRef = useRef(null);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const setFocusFromPointer = (event) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setX(clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100));
    setY(clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100));
  };

  const imageStyle = {
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
  };

  const adjustZoom = (delta) => {
    setZoom((current) => clamp(Number((current + delta).toFixed(2)), minZoom, 3));
  };

  return (
    <div className="fixed inset-0 z-[10000] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Adjust {isCover ? 'cover image' : 'profile photo'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Click or drag over the preview to choose the focal point, then adjust zoom.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Close image editor"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-5">
          <div
            ref={frameRef}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture?.(event.pointerId);
              setFocusFromPointer(event);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture?.(event.pointerId)) setFocusFromPointer(event);
            }}
            className={`relative mx-auto cursor-crosshair touch-none overflow-hidden border border-slate-200 bg-slate-100 shadow-inner ${
              // PublicHero is 1280×256 on desktop, so the crop preview must
              // use the same 5:1 frame or its focal point will look different.
              isCover ? 'aspect-[5/1] w-full rounded-xl' : 'aspect-square w-72 rounded-full'
            }`}
          >
            <img
              src={image}
              alt=""
              draggable={false}
              className="h-full w-full select-none object-cover transition-transform duration-100"
              style={imageStyle}
            />
            <span
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <Crosshair size={24} strokeWidth={2.5} />
            </span>
            <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-slate-950/65 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
              Focus {Math.round(x)}%, {Math.round(y)}%
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor={`${kind}-zoom`} className="text-xs font-semibold text-slate-700">
                  Zoom
                </label>
                <span className="text-xs font-bold tabular-nums text-slate-500">{Math.round(zoom * 100)}%</span>
              </div>
              {isCover ? (
                <p className="mb-2 text-[10px] leading-4 text-slate-400">
                  100% is the minimum needed to fill the cover without empty or blurred edges.
                </p>
              ) : null}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustZoom(-0.1)}
                  disabled={zoom <= minZoom}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30"
                  aria-label="Zoom out"
                >
                  <Minus size={16} />
                </button>
                <input
                  id={`${kind}-zoom`}
                  type="range"
                  min={minZoom}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="min-w-0 flex-1 accent-primary"
                />
                <button
                  type="button"
                  onClick={() => adjustZoom(0.1)}
                  disabled={zoom >= 3}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30"
                  aria-label="Zoom in"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Center', x: 50, y: 50 },
                { label: 'Top', x: 50, y: 20 },
                { label: 'Left', x: 25, y: 50 },
                { label: 'Right', x: 75, y: 50 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setX(preset.x);
                    setY(preset.y);
                  }}
                  className="rounded-lg border border-slate-200 px-2.5 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              setX(50);
              setY(defaultY);
              setZoom(1);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onApply?.({ x, y, zoom })}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark"
            >
              Apply adjustments
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
