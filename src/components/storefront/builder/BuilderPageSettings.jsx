'use client';
/* eslint-disable @next/next/no-img-element */

import { Check } from 'lucide-react';
import { listTemplatesForRole } from './storefrontTemplates';
import {
  ColorField,
  Field,
  ImageAdjustmentControls,
  MediaPicker,
  inputClass,
} from './builderUiPrimitives';

export default function PageSettings({ role, templateKey, onTemplateChange, brandKit, onChange, onMediaUpload, media }) {
  const templates = listTemplatesForRole(role);
  return (
    <div className="p-3.5">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Design system</p>
            <h2 className="mt-1 text-sm font-bold tracking-tight text-slate-900">Choose a starting point</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-500 shadow-sm">
            {templates.length} themes
          </span>
        </div>
        <p className="mt-2 text-[10px] leading-4 text-slate-500">
          Each template changes page structure, section styles, copy, and branding.
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {templates.map((template, index) => {
          const active = template.id === templateKey;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onTemplateChange(template.id)}
              aria-pressed={active}
              className={`group relative w-full overflow-hidden rounded-2xl border text-left transition duration-200 ${
                active
                  ? 'border-slate-900 bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] ring-1 ring-slate-900'
                  : 'border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div
                className="relative h-11 overflow-hidden"
                style={{
                  background: `linear-gradient(125deg, ${template.brand.primary_color}, ${template.brand.accent_color})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-white/10" />
                <div className="absolute left-3 top-2.5 flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/55" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
                </div>
                <span className="absolute bottom-2 right-3 text-[8px] font-bold uppercase tracking-[0.18em] text-white/80">
                  Layout {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold leading-4">{template.label}</p>
                    <p className={`mt-1 text-[9px] leading-3.5 ${active ? 'text-white/65' : 'text-slate-500'}`}>
                      {template.tagline}
                    </p>
                  </div>
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                    active
                      ? 'border-white/25 bg-white text-slate-950'
                      : 'border-slate-200 bg-slate-50 text-transparent group-hover:border-slate-300'
                  }`}>
                    <Check size={11} strokeWidth={3} />
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature}
                      className={`rounded-md px-1.5 py-0.5 text-[8px] font-semibold ${
                        active ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className={`mt-2.5 flex items-center justify-between border-t pt-2.5 ${active ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: template.brand.primary_color }} />
                    <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: template.brand.accent_color }} />
                  </div>
                  <span className={`text-[8px] font-semibold ${active ? 'text-white/50' : 'text-slate-400'}`}>
                    Aa · {template.brand.font}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Brand kit</p>
        <Field label="Business name">
          <input value={brandKit.business_name || ''} onChange={(event) => onChange({ business_name: event.target.value })} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-2.5">
          <ColorField label="Primary" value={brandKit.primary_color} onChange={(primary_color) => onChange({ primary_color })} />
          <ColorField label="Accent" value={brandKit.accent_color} onChange={(accent_color) => onChange({ accent_color })} />
        </div>
        <Field label="Button style">
          <select value={brandKit.button_shape || 'rounded'} onChange={(event) => onChange({ button_shape: event.target.value })} className={inputClass}>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="pill">Pill</option>
          </select>
        </Field>
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Brand media</p>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="relative h-20 bg-slate-200">
              {media?.cover ? (
                <img
                  src={media.cover}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: `${Number(brandKit.cover_position_x ?? 50)}% ${Number(brandKit.cover_position_y ?? 50)}%`,
                    transform: `scale(${Math.max(1, Number(brandKit.cover_zoom ?? 1))})`,
                    transformOrigin: `${Number(brandKit.cover_position_x ?? 50)}% ${Number(brandKit.cover_position_y ?? 50)}%`,
                  }}
                />
              ) : (
                <div className="grid h-full place-items-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">Cover preview</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
              <div className="absolute bottom-2 left-2 flex items-end gap-2">
                <span className="relative h-9 w-9 overflow-hidden rounded-xl border-2 border-white bg-white shadow">
                  {media?.profile ? (
                    <img
                      src={media.profile}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: `${Number(brandKit.profile_position_x ?? 50)}% ${Number(brandKit.profile_position_y ?? 25)}%`,
                        transform: `scale(${Number(brandKit.profile_zoom ?? 1)})`,
                        transformOrigin: `${Number(brandKit.profile_position_x ?? 50)}% ${Number(brandKit.profile_position_y ?? 25)}%`,
                      }}
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-[9px] font-bold text-slate-400">Photo</span>
                  )}
                </span>
                {brandKit.logo_url ? (
                  <span className="grid h-7 w-12 place-items-center overflow-hidden rounded-lg border border-white/80 bg-white/95 p-1 shadow">
                    <img src={brandKit.logo_url} alt="" className="max-h-full max-w-full object-contain" />
                  </span>
                ) : null}
              </div>
            </div>
            <div className="space-y-2 p-2.5">
              <MediaPicker label="Cover image" hint="This page only" image={media?.cover || brandKit?.cover_url} onUpload={(file) => onMediaUpload('cover', file)} tall />
              {(media?.cover || brandKit?.cover_url) ? (
                <ImageAdjustmentControls
                  image={media?.cover || brandKit?.cover_url}
                  kind="cover"
                  values={brandKit}
                  onChange={onChange}
                />
              ) : null}
              <MediaPicker label="Profile image" hint="This page only" image={media?.profile || brandKit?.profile_photo_url} onUpload={(file) => onMediaUpload('profile', file)} circle />
              {(media?.profile || brandKit?.profile_photo_url) ? (
                <ImageAdjustmentControls
                  image={media?.profile || brandKit?.profile_photo_url}
                  kind="profile"
                  values={brandKit}
                  onChange={onChange}
                />
              ) : null}
              <MediaPicker label="Logo" hint="Automatically fitted · transparent PNG works best" image={brandKit.logo_url} onUpload={(file) => onMediaUpload('logo', file)} />
              <p className="text-[10px] leading-4 text-slate-400">Cover and profile photos apply only to this professional page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
