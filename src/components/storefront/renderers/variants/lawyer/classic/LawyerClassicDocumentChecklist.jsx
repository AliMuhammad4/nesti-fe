'use client';

import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  lawyerClassicHasColor,
  lawyerClassicItemSurface,
  lawyerClassicPaddingClass,
  lawyerClassicSectionStyle,
  lawyerClassicToneClass,
  resolveLawyerClassicItems,
} from '../shared/lawyerSectionUtils';

const DOCUMENT_FALLBACK = [
  { title: 'Agreement of purchase and sale', description: 'The signed offer, amendments, and any waivers or notices already exchanged.' },
  { title: 'Identification and parties', description: 'Legal names, contact details, and how title should be taken if that is already decided.' },
  { title: 'Financing documents', description: 'Mortgage commitment, payout statement, or private lending details if they exist.' },
  { title: 'Property and title papers', description: 'Listing details, survey, status certificate, or prior title documents you already have.' },
];

export function LawyerClassicDocumentChecklist({ profile, block }) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const hasPersistedItems = Object.prototype.hasOwnProperty.call(content, 'items') && Array.isArray(content.items);
  const items = resolveLawyerClassicItems(content, DOCUMENT_FALLBACK, 8);
  const columns = block?.data?.layout?.columns || block?.layout?.columns || '2';
  const padding = block?.data?.layout?.padding || block?.layout?.padding || 'medium';
  const sectionStyle = lawyerClassicSectionStyle(block);
  const customSectionBackground = lawyerClassicHasColor(sectionStyle.background);

  return (
    <div id="documents" className={`w-full max-w-none border-y border-primary/10 px-5 sm:px-8 lg:px-12 xl:px-16 ${customSectionBackground ? 'bg-transparent' : 'bg-[color-mix(in_srgb,var(--storefront-canvas,#f2f1ef)_92%,#ffffff)]'} ${lawyerClassicPaddingClass(padding)}`}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.2fr)] lg:items-start">
        <div data-storefront-anim-item="true">
          <EditableText as="p" field="content.eyebrow" label="Documents eyebrow" source={content.eyebrow ? 'persisted' : 'fallback'} className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
            {content.eyebrow || 'File preparation'}
          </EditableText>
          <EditableText as="h2" field="content.heading" label="Documents heading" source={content.heading ? 'persisted' : 'fallback'} className="mt-3 text-3xl font-semibold uppercase tracking-[-0.02em] text-primary sm:text-4xl">
            {content.heading || 'What to send before we speak'}
          </EditableText>
          <EditableText as="p" field="content.body" label="Documents description" source={content.body ? 'persisted' : 'fallback'} className="mt-4 text-sm leading-7 text-slate-500">
            {content.body || 'A complete file helps the lawyer understand the matter without asking you to repeat the basics.'}
          </EditableText>
          <div className="mt-5 h-0.5 w-16 bg-accent" />
          <EditableText as="p" field="content.helper_text" label="Documents helper text" source={content.helper_text ? 'persisted' : 'fallback'} className="mt-6 border-l-2 border-accent pl-4 text-sm leading-6 text-slate-600">
            {content.helper_text || 'Send copies, not originals, until representation is confirmed.'}
          </EditableText>
        </div>
        {items.length ? (
          <div className={`grid gap-3 ${lawyerClassicGridClass(columns, items.length)}`}>
            {items.map((item, index) => (
              <article
                key={item.id}
                data-storefront-anim-item="true"
                data-storefront-field="content.items"
                data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
                data-storefront-collection="items"
                data-storefront-item-id={item.id}
                data-storefront-item-index={index}
                data-storefront-item-field="title"
                data-storefront-label={`Document ${index + 1}`}
                className="flex gap-4 border border-primary/15 bg-white/80 p-5"
                style={lawyerClassicItemSurface(item)}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center border border-accent bg-accent text-[11px] font-bold text-accent-contrast">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <h3 className={`text-base font-semibold ${lawyerClassicToneClass(item.text_color, 'text-primary')}`}>{item.title}</h3>
                  {item.description ? (
                    <EditableText as="p" field="content.items" label={`Document ${index + 1} description`} source={hasPersistedItems ? 'persisted' : 'fallback'} collection="items" itemId={item.id} itemIndex={index} itemField="description" className={`mt-2 text-sm leading-6 ${lawyerClassicToneClass(item.text_color, 'text-slate-500')}`}>
                      {item.description}
                    </EditableText>
                  ) : null}
                </span>
              </article>
            ))}
          </div>
        ) : isPreview ? (
          <div className="border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center text-sm text-slate-500">Add document items in the Content panel.</div>
        ) : null}
      </div>
    </div>
  );
}
