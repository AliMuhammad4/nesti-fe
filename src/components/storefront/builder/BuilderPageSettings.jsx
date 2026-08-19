'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Lock, Redo2, Sparkles, Undo2 } from 'lucide-react';
import { useStorefrontTemplateEntitlements } from '@/hooks/useBillingApi';
import { getTemplateBrandDefaults, listTemplatesForRole } from '../templates';
import {
  BuilderSelect,
  ColorField,
  Field,
  FieldResetButton,
  inputClass,
} from './builderUiPrimitives';

const TEMPLATE_GALLERY_COPY = {
  'agent-classic': {
    title: 'Classic',
    tagline: 'A complete page for buying and selling',
  },
  'agent-luxury-advisor': {
    title: 'Luxury',
    tagline: 'An editorial page for premium listings',
  },
  'agent-first-home': {
    title: 'First Home',
    tagline: 'Clear guidance for first-time buyers',
  },
  'agent-investor': {
    title: 'Investor',
    tagline: 'A numbers-first page for investment deals',
  },
  'agent-seller-expert': {
    title: 'Seller',
    tagline: 'A modern page built to win listings',
  },
  'agent-community-expert': {
    title: 'Neighborhood',
    tagline: 'Local insight for the streets you know',
  },
  'mortgage_broker-classic': {
    title: 'Advisor',
    tagline: 'Rates, tools, and a clear next step',
  },
  'mortgage_broker-first-home': {
    title: 'First Home',
    tagline: 'Financing made simple for first-time buyers',
  },
  'mortgage_broker-wealth': {
    title: 'Wealth',
    tagline: 'Portfolio strategy for high-equity clients',
  },
  'mortgage_broker-renewal': {
    title: 'Renewal',
    tagline: 'Refinance and renewal with a clear plan',
  },
  'mortgage_broker-commercial': {
    title: 'Commercial',
    tagline: 'Financing for multi-unit and commercial deals',
  },
  'lawyer-classic': {
    title: 'Classic',
    tagline: 'Trusted closings with a clear process',
  },
  'lawyer-first-home-closing': {
    title: 'First Home',
    tagline: 'Plain-language closings for first-time buyers',
  },
  'lawyer-investor': {
    title: 'Investor',
    tagline: 'Title and transaction support for investors',
  },
  'lawyer-newcomer': {
    title: 'Newcomer',
    tagline: 'Warm guidance for new-to-market buyers',
  },
  'lawyer-commercial': {
    title: 'Commercial',
    tagline: 'Counsel for commercial real estate deals',
  },
};

function galleryCopyForTemplate(template) {
  const copy = TEMPLATE_GALLERY_COPY[template.id];
  return {
    title: copy?.title || template.label,
    tagline: copy?.tagline || template.tagline,
  };
}

