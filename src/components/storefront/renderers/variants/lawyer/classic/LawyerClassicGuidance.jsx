'use client';

import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  lawyerClassicResolvedPaddingClass,
  lawyerClassicSectionStyle,
  resolveLawyerClassicIcon,
} from '../shared/lawyerSectionUtils';

const GUIDE_ICON_KEYS = ['notebook', 'contract', 'shield', 'scale', 'landmark', 'gavel'];

export function LawyerClassicGuidance({ block, profile }) {
  const content = blockContent(block);
  const processCardBackground = content.process_card_background || '';
  const processCardTextColor = content.process_card_text_color || '';
  const hasPersistedSteps = Object.prototype.hasOwnProperty.call(content, 'steps')
    && Array.isArray(content.steps);
  const items = (hasPersistedSteps
    ? content.steps
    : [
        { title: 'Review the transaction', text: 'Share the property, agreement, financing, and closing timeline.' },
        { title: 'Resolve legal requirements', text: 'Identify document, title, registration, and signing requirements early.' },
        { title: 'Prepare for closing', text: 'Complete the final review, funds, signatures, and registration with clarity.' },
      ])
    .filter((item) => item && typeof item === 'object' && item.title)
    .map((item) => ({ ...item, text: item.text ?? item.description ?? '' }))
    .slice(0, 6);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const columns = block?.data?.layout?.columns || block?.layout?.columns || '3';
  const padding = block?.data?.layout?.padding || block?.layout?.padding || 'medium';
  const sectionStyle = lawyerClassicSectionStyle(block);
  const usesLayeredSectionStyle = [
    'lawyer-first-home-closing',
    'lawyer-investor',
  ].includes(profile?.storefront_template_key);
  const hasCustomText = usesLayeredSectionStyle && Boolean(String(sectionStyle.textColor || '').trim());

  return (
    <div
      id="guidance"
      className={`w-full max-w-none bg-transparent px-5 sm:px-6 lg:px-8 ${lawyerClassicResolvedPaddingClass(padding, 'py-20')}`}
      style={usesLayeredSectionStyle ? {
        ...(sectionStyle.background ? { backgroundColor: sectionStyle.background } : {}),
        ...(sectionStyle.textColor ? { color: sectionStyle.textColor } : {}),
      } : undefined}
    >
      <div className="w-full max-w-none">
        <div className="pb-9" data-storefront-anim-item="true">
          <div className="max-w-3xl">
            <EditableText
              as="p"
              field="content.eyebrow"
              label="Guidance eyebrow"
              source={content.eyebrow ? 'persisted' : 'fallback'}
              className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
            >
              {content.eyebrow || 'Legal insights'}
            </EditableText>
            <EditableText
              as="h2"
              field="content.heading"
              label="Guidance heading"
              source={content.heading ? 'persisted' : 'fallback'}
              className={`mt-3 text-2xl font-semibold uppercase tracking-[-0.02em] sm:text-3xl ${hasCustomText ? 'text-current' : 'text-primary'}`}
            >
              {content.heading || 'Your closing guide'}
            </EditableText>
            <EditableText
              as="p"
              field="content.body"
              label="Guidance description"
              source={content.body ? 'persisted' : 'fallback'}
              className={`mt-4 max-w-2xl text-sm leading-7 ${hasCustomText ? 'text-current opacity-70' : 'text-slate-500'}`}
            >
              {content.body || 'A practical path from accepted offer to final registration and keys.'}
            </EditableText>
            <div className="mt-6 h-0.5 w-16 bg-accent" />
          </div>
        </div>

        {items.length ? (
        <div className={`relative mt-12 grid gap-4 ${lawyerClassicGridClass(columns, items.length)}`}>
          {items.map((item, index) => {
            const Icon = resolveLawyerClassicIcon(item, index, GUIDE_ICON_KEYS);
            const cardTextColor = item.text_color || processCardTextColor;
            return (
              <article
                key={item.id || `${item.title}-${index}`}
                data-storefront-anim-item="true"
                data-storefront-anim-hover="lift"
                className="group relative min-h-52 overflow-hidden border border-slate-200/90 bg-white/75 p-6 shadow-[0_12px_32px_rgba(15,23,42,.05)] transition hover:border-accent/60 hover:bg-white"
                style={{
                  background: item.background || processCardBackground || undefined,
                  color: cardTextColor || undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center bg-accent text-accent-contrast shadow-[0_6px_18px_rgba(0,0,0,.1)]">
                    <Icon size={19} />
                  </span>
                  <EditableText
                    as="h3"
                    field="content.steps"
                    label={`Guidance step ${index + 1} title`}
                    source={hasPersistedSteps ? 'persisted' : 'fallback'}
                    collection="steps"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="title"
                    className={`min-w-0 flex-1 text-lg font-semibold leading-tight ${cardTextColor ? 'text-current' : 'text-slate-900'}`}
                  >
                    {item.title}
                  </EditableText>
                  <span className={`shrink-0 text-[9px] font-bold uppercase tracking-[0.16em] ${cardTextColor ? 'text-current opacity-50' : 'text-slate-400'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <EditableText
                  as="p"
                  field="content.steps"
                  label={`Guidance step ${index + 1} description`}
                  source={hasPersistedSteps ? 'persisted' : 'fallback'}
                  collection="steps"
                  itemId={item.id}
                  itemIndex={index}
                  itemField="text"
                  className={`mt-5 text-sm leading-7 ${cardTextColor ? 'text-current opacity-70' : 'text-slate-500'}`}
                >
                  {item.text || item.description}
                </EditableText>
              </article>
            );
          })}
        </div>
        ) : isPreview ? (
          <div className="mt-12 border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center text-sm text-slate-500">
            Add up to six guidance steps in the Content panel.
          </div>
        ) : null}

      </div>
    </div>
  );
}
