'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Building2, ShieldCheck } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerContentSource,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from './BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentValue,
  brokerContentRegionClass,
  brokerSectionPaddingClass,
  normalizedItems,
  transparentSectionPresentation,
} from './brokerSectionUtils';
import { LENDER_BANK_PRESETS } from './lenderBankPresets';
import {
  lenderInitials,
  lenderLogoDevUrl,
  lenderWebsiteHref,
  resolveLenderDomain,
} from './lenderLogoUtils';

const LENDER_FALLBACK = LENDER_BANK_PRESETS.slice(0, 12).map((preset) => ({
  id: `lender-${preset.id}`,
  title: preset.title,
  category: preset.category,
  domain: preset.domain,
  preset_key: preset.id,
  description: '',
}));

function LenderLogo({ item, size = 72 }) {
  const [failed, setFailed] = useState(false);
  const domain = resolveLenderDomain(item);
  const src = item.logo_url || lenderLogoDevUrl(domain);
  const title = item.title || item.name || 'Lender';

  if (!src || failed) {
    return (
      <span
        className="grid place-items-center font-bold tracking-wide text-[color:var(--storefront-primary,#102A43)]"
        style={{ height: size, width: size, fontSize: Math.max(14, Math.round(size / 4)) }}
      >
        {lenderInitials(title)}
      </span>
    );
  }

  return (
    <span
      className="relative flex items-center justify-center"
      style={{ height: size, width: size }}
    >
      <Image
        src={src}
        alt={`${title} logo`}
        width={size}
        height={size}
        unoptimized
        className="object-contain"
        style={{ height: size, width: size }}
        onError={() => setFailed(true)}
      />
    </span>
  );
}

