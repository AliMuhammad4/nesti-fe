'use client';

import { Scale } from 'lucide-react';
import { getRoleDetailsDefaults } from '@/components/public-profile/PublicRoleDetailSection';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicBandColors,
  lawyerClassicGridClass,
  lawyerClassicResolvedPaddingClass,
  resolveLawyerClassicIcon,
} from '../shared/lawyerSectionUtils';

const STATEMENT_ICON_KEYS = ['contract', 'shield', 'landmark', 'scale', 'file', 'gavel'];

export function LawyerClassicStatement({ profile, block, actions = {} }) {
  const content = blockContent(block);
  const defaults = getRoleDetailsDefaults('lawyer');
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const sectionStyle = block?.data?.style || block?.style || {};
  const band = lawyerClassicBandColors(sectionStyle, {
    themeBackground: 'var(--storefront-primary, #24211e)',
    fallbackDark: '#24211e',
  });
  const statementBackground = band.background;
  const statementTextColor = band.color;
  const padding = block?.data?.layout?.padding || block?.layout?.padding;
  const columns = block?.data?.layout?.columns || block?.layout?.columns || '3';
  const eyebrow = String(content.eyebrow || '').trim() || defaults.eyebrow;
  const heading = String(content.heading || content.title || '').trim() || defaults.title;
  const body = String(content.body || content.description || '').trim() || defaults.description;
  const hasPersistedHighlights = Object.prototype.hasOwnProperty.call(content, 'highlights')
    && Array.isArray(content.highlights);
  const highlights = (hasPersistedHighlights ? content.highlights : defaults.highlights)
    .map((item, index) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const [title = '', text = ''] = item.split('|').map((part) => part.trim());
        return title ? { id: `highlight-${index}`, title, text } : null;
      }
      const title = String(item.title || '').trim();
      if (!title) return null;
      return {
        id: item.id || `highlight-${index}`,
        title,
        text: item.text || item.description || '',
        background: item.background || '',
        text_color: item.text_color || '',
        icon: item.icon || '',
      };
    })
    .filter(Boolean)
    .slice(0, 6);
  return (
    <div
      id="buyer-protection"
      className={`lawyer-classic-statement relative w-full max-w-none overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicResolvedPaddingClass(padding, 'py-16 sm:py-20')}`}
      style={{
        backgroundColor: statementBackground,
        color: statementTextColor,
      }}
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div data-storefront-anim-item="true">
            <EditableText
              as="p"
              field="content.eyebrow"
              label="Statement eyebrow"
              source={content.eyebrow ? 'persisted' : 'fallback'}
              className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent"
            >
              {eyebrow}
            </EditableText>
            <EditableText
              as="h2"
              field="content.heading"
              label="Statement heading"
              source={content.heading || content.title ? 'persisted' : 'fallback'}
              className="mt-4 max-w-3xl text-3xl font-semibold uppercase leading-[1.12] text-current sm:text-4xl"
            >
              {heading}
            </EditableText>
            <EditableText
              as="p"
              field="content.body"
              label="Statement description"
              source={content.body || content.description ? 'persisted' : 'fallback'}
              className="mt-5 max-w-2xl text-sm leading-7 text-current opacity-70 sm:text-base"
            >
              {body}
            </EditableText>
          </div>
          <button
            type="button"
            onClick={actions.onDirectLeadClick}
            data-storefront-anim-item="true"
            data-storefront-field="content.cta_label"
            data-storefront-source={content.cta_label ? 'persisted' : 'fallback'}
            data-storefront-label="Statement button"
            className="storefront-btn inline-flex min-h-14 shrink-0 items-center justify-center gap-2 bg-accent px-8 text-xs font-bold uppercase tracking-[0.15em] text-accent-contrast transition hover:-translate-y-1 hover:brightness-105"
          >
            <Scale size={17} />
            {content.cta_label || 'Discuss your matter'}
          </button>
        </div>

        {highlights.length ? (
          <div className={`mt-12 grid gap-3 ${lawyerClassicGridClass(columns, highlights.length)}`}>
            {highlights.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, STATEMENT_ICON_KEYS);
              return (
                <article
                  key={item.id}
                  data-storefront-anim-item="true"
                  data-storefront-anim-hover="lift"
                  data-storefront-field="content.highlights"
                  data-storefront-source={hasPersistedHighlights ? 'persisted' : 'fallback'}
                  data-storefront-collection="highlights"
                  data-storefront-item-id={item.id}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  data-storefront-label={`Highlight ${index + 1}`}
                  className="bg-white/[0.055] p-6 transition-colors hover:bg-white/[0.09]"
                  style={{
                    background: item.background || undefined,
                    color: item.text_color || undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center bg-accent/10 text-accent">
                      <Icon size={18} />
                    </span>
                    <h3 className="min-w-0 text-lg font-semibold leading-tight text-current">{item.title}</h3>
                  </div>
                  {item.text ? (
                    <EditableText
                      as="p"
                      field="content.highlights"
                      label={`Highlight ${index + 1} description`}
                      source={hasPersistedHighlights ? 'persisted' : 'fallback'}
                      collection="highlights"
                      itemId={item.id}
                      itemIndex={index}
                      itemField="text"
                      className="mt-3 text-sm leading-6 text-current opacity-70"
                    >
                      {item.text}
                    </EditableText>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-10 border border-dashed border-white/20 px-6 py-12 text-center text-sm text-current/55">
            Add highlight cards in the Content panel.
          </div>
        ) : null}
      </div>
    </div>
  );
}