function fallbackTemplateAccess(template) {
  const isFree = template?.free || template?.id === 'agent-investor';
  return {
    unlocked: isFree || !String(template?.id || '').startsWith('agent-'),
    tier: isFree ? 'free' : '',
    display_amount: isFree ? 'Free' : '',
  };
}

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
  const isLuxuryTemplate = String(templateKey || '').toLowerCase().includes('luxury');
  const primaryCustom = defaults
    && normalizeHex(brandKit.primary_color, defaults.primary_color) !== normalizeHex(defaults.primary_color);
  const accentCustom = defaults
    && normalizeHex(brandKit.accent_color, defaults.accent_color) !== normalizeHex(defaults.accent_color);
  const pageBgCustom = defaults
    && normalizeHex(brandKit.page_background, defaults.page_background) !== normalizeHex(defaults.page_background);
  const buttonCustom = defaults
    && (brandKit.button_shape || 'rounded') !== (defaults.button_shape || 'rounded');
  const anyColorCustom = primaryCustom || accentCustom || pageBgCustom || buttonCustom;
  const logoChipMode = brandKit?.essentials?.logo_chip_mode || 'auto';

  return (
    <div className="relative border-t border-slate-200/80 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent"
        aria-hidden="true"
      />
      <div className="space-y-3 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Brand layer</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-800">Template colors</p>
            <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
              Applied to this page. Changes update the live preview.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-slate-200/90 bg-white/90 p-0.5 shadow-[0_6px_16px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo || !onUndo}
              title="Undo"
              aria-label="Undo"
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Undo2 size={14} />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo || !onRedo}
              title="Redo"
              aria-label="Redo"
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Redo2 size={14} />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <Field label="Business name">
            <input
              value={brandKit.business_name || ''}
              onChange={(event) => onChange({ business_name: event.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Palette</p>
          <div className="space-y-2">
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
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Shape</p>
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
          {isLuxuryTemplate ? (
            <div className="mt-2">
              <Field label="Logo visibility (dark header)">
                <BuilderSelect
                  value={logoChipMode}
                  options={[
                    { value: 'auto', label: 'Auto (recommended)' },
                    { value: 'strong', label: 'Strong chip' },
                    { value: 'soft', label: 'Soft chip' },
                    { value: 'off', label: 'Off' },
                  ]}
                  onChange={(value) => onChange({ essentials: { ...(brandKit?.essentials || {}), logo_chip_mode: value } })}
                  ariaLabel="Logo visibility mode"
                />
              </Field>
            </div>
          ) : null}
        </div>

        <div className="space-y-1.5 border-t border-slate-200/80 pt-2.5">
          <button
            type="button"
            disabled={!anyColorCustom || !onResetTemplateColors}
            onClick={onResetTemplateColors}
            className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Reset colors to defaults
          </button>
          <button
            type="button"
            disabled={!onResetTemplateDefaults || !canResetTemplateDefaults}
            onClick={onResetTemplateDefaults}
            className="w-full rounded-xl border border-slate-300 bg-slate-950 px-2.5 py-2 text-[11px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Reset layout &amp; colors
          </button>
          <p className="text-[9px] leading-3.5 text-slate-400">
            Layout reset restores this template’s original sections, styles, card colors, and default copy. Business name and brand media stay.
          </p>
        </div>
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
  const templateEntitlementsQuery = useStorefrontTemplateEntitlements();
  const templateAccessById = new Map(
    (templateEntitlementsQuery.data?.templates || []).map((template) => [template.template_id, template]),
  );

  const accessForTemplate = (template) => templateAccessById.get(template.id) || fallbackTemplateAccess(template);
  const templateTierOrder = { free: 0, basic: 1, standard: 2, premium: 3 };
  const orderedTemplates = [...templates].sort((left, right) => {
    const leftTier = accessForTemplate(left).tier || 'premium';
    const rightTier = accessForTemplate(right).tier || 'premium';
    const tierDiff = (templateTierOrder[leftTier] ?? 99) - (templateTierOrder[rightTier] ?? 99);
    if (tierDiff !== 0) return tierDiff;
    return templates.indexOf(left) - templates.indexOf(right);
  });

  const handleTemplateSelect = (template) => {
    if (template.id === templateKey) return;
    onTemplateChange(template.id);
  };

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
    <div className="relative min-h-full bg-[radial-gradient(ellipse_at_top,_rgba(148,163,184,0.14),_transparent_42%),linear-gradient(180deg,#f4f6f9_0%,#eef2f7_100%)] p-3">
      <div
        className="pointer-events-none absolute inset-x-6 top-0 h-24 bg-[radial-gradient(ellipse_at_center,_rgba(15,23,42,0.05),_transparent_70%)]"
        aria-hidden="true"
      />

      {/* Intro section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white">
              <Sparkles size={9} className="text-amber-200" />
              Design studio
            </div>
            <h2 className="mt-2 whitespace-nowrap text-[15px] font-bold tracking-[-0.02em] text-slate-950">
              Choose a template
            </h2>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              Select a theme, then refine brand colors below.
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-center">
            <p className="text-sm font-bold tabular-nums leading-none text-slate-950">{templates.length}</p>
            <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">themes</p>
          </div>
        </div>
      </section>

      {/* Templates section */}
      <section className="relative mt-3.5">
        <div className="mb-2 flex items-end justify-between gap-2 px-0.5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Themes</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-700">Template gallery</p>
          </div>
          <p className="text-[9px] font-medium text-slate-400">Tap to apply</p>
        </div>

        <div className="space-y-2.5">
          {orderedTemplates.map((template) => {
            const active = template.id === templateKey;
            const expanded = active && expandedTemplateId === template.id;
            const copy = galleryCopyForTemplate(template);
            const access = accessForTemplate(template);
            const locked = !access.unlocked;
            const tierLabel = access.tier
              ? `${access.tier[0].toUpperCase()}${access.tier.slice(1)}`
              : '';
            const primary = active ? brandKit.primary_color : template.brand.primary_color;
            const accent = active ? brandKit.accent_color : template.brand.accent_color;
            const canvas = active
              ? (brandKit.page_background || '#ffffff')
              : (template.brand.page_background || '#ffffff');
            const fontName = active ? (brandKit.font || template.brand.font) : template.brand.font;

            return (
              <div
                key={template.id}
                className={`group/card relative overflow-hidden rounded-[1.25rem] border bg-white transition duration-300 ${
                  active
                    ? 'shadow-[0_18px_40px_rgba(15,23,42,0.14)]'
                    : 'border-white/80 shadow-[0_10px_28px_rgba(15,23,42,0.07)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.12)]'
                }`}
                style={active ? { borderColor: primary, boxShadow: `0 18px 40px rgba(15,23,42,0.14), 0 0 0 1px ${primary}` } : undefined}
              >
                {active ? (
                  <div
                    className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-50"
                    style={{ background: `radial-gradient(circle, ${accent}40, transparent 68%)` }}
                    aria-hidden="true"
                  />
                ) : null}

                <button
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  aria-pressed={active}
                  aria-expanded={active}
                  className="relative w-full text-left text-slate-900"
                >
                  <div
                    className="relative h-12 overflow-hidden"
                    style={{
                      background: `linear-gradient(128deg, ${primary} 0%, color-mix(in srgb, ${primary} 55%, ${accent}) 48%, ${accent} 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_42%),linear-gradient(90deg,rgba(0,0,0,0.18),transparent_50%)]" />
                    <div className="absolute left-3.5 top-3 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/85 shadow-sm" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white/55" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                    </div>
                    <div
                      className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="relative p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="text-[13px] font-bold leading-4 tracking-[-0.02em]"
                          style={{
                            fontFamily: fontName,
                            color: primary,
                          }}
                        >
                          {copy.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] ${
                            access.unlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {access.unlocked ? (access.display_amount || 'Unlocked') : `${tierLabel} · ${access.display_amount}`}
                          </span>
                          <p className="text-[10px] leading-4 text-slate-500">
                            {copy.tagline}
                          </p>
                        </div>
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
                            className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] transition hover:bg-slate-50"
                            style={{ borderColor: `${primary}33`, color: primary }}
                          >
                            {expanded ? 'Colors' : 'Refine'}
                            <ChevronDown
                              size={11}
                              className={`transition ${expanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        ) : null}
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full border transition ${
                            active
                              ? 'text-white shadow-[0_6px_14px_rgba(15,23,42,0.18)]'
                              : locked
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-white text-transparent group-hover/card:border-slate-300'
                          }`}
                          style={active
                            ? { background: primary, borderColor: primary }
                            : locked
                              ? { borderColor: '#f59e0b55' }
                              : { borderColor: `${primary}55` }}
                        >
                          {locked ? (
                            <Lock size={11} strokeWidth={2.8} />
                          ) : (
                            <Check size={12} strokeWidth={3} />
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <div className="flex items-center gap-1.5">
                        {[primary, accent, canvas].map((swatch, index) => (
                          <span
                            key={`${template.id}-swatch-${index}`}
                            className="h-3.5 w-3.5 rounded-full ring-1 ring-black/15 ring-offset-1 ring-offset-white"
                            style={{ background: swatch }}
                            title={index === 2 ? 'Page background' : undefined}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-semibold tracking-wide text-slate-400">
                        Aa · {fontName}
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
      </section>
    </div>
  );
}
