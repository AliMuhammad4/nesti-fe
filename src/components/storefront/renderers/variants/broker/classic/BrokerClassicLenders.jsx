'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  brokerFlexContentAlignClass,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  normalizedItems,
  transparentSectionPresentation,
} from './brokerSectionUtils';
import {
  lenderInitials,
  lenderLogoDevUrl,
  lenderWebsiteHref,
  resolveLenderDomain,
} from './lenderLogoUtils';

const LENDER_FALLBACK = [
  { id: 'lender-rbc', title: 'RBC', category: 'Major Banks', domain: 'rbcroyalbank.com', description: '' },
  { id: 'lender-td', title: 'TD', category: 'Major Banks', domain: 'td.com', description: '' },
  { id: 'lender-scotia', title: 'Scotiabank', category: 'Major Banks', domain: 'scotiabank.com', description: '' },
  { id: 'lender-bmo', title: 'BMO', category: 'Major Banks', domain: 'bmo.com', description: '' },
  { id: 'lender-cibc', title: 'CIBC', category: 'Major Banks', domain: 'cibc.com', description: '' },
  { id: 'lender-national', title: 'National Bank', category: 'Major Banks', domain: 'nbc.ca', description: '' },
  { id: 'lender-desjardins', title: 'Desjardins', category: 'Credit Unions', domain: 'desjardins.com', description: '' },
  { id: 'lender-vancity', title: 'Vancity', category: 'Credit Unions', domain: 'vancity.com', description: '' },
  { id: 'lender-first-national', title: 'First National', category: 'Alternative Lenders', domain: 'firstnational.ca', description: '' },
  { id: 'lender-mcap', title: 'MCAP', category: 'Alternative Lenders', domain: 'mcap.com', description: '' },
  { id: 'lender-equitable', title: 'Equitable Bank', category: 'Alternative Lenders', domain: 'equitablebank.ca', description: '' },
  { id: 'lender-home-trust', title: 'Home Trust', category: 'Alternative Lenders', domain: 'hometrust.ca', description: '' },
];

function LenderLogo({ item }) {
  const [failed, setFailed] = useState(false);
  const domain = resolveLenderDomain(item);
  const src = item.logo_url || lenderLogoDevUrl(domain);
  const title = item.title || item.name || 'Lender';

  if (!src || failed) {
    return (
      <span className="grid h-14 w-14 place-items-center text-sm font-bold tracking-wide text-[color:var(--storefront-primary,#0c2139)]">
        {lenderInitials(title)}
      </span>
    );
  }

  return (
    <span className="relative flex h-14 w-14 items-center justify-center">
      <Image
        src={src}
        alt={`${title} logo`}
        width={56}
        height={56}
        unoptimized
        className="h-12 w-12 object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

export function BrokerClassicLenders({ profile, block }) {
  const content = blockContent(block);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '1');
  const { items, hasPersisted } = normalizedItems(content, LENDER_FALLBACK, 'items', 24);
  const note = brokerContentValue(
    content,
    'disclaimer',
    'Lender availability varies by province, product, and borrower profile. Logos identify institutions for reference only.',
  );

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
            {items.map((item, index) => {
              const title = item.title || item.name || 'Lender';
              const href = lenderWebsiteHref(item);
              const cardClassName = `group flex flex-col justify-center gap-3 px-3 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--storefront-accent,#008fd5)]/35 ${brokerFlexContentAlignClass(presentation.contentAlignment)} ${presentation.cardVisualClass}`;
              const cardStyle = cardSurfaceStyle(presentation);
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
                  <LenderLogo item={item} />
                  <EditableText
                    as="h3"
                    field="content.items"
                    label={`Lender ${index + 1} name`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="items"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="title"
                    className="text-[13px] font-semibold leading-tight tracking-[-0.01em] text-[color:var(--storefront-primary,#0c2139)]"
                  >
                    {title}
                  </EditableText>
                </>
              );

              if (href && !isPreview) {
                return (
                  <a
                    key={item.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClassName}
                    style={cardStyle}
                    aria-label={`Visit ${title}`}
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <article
                  key={item.id}
                  className={cardClassName}
                  style={cardStyle}
                  {...selectionAttrs}
                >
                  {inner}
                </article>
              );
            })}
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