function FirstHomeLenderCard({ item, index, hasPersisted, isPreview, href }) {
  const title = item.title || item.name || 'Lender';
  const category = item.category || '';
  const selectionAttrs = {
    'data-storefront-field': 'content.items',
    'data-storefront-source': hasPersisted ? 'persisted' : 'fallback',
    'data-storefront-label': `Lender ${index + 1}`,
    'data-storefront-collection': 'items',
    'data-storefront-item-id': item.id,
    'data-storefront-item-index': index,
    'data-storefront-item-field': 'title',
  };

  const inner = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-transparent via-[color:var(--storefront-accent,#1B4B73)]/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:via-[color:var(--storefront-accent,#1B4B73)]/60 group-hover:opacity-100"
      />
      <span className="grid h-[96px] w-full place-items-center overflow-hidden rounded-xl bg-gradient-to-b from-[#f7f9fb] via-white to-white ring-1 ring-[#d7e3ee]/70 transition-all duration-300 group-hover:ring-[color:var(--storefront-accent,#1B4B73)]/40">
        <LenderLogo item={item} size={72} />
      </span>
      <div className="mt-4 flex w-full flex-col items-center gap-1">
        <EditableText
          as="h3"
          field="content.items"
          label={`Lender ${index + 1} name`}
          source={hasPersisted ? 'persisted' : 'fallback'}
          collection="items"
          itemId={item.id}
          itemIndex={index}
          itemField="title"
          className="text-[14px] font-semibold leading-tight tracking-[-0.01em] text-[color:var(--storefront-primary,#102A43)]"
        >
          {title}
        </EditableText>
        {category ? (
          <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#5B7186]">
            {category}
          </span>
        ) : null}
      </div>
    </>
  );

  const cardClass = 'group relative flex flex-col items-center overflow-hidden rounded-2xl border border-[#e2ecf5] bg-white p-5 text-center shadow-[0_2px_4px_rgba(16,42,67,0.03),0_10px_28px_rgba(16,42,67,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--storefront-accent,#1B4B73)]/25 hover:shadow-[0_4px_10px_rgba(16,42,67,0.06),0_22px_44px_rgba(16,42,67,0.10)]';

  if (href && !isPreview) {
    return (
      <a
        key={item.id}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
        aria-label={`Visit ${title}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <article
      key={item.id}
      className={cardClass}
      {...selectionAttrs}
    >
      {inner}
    </article>
  );
}

function ClassicLenderCard({ item, index, hasPersisted, isPreview, href }) {
  const title = item.title || item.name || 'Lender';
  const selectionAttrs = {
    'data-storefront-field': 'content.items',
    'data-storefront-source': hasPersisted ? 'persisted' : 'fallback',
    'data-storefront-label': `Lender ${index + 1}`,
    'data-storefront-collection': 'items',
    'data-storefront-item-id': item.id,
    'data-storefront-item-index': index,
    'data-storefront-item-field': 'title',
  };

  const inner = (
    <>
      <span className="grid h-[96px] w-full max-w-[140px] place-items-center rounded-xl bg-gradient-to-b from-slate-50 to-white px-3 ring-1 ring-slate-100/90">
        <LenderLogo item={item} size={72} />
      </span>
      <EditableText
        as="h3"
        field="content.items"
        label={`Lender ${index + 1} name`}
        source={hasPersisted ? 'persisted' : 'fallback'}
        collection="items"
        itemId={item.id}
        itemIndex={index}
        itemField="title"
        className="text-sm font-semibold leading-tight tracking-[-0.01em] text-[color:var(--storefront-primary,#0c2139)]"
      >
        {title}
      </EditableText>
    </>
  );

  const cardClass = 'group flex min-h-[168px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-5 text-center shadow-[0_8px_28px_rgba(12,33,57,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--storefront-accent,#008fd5)]/30 hover:shadow-[0_14px_36px_rgba(12,33,57,0.10)]';

  if (href && !isPreview) {
    return (
      <a
        key={item.id}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
        aria-label={`Visit ${title}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <article
      key={item.id}
      className={cardClass}
      {...selectionAttrs}
    >
      {inner}
    </article>
  );
}

export function BrokerClassicLenders({ profile, block, appearance = 'classic' }) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '1');
  const { items, hasPersisted } = normalizedItems(content, LENDER_FALLBACK, 'items', 24);
  const note = brokerContentValue(
    content,
    'disclaimer',
    'Lender availability varies by province, product, and borrower profile. Logos identify institutions for reference only.',
  );

  const isFirstHome = appearance === 'first-home';

  if (isFirstHome) {
    const totalCount = items.length;

    return (
      <section
        id="lenders"
        className={`relative overflow-hidden px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
        style={{
          background: 'linear-gradient(180deg, #f4f7fb 0%, #eef3f7 100%)',
          color: presentation.color,
        }}
      >
        {/* Subtle decorative accents */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 8%, rgba(27,75,115,0.06), transparent 42%), radial-gradient(circle at 92% 100%, rgba(16,42,67,0.05), transparent 46%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,42,67,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16,42,67,0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 78%)',
          }}
        />

        <div className="relative w-full max-w-none">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
            <BrokerSectionHeading
              align={presentation.headingAlignment}
              content={content}
              eyebrow="Lender access"
              heading="More options than a single branch"
              body="Compare products across banks, credit unions, and specialty lenders suited to first-time buyers."
              bodyClassName="max-w-2xl"
            />
            {totalCount ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e3ee] bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#102A43] shadow-[0_2px_8px_rgba(16,42,67,0.05)]">
                  <Building2 size={13} strokeWidth={2.3} className="text-[color:var(--storefront-accent,#1B4B73)]" />
                  {totalCount} {totalCount === 1 ? 'lender' : 'lenders'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e3ee] bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#102A43] shadow-[0_2px_8px_rgba(16,42,67,0.05)]">
                  <ShieldCheck size={13} strokeWidth={2.3} className="text-[color:var(--storefront-accent,#1B4B73)]" />
                  Vetted partners
                </span>
              </div>
            ) : null}
          </div>

          {items.length ? (
            <div
              className={`mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6 ${brokerContentRegionClass(presentation.contentAlignment)}`}
              data-storefront-anim-item="true"
            >
              {items.map((item, index) => (
                <FirstHomeLenderCard
                  key={item.id}
                  item={item}
                  index={index}
                  hasPersisted={hasPersisted}
                  isPreview={isPreview}
                  href={lenderWebsiteHref(item)}
                />
              ))}
            </div>
          ) : isPreview ? (
            <div className="mt-10 rounded-2xl border border-dashed border-[#d7e3ee] bg-white/80 px-6 py-12 text-center text-sm text-slate-500">
              Add banks in the Content panel. Choose from the preset list or add a custom bank with name and website URL.
            </div>
          ) : null}

          <EditableText
            as="p"
            field="content.disclaimer"
            label="Lender network note"
            source={lawyerContentSource(content, 'disclaimer')}
            className="mt-8 max-w-3xl text-[11px] leading-5 text-[#5B7186]"
          >
            {note}
          </EditableText>
        </div>
      </section>
    );
  }

  return (
    <section
      id="lenders"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow="Lender network"
          heading="Access to Canada’s leading lenders"
          body="A curated network across major banks, credit unions, and alternative lenders — matched to your file, not a one-size product."
          bodyClassName="mx-auto max-w-none lg:whitespace-nowrap"
        />

        {items.length ? (
          <div
            className={`mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 ${brokerContentRegionClass(presentation.contentAlignment)}`}
            data-storefront-anim-item="true"
          >
            {items.map((item, index) => (
              <ClassicLenderCard
                key={item.id}
                item={item}
                index={index}
                hasPersisted={hasPersisted}
                isPreview={isPreview}
                href={lenderWebsiteHref(item)}
              />
            ))}
          </div>
        ) : isPreview ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
            Add banks in the Content panel. Enter a name and website URL — logos load automatically.
          </div>
        ) : null}

        <EditableText
          as="p"
          field="content.disclaimer"
          label="Lender network note"
          source={lawyerContentSource(content, 'disclaimer')}
          className="mt-5 max-w-3xl text-[11px] leading-5 text-slate-500"
        >
          {note}
        </EditableText>
      </div>
    </section>
  );
}
