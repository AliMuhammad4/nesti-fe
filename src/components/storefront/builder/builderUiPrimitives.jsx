'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Crop } from 'lucide-react';
import StorefrontImageEditor from './StorefrontImageEditor';

export const inputClass = 'w-full rounded-lg border border-primary/20 bg-primary/[0.025] px-3 py-2 text-sm text-text-heading outline-none transition hover:border-primary/35 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10';
export const iconButton = 'grid h-8 w-8 place-items-center rounded-lg border border-primary/20 text-primary/70 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary';

export function Field({ label, children, action = null }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary/65">{label}</span>
        {action}
      </span>
      {children}
    </label>
  );
}

export function FieldResetButton({ onClick, label = 'Reset' }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
      }}
      className="shrink-0 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 transition hover:text-slate-700"
    >
      {label}
    </button>
  );
}

export function BuilderSelect({ value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value)) || options[0];

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => {
      menuRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`${inputClass} flex items-center justify-between gap-3 text-left`}
      >
        <span className="truncate">{selected?.label || 'Select an option'}</span>
        <ChevronDown size={16} className={`shrink-0 text-primary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div
          ref={menuRef}
          className="absolute z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-primary/20 bg-white p-1.5 shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
        >
          {options.map((option) => {
            const active = String(option.value) === String(value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12px] font-semibold transition ${
                  active
                    ? 'bg-primary text-white'
                    : 'text-slate-700 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <span>{option.label}</span>
                {active ? <Check size={14} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const QUICK_COLOR_SWATCHES = [
  '#0f766e', '#0ea5e9', '#2563eb', '#4338ca', '#7c3aed', '#db2777',
  '#dc2626', '#ea580c', '#d97706', '#65a30d', '#16a34a', '#0891b2',
];

const NEUTRAL_COLOR_SWATCHES = [
  '#ffffff', '#f8fafc', '#e2e8f0', '#cbd5e1', '#64748b', '#334155', '#1f2937', '#0f172a',
];

function normalizeHexColor(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withHash = raw.startsWith('#') ? raw : `#${raw}`;
  const shortMatch = /^#[0-9a-fA-F]{3}$/.test(withHash);
  if (shortMatch) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  const longMatch = /^#[0-9a-fA-F]{6}$/.test(withHash);
  return longMatch ? withHash.toUpperCase() : '';
}

