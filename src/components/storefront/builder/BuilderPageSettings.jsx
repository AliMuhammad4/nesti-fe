'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Redo2, Undo2 } from 'lucide-react';
import { getTemplateBrandDefaults, listTemplatesForRole } from '../templates';
import {
  BuilderSelect,
  ColorField,
  Field,
  FieldResetButton,
  ImageAdjustmentControls,
  MediaPicker,
  inputClass,
} from './builderUiPrimitives';

function normalizeHex(value, fallback) {
  const raw = String(value || '').trim().toLowerCase();
  const withHash = raw.startsWith('#') ? raw : `#${raw}`;
  if (/^#[0-9a-f]{3}$/.test(withHash)) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return /^#[0-9a-f]{6}$/.test(withHash) ? withHash : String(fallback || '').trim().toLowerCase();
}

function TemplateBrandControls({
  brandKit,
  onChange,
  templateKey,
  onResetTemplateColors,
  onResetTemplateDefaults,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  canResetTemplateDefaults = true,
}) {
  const defaults = getTemplateBrandDefaults(templateKey);
  const primaryCustom = defaults
    && normalizeHex(brandKit.primary_color, defaults.primary_color) !== normalizeHex(defaults.primary_color);
  const accentCustom = defaults
    && normalizeHex(brandKit.accent_color, defaults.accent_color) !== normalizeHex(defaults.accent_color);
  const pageBgCustom = defaults
    && normalizeHex(brandKit.page_background, defaults.page_background) !== normalizeHex(defaults.page_background);
  const buttonCustom = defaults
    && (brandKit.button_shape || 'rounded') !== (defaults.button_shape || 'rounded');
  const anyColorCustom = primaryCustom || accentCustom || pageBgCustom || buttonCustom;

  return (
    <div className="space-y-2.5 border-t border-slate-200 bg-slate-50/90 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Template colors</p>
          <p className="mt-1 text-[10px] leading-4 text-slate-500">
            Applied to this page. Change anytime — preview updates live.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo || !onUndo}
            title="Undo"
            aria-label="Undo"
            className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo || !onRedo}
            title="Redo"
            aria-label="Redo"
            className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Redo2 size={14} />
          </button>
        </div>
      </div>
      <Field label="Business name">
        <input
          value={brandKit.business_name || ''}
          onChange={(event) => onChange({ business_name: event.target.value })}
          className={inputClass}
        />
      </Field>
      <ColorField
        label="Primary"
        value={brandKit.primary_color || '#0f766e'}
        onChange={(primary_color) => onChange({ primary_color })}
        showReset={Boolean(primaryCustom)}
        onReset={() => defaults && onChange({ primary_color: defaults.primary_color })}
      />
      <ColorField
        label="Accent"
        value={brandKit.accent_color || '#f59e0b'}
        onChange={(accent_color) => onChange({ accent_color })}
        showReset={Boolean(accentCustom)}
        onReset={() => defaults && onChange({ accent_color: defaults.accent_color })}
      />
      <ColorField
        label="Page background"
        value={brandKit.page_background || '#ffffff'}
        onChange={(page_background) => onChange({ page_background })}
        showReset={Boolean(pageBgCustom)}
        onReset={() => defaults && onChange({ page_background: defaults.page_background })}
      />
      <Field
        label="Button style"
        action={buttonCustom && defaults ? (
          <FieldResetButton onClick={() => onChange({ button_shape: defaults.button_shape || 'rounded' })} />
        ) : null}
      >
        <BuilderSelect
          value={brandKit.button_shape || 'rounded'}
          options={[
            { value: 'square', label: 'Square' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'pill', label: 'Pill' },
          ]}
          onChange={(button_shape) => onChange({ button_shape })}
          ariaLabel="Button style"
        />
      </Field>
      <div className="space-y-1.5 border-t border-slate-200 pt-2.5">
        <button
          type="button"
          disabled={!anyColorCustom || !onResetTemplateColors}
          onClick={onResetTemplateColors}
          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Reset colors to defaults
        </button>
        <button
          type="button"
          disabled={!onResetTemplateDefaults || !canResetTemplateDefaults}
          onClick={onResetTemplateDefaults}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Reset layout &amp; colors
        </button>
        <p className="text-[9px] leading-3.5 text-slate-400">
          Layout reset restores this template’s original sections, styles, card colors, and default copy. Business name and brand media stay.
        </p>
      </div>
    </div>
  );
}

