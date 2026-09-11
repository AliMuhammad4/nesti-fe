'use client';

import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicBandColors,
  lawyerClassicGridClass,
  lawyerClassicItemSurface,
  lawyerClassicPaddingClass,
  lawyerClassicToneClass,
  resolveLawyerClassicIcon,
  resolveLawyerClassicItems,
} from '../shared/lawyerSectionUtils';

const FEE_FALLBACK = [
  { title: 'Legal fee range', description: 'Professional time for review, correspondence, signing, and registration is quoted for the specific matter.' },
  { title: 'Disbursements', description: 'Title search, registration, courier, and government charges are typically billed in addition to legal fees.' },
  { title: 'Land transfer and tax', description: 'Purchase files may include land transfer tax and related provincial charges. Final amounts depend on the transaction.' },
];
const FEE_ICON_KEYS = ['scale', 'dollar', 'clipboard', 'landmark'];

export function LawyerClassicFeeGuidance({ profile, block }) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const hasPersistedItems = Object.prototype.hasOwnProperty.call(content, 'items') && Array.isArray(content.items);
  const items = resolveLawyerClassicItems(content, FEE_FALLBACK, 6);
  const columns = block?.data?.layout?.columns || block?.layout?.columns || '3';
  const padding = block?.data?.layout?.padding || block?.layout?.padding || 'medium';
  const sectionStyle = block?.data?.style || block?.style || {};
  const band = lawyerClassicBandColors(sectionStyle, {
    themeBackground: 'var(--storefront-primary, #24211e)',
    fallbackDark: '#24211e',
  });
  const feeBackground = band.background;
  const feeTextColor = band.color;

  return (
    <div
      id="fees"
      className={`relative w-full max-w-none overflow-hidden px-5 sm:px-6 lg:px-8 ${lawyerClassicPaddingClass(padding)}`}
      style={{ backgroundColor: feeBackground, color: feeTextColor }}
    >
      <div className="w-full max-w-none">
        <div className="w-full max-w-none" data-storefront-anim-item="true">
          <EditableText as="p" field="content.eyebrow" label="Fees eyebrow" source={content.eyebrow ? 'persisted' : 'fallback'} className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
            {content.eyebrow || 'Fee transparency'}
          </EditableText>
          <EditableText as="h2" field="content.heading" label="Fees heading" source={content.heading ? 'persisted' : 'fallback'} className={`mt-3 text-3xl font-semibold uppercase leading-[1.12] sm:text-4xl ${band.requestedTextColor ? 'text-current' : 'text-primary-contrast'}`}>
            {content.heading || 'How legal fees are typically framed'}
          </EditableText>
          <EditableText as="p" field="content.body" label="Fees description" source={content.body ? 'persisted' : 'fallback'} className={`mt-4 w-full max-w-none text-sm leading-7 ${band.requestedTextColor ? 'text-current opacity-75' : 'text-primary-contrast/75'}`}>
            {content.body || 'Use this as orientation before a consultation. It is not a quote, retainer, or promise of representation.'}
          </EditableText>
        </div>
        {items.length ? (
          <div className={`mt-12 grid gap-3 ${lawyerClassicGridClass(columns, items.length)}`}>
            {items.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, FEE_ICON_KEYS);
              return (
                <article
                  key={item.id}
                  data-storefront-anim-item="true"
                  className="bg-white/[0.055] p-6 transition-colors hover:bg-white/[0.09]"
                  style={lawyerClassicItemSurface(item)}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center bg-white/[0.06] text-accent">
                      <Icon size={18} />
                    </span>
                    <EditableText as="h3" field="content.items" label={`Fee card ${index + 1} title`} source={hasPersistedItems ? 'persisted' : 'fallback'} collection="items" itemId={item.id} itemIndex={index} itemField="title" className={`text-lg font-semibold leading-tight ${lawyerClassicToneClass(item.text_color || band.requestedTextColor, 'text-primary-contrast')}`}>
                      {item.title}
                    </EditableText>
                  </div>
                  {item.description ? (
                    <EditableText as="p" field="content.items" label={`Fee card ${index + 1} description`} source={hasPersistedItems ? 'persisted' : 'fallback'} collection="items" itemId={item.id} itemIndex={index} itemField="description" className={`mt-5 text-sm leading-6 ${lawyerClassicToneClass(item.text_color || band.requestedTextColor, 'text-primary-contrast/70')}`}>
                      {item.description}
                    </EditableText>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-12 border border-dashed border-white/20 px-6 py-12 text-center text-sm opacity-60">Add fee cards in the Content panel.</div>
        ) : null}
      </div>
    </div>
  );
}