export function ColorField({ label, value, onChange, onReset = null, showReset = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const normalized = normalizeHexColor(value);
  const safe = normalized || '#0f766e';
  const selectedHex = normalized.toUpperCase();

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => {
      menuRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const applyColor = (next, closeMenu = false) => {
    const normalizedNext = normalizeHexColor(next);
    onChange(normalizedNext || next);
    if (closeMenu) setOpen(false);
  };

  return (
    <Field
      label={label}
      action={showReset && onReset ? <FieldResetButton onClick={onReset} /> : null}
    >
      <div ref={rootRef} className="relative">
        <div className="flex h-10 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex h-full w-16 shrink-0 items-center justify-center gap-1.5 border-r border-slate-200 bg-slate-50 transition hover:bg-slate-100"
            aria-label={`${label} palette`}
            aria-expanded={open}
          >
            <span className="h-5 w-5 rounded-md border border-black/10 shadow-inner" style={{ backgroundColor: safe }} />
            <ChevronDown size={12} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <input
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            onBlur={(event) => {
              const next = event.target.value.trim();
              if (!next) {
                onChange('');
                return;
              }
              const normalizedValue = normalizeHexColor(next);
              if (normalizedValue) onChange(normalizedValue);
            }}
            className="min-w-0 flex-1 bg-transparent px-2.5 text-xs font-semibold uppercase tracking-wide text-slate-700 outline-none"
            maxLength={9}
            placeholder="#0F766E"
            aria-label={`${label} hex value`}
          />
          <label className="relative flex h-full cursor-pointer items-center border-l border-slate-200 px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
            Pick
            <input
              type="color"
              value={safe}
              onChange={(event) => applyColor(event.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label={label}
            />
          </label>
        </div>

        {open ? (
          <div
            ref={menuRef}
            className="absolute z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
          >
            <p className="mb-2 text-[11px] font-semibold text-slate-600">Quick colors</p>
            <div className="grid grid-cols-6 gap-2">
              {QUICK_COLOR_SWATCHES.map((hex) => {
                const active = selectedHex === hex.toUpperCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => applyColor(hex, true)}
                    className={`relative h-7 w-full rounded-md border transition ${
                      active ? 'border-slate-700 ring-2 ring-primary/20' : 'border-slate-200 hover:scale-[1.04]'
                    }`}
                    style={{ backgroundColor: hex }}
                    aria-label={`${label} ${hex}`}
                  >
                    {active ? <Check size={12} className="absolute right-1 top-1 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]" /> : null}
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-3 text-[11px] font-semibold text-slate-600">Neutrals</p>
            <div className="grid grid-cols-8 gap-2">
              {NEUTRAL_COLOR_SWATCHES.map((hex) => {
                const active = selectedHex === hex.toUpperCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => applyColor(hex, true)}
                    className={`relative h-7 w-full rounded-md border transition ${
                      active ? 'border-slate-700 ring-2 ring-primary/20' : 'border-slate-200 hover:scale-[1.04]'
                    }`}
                    style={{ backgroundColor: hex }}
                    aria-label={`${label} ${hex}`}
                  >
                    {active ? (
                      <Check
                        size={12}
                        className={`absolute right-1 top-1 ${hex === '#ffffff' || hex === '#f8fafc' || hex === '#f1f5f9' ? 'text-slate-700' : 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]'}`}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                Clear color
              </button>
              <span className="text-[10px] font-medium text-slate-500">{selectedHex || 'Using default'}</span>
            </div>
          </div>
        ) : null}
      </div>
    </Field>
  );
}

export function MediaPicker({ label, hint, image, onUpload, tall = false, circle = false }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-slate-300 bg-white p-2.5 transition hover:border-slate-400 hover:bg-slate-50">
      <span className={`grid shrink-0 place-items-center overflow-hidden bg-slate-100 text-[9px] font-bold text-slate-400 ${circle ? 'h-11 w-11 rounded-full' : tall ? 'h-11 w-16 rounded-lg' : 'h-11 w-11 rounded-lg'}`}>
        {image ? <img src={image} alt="" className={`h-full w-full ${circle || !tall ? 'object-cover object-top' : 'object-cover object-[center_30%]'}`} /> : 'IMG'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-slate-700">{label}</span>
        <span className="block text-[10px] text-slate-400">{hint || 'Upload or replace'}</span>
      </span>
      <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => onUpload(event.target.files?.[0])} />
    </label>
  );
}

export function ImageAdjustmentControls({ image, kind, values, onChange }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const isCover = kind === 'cover';
  const prefix = isCover ? 'cover' : 'profile';
  const minZoom = 1;
  const x = Number(values?.[`${prefix}_position_x`] ?? 50);
  const y = Number(values?.[`${prefix}_position_y`] ?? (isCover ? 50 : 25));
  const zoom = Math.max(minZoom, Number(values?.[`${prefix}_zoom`] ?? 1));

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-2.5">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Adjust {isCover ? 'cover' : 'profile photo'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setEditorOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
      >
        <Crop size={14} />
        Open visual editor
      </button>
      {editorOpen && image ? createPortal(
        <StorefrontImageEditor
          image={image}
          kind={kind}
          initialX={x}
          initialY={y}
          initialZoom={zoom}
          onCancel={() => setEditorOpen(false)}
          onApply={(adjustments) => {
            onChange({
              [`${prefix}_position_x`]: adjustments.x,
              [`${prefix}_position_y`]: adjustments.y,
              [`${prefix}_zoom`]: adjustments.zoom,
            });
            setEditorOpen(false);
          }}
        />,
        document.body,
      ) : null}
    </div>
  );
}