export default function PageSettings({
  role,
  templateKey,
  onTemplateChange,
  brandKit,
  onChange,
  onMediaUpload,
  media,
  onResetTemplateColors,
  onResetTemplateDefaults,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  canResetTemplateDefaults = true,
}) {
  const templates = listTemplatesForRole(role);
  const expandedPanelRef = useRef(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState(null);

  useEffect(() => {
    setExpandedTemplateId(null);
  }, [templateKey]);

  useEffect(() => {
    if (!expandedTemplateId) return undefined;
    const frame = window.requestAnimationFrame(() => {
      expandedPanelRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [expandedTemplateId]);

  return (
    <div className="p-3.5">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Design</p>
            <h2 className="mt-1 text-sm font-bold tracking-tight text-slate-900">Choose a template</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-500 shadow-sm">
            {templates.length} themes
          </span>
        </div>
        <p className="mt-2 text-[10px] leading-4 text-slate-500">
          Select a template to open its color controls underneath. Section Layout / Style on the right only change the selected section.
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {templates.map((template, index) => {
          const active = template.id === templateKey;
          const expanded = active && expandedTemplateId === template.id;
          return (
            <div
              key={template.id}
              className={`overflow-hidden rounded-2xl border transition duration-200 ${
                active
                  ? 'border-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.18)] ring-1 ring-slate-900'
                  : 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <button
                type="button"
                onClick={() => onTemplateChange(template.id)}
                aria-pressed={active}
                aria-expanded={active}
                className={`group relative w-full text-left ${active ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}
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
                    <div className="flex shrink-0 items-center gap-1.5">
                      {active ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setExpandedTemplateId((current) => (current === template.id ? null : template.id));
                          }}
                          className="inline-flex items-center gap-0.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white/80 hover:bg-white/15"
                        >
                          {expanded ? 'Open' : 'Closed'}
                          <ChevronDown size={10} />
                        </button>
                      ) : null}
                      <span className={`grid h-5 w-5 place-items-center rounded-full border transition ${
                        active
                          ? 'border-white/25 bg-white text-slate-950'
                          : 'border-slate-200 bg-slate-50 text-transparent group-hover:border-slate-300'
                      }`}
                      >
                        <Check size={11} strokeWidth={3} />
                      </span>
                    </div>
                  </div>

                  <div className={`mt-2.5 flex items-center justify-between border-t pt-2.5 ${active ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: active ? brandKit.primary_color : template.brand.primary_color }} />
                      <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: active ? brandKit.accent_color : template.brand.accent_color }} />
                      <span
                        className="h-3 w-3 rounded-full ring-1 ring-black/10"
                        style={{ background: active ? (brandKit.page_background || '#ffffff') : (template.brand.page_background || '#ffffff') }}
                        title="Page background"
                      />
                    </div>
                    <span className={`text-[8px] font-semibold ${active ? 'text-white/50' : 'text-slate-400'}`}>
                      Aa · {active ? (brandKit.font || template.brand.font) : template.brand.font}
                    </span>
                  </div>
                </div>
              </button>

              {expanded ? (
                <div ref={expandedPanelRef}>
                  <TemplateBrandControls
                    brandKit={brandKit}
                    onChange={onChange}
                    templateKey={templateKey}
                    onResetTemplateColors={onResetTemplateColors}
                    onResetTemplateDefaults={onResetTemplateDefaults}
                    onUndo={onUndo}
                    onRedo={onRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canResetTemplateDefaults={canResetTemplateDefaults}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
