'use client';

import { buildTrackedCalendlyUrl } from '@/lib/publicProfileLinks';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  lawyerClassicItemSurface,
  lawyerClassicPaddingClass,
  lawyerClassicToneClass,
  resolveLawyerClassicIcon,
  resolveLawyerClassicItems,
} from '../shared/lawyerSectionUtils';

const CONSULTATION_FALLBACK = [
  { title: 'Send an inquiry', description: 'Share the property, documents, and closing date so the first response is useful.', cta_label: 'Submit inquiry', action: 'inquiry' },
  { title: 'Book a consultation', description: 'Request time to walk through the agreement, title issues, or closing requirements.', cta_label: 'Make an appointment', action: 'appointment' },
  { title: 'Request document review', description: 'Ask for a focused review of a contract, amendment, or closing package.', cta_label: 'Request review', action: 'inquiry' },
];
const CONSULTATION_ICON_KEYS = ['message', 'calendar', 'contract', 'handshake'];

export function LawyerClassicConsultationOptions({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const hasPersistedItems = Object.prototype.hasOwnProperty.call(content, 'items') && Array.isArray(content.items);
  const items = resolveLawyerClassicItems(content, CONSULTATION_FALLBACK, 3);
  const columns = block?.data?.layout?.columns || block?.layout?.columns || '3';
  const padding = block?.data?.layout?.padding || block?.layout?.padding || 'medium';
  const calendlyUrl = buildTrackedCalendlyUrl(
    profile?.professional_profile?.calendly_link,
    profile,
  );
  const activate = (item) => {
    if (item.action === 'appointment') {
      if (calendlyUrl) {
        window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
        actions.onAppointmentClick?.();
        return;
      }
      actions.onCtaClick?.('book_consultation');
      return;
    }
    actions.onDirectLeadClick?.();
  };

  return (
    <div id="start" className={`w-full max-w-none bg-transparent px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(padding)}`}>
      <div className="w-full max-w-none">
        <div className="max-w-3xl" data-storefront-anim-item="true">
          <EditableText as="p" field="content.eyebrow" label="Consultation eyebrow" source={content.eyebrow ? 'persisted' : 'fallback'} className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
            {content.eyebrow || 'Start the conversation'}
          </EditableText>
          <EditableText as="h2" field="content.heading" label="Consultation heading" source={content.heading ? 'persisted' : 'fallback'} className="mt-3 text-3xl font-semibold uppercase tracking-[-0.02em] text-primary sm:text-4xl">
            {content.heading || 'Choose how you would like to begin'}
          </EditableText>
          <EditableText as="p" field="content.body" label="Consultation description" source={content.body ? 'persisted' : 'fallback'} className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            {content.body || 'Pick the path that matches your timeline. Confidential details should wait until the lawyer confirms representation.'}
          </EditableText>
          <div className="mt-5 h-0.5 w-16 bg-accent" />
        </div>
        {items.length ? (
          <div className={`mt-12 grid gap-4 ${lawyerClassicGridClass(columns, items.length)}`}>
            {items.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, CONSULTATION_ICON_KEYS);
              return (
                <article
                  key={item.id}
                  data-storefront-anim-item="true"
                  data-storefront-anim-hover="lift"
                  data-storefront-field="content.items"
                  data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
                  data-storefront-collection="items"
                  data-storefront-item-id={item.id}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  data-storefront-label={`Consultation option ${index + 1}`}
                  className="flex h-full flex-col border border-primary/15 bg-white/80 p-7 shadow-[0_14px_36px_rgba(15,23,42,.05)]"
                  style={lawyerClassicItemSurface(item)}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center bg-primary text-primary-contrast">
                      <Icon size={19} />
                    </span>
                    <h3 className={`text-lg font-semibold leading-tight ${lawyerClassicToneClass(item.text_color, 'text-primary')}`}>{item.title}</h3>
                  </div>
                  {item.description ? (
                    <EditableText as="p" field="content.items" label={`Consultation option ${index + 1} description`} source={hasPersistedItems ? 'persisted' : 'fallback'} collection="items" itemId={item.id} itemIndex={index} itemField="description" className={`mt-5 flex-1 text-sm leading-6 ${lawyerClassicToneClass(item.text_color, 'text-slate-500')}`}>
                      {item.description}
                    </EditableText>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => activate(item)}
                    data-storefront-item-field="cta_label"
                    className="storefront-btn mt-7 inline-flex min-h-11 items-center justify-center border border-accent bg-accent px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-contrast"
                  >
                    {item.cta_label || 'Get started'}
                  </button>
                </article>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-12 border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center text-sm text-slate-500">Add consultation options in the Content panel.</div>
        ) : null}
      </div>
    </div>
  );
}
