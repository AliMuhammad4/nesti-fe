'use client';

import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  lawyerClassicItemSurface,
  lawyerClassicPaddingClass,
  lawyerClassicSectionStyle,
  lawyerClassicToneClass,
  resolveLawyerClassicIcon,
  resolveLawyerClassicItems,
} from '../shared/lawyerSectionUtils';

const WHO_WE_HELP_ICON_KEYS = ['home', 'building', 'landmark', 'briefcase', 'users', 'scale'];

const WHO_WE_HELP_FALLBACK = [
  { title: 'Home buyers', description: 'Review the agreement, conditions, title, and closing timeline before you commit.' },
  { title: 'Home sellers', description: 'Clarify obligations, closing funds, discharge, and registration requirements.' },
  { title: 'Refinancing', description: 'Coordinate lender requirements, payout statements, and registration with a clear file.' },
  { title: 'Investors and transfers', description: 'Organize ownership, title, and closing questions around the property at hand.' },
];

export function LawyerClassicWhoWeHelp({ profile, block }) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const hasPersistedItems = Object.prototype.hasOwnProperty.call(content, 'items') && Array.isArray(content.items);
  const items = resolveLawyerClassicItems(content, WHO_WE_HELP_FALLBACK, 6);
  const columns = block?.data?.layout?.columns || block?.layout?.columns || '4';
  const padding = block?.data?.layout?.padding || block?.layout?.padding || 'medium';
  const sectionStyle = lawyerClassicSectionStyle(block);
  const isLawyerFirstHome = profile?.storefront_template_key === 'lawyer-first-home-closing';
  const hasCustomText = isLawyerFirstHome && Boolean(String(sectionStyle.textColor || '').trim());

  return (
    <div
      id="clients"
      className={`w-full max-w-none bg-transparent px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(padding)}`}
      style={isLawyerFirstHome ? {
        ...(sectionStyle.background ? { backgroundColor: sectionStyle.background } : {}),
        ...(sectionStyle.textColor ? { color: sectionStyle.textColor } : {}),
      } : undefined}
    >
      <div className="w-full max-w-none">
        <div className="max-w-5xl" data-storefront-anim-item="true">
          <EditableText as="p" field="content.eyebrow" label="Who we help eyebrow" source={content.eyebrow ? 'persisted' : 'fallback'} className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
            {content.eyebrow || 'Who we help'}
          </EditableText>
          <EditableText as="h2" field="content.heading" label="Who we help heading" source={content.heading ? 'persisted' : 'fallback'} className={`mt-3 text-3xl font-semibold uppercase tracking-[-0.02em] sm:text-4xl lg:whitespace-nowrap ${hasCustomText ? 'text-current' : 'text-primary'}`}>
            {content.heading || 'Counsel for every side of the transaction'}
          </EditableText>
          <EditableText as="p" field="content.body" label="Who we help description" source={content.body ? 'persisted' : 'fallback'} className={`mt-4 max-w-2xl text-sm leading-7 ${hasCustomText ? 'text-current opacity-70' : 'text-slate-500'}`}>
            {content.body || 'Buyers, sellers, refinancers, and property owners can start with a structured inquiry.'}
          </EditableText>
          <div className="mt-5 h-0.5 w-16 bg-accent" />
        </div>
        {items.length ? (
          <div className={`mt-12 grid gap-3 ${lawyerClassicGridClass(columns, items.length)}`}>
            {items.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, WHO_WE_HELP_ICON_KEYS);
              return (
                <article
                  key={item.id}
                  data-storefront-anim-item="true"
                  data-storefront-anim-hover="lift"
                  className="border border-primary/15 bg-transparent p-5 sm:p-6"
                  style={lawyerClassicItemSurface(item)}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center border border-accent/35 bg-transparent text-accent">
                      <Icon size={18} />
                    </span>
                    <EditableText as="h3" field="content.items" label={`Who we help ${index + 1} title`} source={hasPersistedItems ? 'persisted' : 'fallback'} collection="items" itemId={item.id} itemIndex={index} itemField="title" className={`min-w-0 text-base font-semibold leading-tight ${lawyerClassicToneClass(item.text_color, 'text-primary')}`}>
                      {item.title}
                    </EditableText>
                  </div>
                  {item.description ? (
                    <EditableText as="p" field="content.items" label={`Who we help ${index + 1} description`} source={hasPersistedItems ? 'persisted' : 'fallback'} collection="items" itemId={item.id} itemIndex={index} itemField="description" className={`mt-3 text-sm leading-6 ${lawyerClassicToneClass(item.text_color, 'text-slate-500')}`}>
                      {item.description}
                    </EditableText>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-12 border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center text-sm text-slate-500">Add who-we-help cards in the Content panel.</div>
        ) : null}
      </div>
    </div>
  );
}
