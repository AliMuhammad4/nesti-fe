'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Crop } from 'lucide-react';
import StorefrontImageEditor from './StorefrontImageEditor';

export const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5';
export const iconButton = 'grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900';

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export function ColorField({ label, value, onChange }) {
  const safe = /^#[0-9A-Fa-f]{6}$/.test(value || '') ? value : '#0f766e';
  return (
    <Field label={label}>
      <div className="flex h-10 overflow-hidden rounded-lg border border-slate-200">
        <input type="color" value={safe} onChange={(event) => onChange(event.target.value)} className="w-10 border-0 p-1" />
        <input value={value || ''} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 px-2.5 text-xs outline-none" maxLength={9} />
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
