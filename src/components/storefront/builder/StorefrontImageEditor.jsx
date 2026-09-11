'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import { Crosshair, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { storefrontFocalPointStyle } from '../renderers/runtime/storefrontFocalPointStyle';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min));

const EDITOR_CONFIG = {
  'hero-first-home': {
    title: 'slide image',
    frameClass: 'aspect-[21/9] w-full rounded-xl',
    defaultY: 50,
    minZoom: 1,
    maxZoom: 3,
    zoomHint: 'Matches the live hero frame. Zoom in to crop tighter — images always fill the slide.',
    presets: [
      { label: 'Center', x: 50, y: 50 },
      { label: 'Top', x: 50, y: 28 },
      { label: 'Bottom', x: 50, y: 72 },
      { label: 'Left', x: 28, y: 50 },
      { label: 'Right', x: 72, y: 50 },
    ],
  },
  'hero-slide': {
    title: 'slide image',
    frameClass: 'aspect-[16/9] w-full rounded-xl',
    defaultY: 50,
    minZoom: 1,
    maxZoom: 3,
    zoomHint: 'Zoom in to crop tighter — images always fill the slide.',
    presets: [
      { label: 'Center', x: 50, y: 50 },
      { label: 'Top', x: 50, y: 28 },
      { label: 'Bottom', x: 50, y: 72 },
      { label: 'Left', x: 28, y: 50 },
      { label: 'Right', x: 72, y: 50 },
    ],
  },
  'about-portrait': {
    title: 'about photo',
    frameClass: 'aspect-[3/4] w-full max-w-md rounded-xl',
    defaultY: 50,
    minZoom: 0.6,
    maxZoom: 3,
    zoomHint: 'Zoom out to reveal more of the photo, or zoom in to crop tighter.',
    presets: [
      { label: 'Center', x: 50, y: 50 },
      { label: 'Top', x: 50, y: 28 },
      { label: 'Bottom', x: 50, y: 72 },
      { label: 'Left', x: 28, y: 50 },
      { label: 'Right', x: 72, y: 50 },
    ],
  },
  cover: {
    title: 'cover image',
    frameClass: 'aspect-[5/1] w-full rounded-xl',
    defaultY: 50,
    minZoom: 1,
    maxZoom: 3,
    zoomHint: '100% is the minimum needed to fill the cover without empty edges.',
    presets: [
      { label: 'Center', x: 50, y: 50 },
      { label: 'Top', x: 50, y: 20 },
      { label: 'Left', x: 25, y: 50 },
      { label: 'Right', x: 75, y: 50 },
    ],
  },
  profile: {
    title: 'profile photo',
    frameClass: 'aspect-square w-72 rounded-full',
    defaultY: 25,
    minZoom: 1,
    maxZoom: 3,
    zoomHint: 'Drag the focal point and zoom to frame the portrait.',
    presets: [
      { label: 'Center', x: 50, y: 50 },
      { label: 'Top', x: 50, y: 28 },
      { label: 'Left', x: 35, y: 50 },
      { label: 'Right', x: 65, y: 50 },
    ],
  },
};

function resolveEditorConfig(kind) {
  if (kind === 'hero-first-home') return EDITOR_CONFIG['hero-first-home'];
  if (kind === 'hero-slide') return EDITOR_CONFIG['hero-slide'];
  if (kind === 'about-portrait') return EDITOR_CONFIG['about-portrait'];
  if (kind === 'profile') return EDITOR_CONFIG.profile;
  return EDITOR_CONFIG.cover;
}

export default function StorefrontImageEditor({
  image,
  kind = 'cover',
  initialX = 50,
  initialY = 50,
  initialZoom = 1,
  onCancel,
  onApply,
}) {
  const config = resolveEditorConfig(kind);
  const { minZoom, maxZoom, defaultY } = config;
  const [x, setX] = useState(clamp(initialX, 0, 100));
  const [y, setY] = useState(clamp(initialY, 0, 100));
  const [zoom, setZoom] = useState(clamp(initialZoom, minZoom, maxZoom));
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    setX(clamp(initialX, 0, 100));
    setY(clamp(initialY, 0, 100));
    setZoom(clamp(initialZoom, minZoom, maxZoom));
  }, [image, initialX, initialY, initialZoom, minZoom, maxZoom]);

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

  const imageStyle = storefrontFocalPointStyle({
    x,
    y,
    zoom,
    minZoom,
    maxZoom,
  });

  const adjustZoom = (delta) => {
    setZoom((current) => clamp(Number((current + delta).toFixed(2)), minZoom, maxZoom));
  };

  const reset = () => {
    setX(50);
    setY(defaultY);
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
        <header className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-4">
          <div className="pr-4">
            <h2 className="text-base font-bold capitalize text-slate-950">
              Adjust {config.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Click or drag on the preview to set the focal point, then fine-tune with zoom.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Close image editor"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div
            ref={frameRef}
            onPointerDown={(event) => {
              event.preventDefault();
              setDragging(true);
              event.currentTarget.setPointerCapture?.(event.pointerId);
              setFocusFromPointer(event);
            }}
            onPointerMove={(event) => {
              if (!dragging && !event.currentTarget.hasPointerCapture?.(event.pointerId)) return;
              setFocusFromPointer(event);
            }}
            onPointerUp={(event) => {
              setDragging(false);
              event.currentTarget.releasePointerCapture?.(event.pointerId);
            }}
            onPointerCancel={(event) => {
              setDragging(false);
              event.currentTarget.releasePointerCapture?.(event.pointerId);
            }}
            className={`relative mx-auto cursor-crosshair touch-none overflow-hidden border border-slate-300 bg-[#0a1420] shadow-inner ${config.frameClass}`}
          >
            <img
              src={image}
              alt=""
              draggable={false}
              className={`absolute inset-0 h-full w-full select-none object-cover ${dragging ? '' : 'transition-transform duration-150'}`}
              style={imageStyle}
            />
            <span
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <Crosshair size={22} strokeWidth={2.5} />
            </span>
            <span className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
              {Math.round(x)}%, {Math.round(y)} · {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor={`${kind}-zoom`} className="text-xs font-semibold text-slate-700">
                  Zoom
                </label>
                <span className="text-xs font-bold tabular-nums text-slate-500">{Math.round(zoom * 100)}%</span>
              </div>
              <p className="mb-3 text-[10px] leading-4 text-slate-500">{config.zoomHint}</p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => adjustZoom(-0.1)}
                  disabled={zoom <= minZoom}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
                  aria-label="Zoom out"
                >
                  <Minus size={16} />
                </button>
                <input
                  id={`${kind}-zoom`}
                  type="range"
                  min={minZoom}
                  max={maxZoom}
                  step={0.05}
                  value={zoom}
                  onChange={(event) => setZoom(clamp(Number(event.target.value), minZoom, maxZoom))}
                  className="min-w-0 flex-1 accent-primary"
                />
                <button
                  type="button"
                  onClick={() => adjustZoom(0.1)}
                  disabled={zoom >= maxZoom}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
                  aria-label="Zoom in"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Quick position</p>
              <div className="flex flex-wrap gap-1.5">
                {config.presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setX(preset.x);
                      setY(preset.y);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onApply?.({ x, y, zoom })}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark"
            >
              Apply adjustments
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
