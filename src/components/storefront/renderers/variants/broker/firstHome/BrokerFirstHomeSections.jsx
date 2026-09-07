'use client';

import { ArrowRight, CalendarDays, MessageSquareText, Quote } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../../lawyer/shared/ResilientStorefrontImage';
import {
  blockContent,
  lawyerClassicGridClass,
  lawyerContentSource,
  resolveLawyerClassicIcon,
  resolveProfessionalIdentity,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from '../classic/BrokerSectionHeading';
import {
  brokerAlignmentClass,
  brokerAlignmentMarginClass,
  brokerContentValue,
  brokerContentRegionClass,
  brokerFlexContentAlignClass,
  brokerIconSurfaceProps,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  normalizedItems,
  sectionPresentation,
  transparentSectionPresentation,
} from '../classic/brokerSectionUtils';
import {
  FIRST_HOME_GUIDANCE_STEPS,
  FIRST_HOME_SERVICES,
} from './brokerFirstHomeDefaults';
import { FIRST_HOME_PALETTE as P } from './brokerFirstHomePalette';

function EditableCollectionCard({
  content,
  item,
  index,
  collection,
  hasPersisted,
  presentation,
  iconKeys,
  labelPrefix,
}) {
  const Icon = resolveLawyerClassicIcon(item, index, iconKeys);
  const iconProps = brokerIconSurfaceProps(content, item, presentation, {
    backgroundClass: 'bg-[color:var(--storefront-accent,#1B4B73)]',
    colorClass: 'text-white',
  });

  return (
    <article
      className={`group relative flex flex-col border border-[#102A43]/10 bg-transparent p-5 transition duration-300 hover:border-[color:var(--storefront-accent,#1B4B73)]/35 ${brokerFlexContentAlignClass(presentation.contentAlignment)}`}
      data-storefront-anim-item="true"
    >
      <div className="flex w-full items-center gap-3">
        <span
          className={`h-11 w-11 shrink-0 shadow-[0_8px_18px_rgba(27,75,115,0.22)] ${iconProps.className}`}
          style={iconProps.style}
        >
          <Icon size={20} strokeWidth={2.2} />
        </span>
        <EditableText
          as="h3"
          field={`content.${collection}`}
          label={`${labelPrefix} ${index + 1} title`}
          source={hasPersisted ? 'persisted' : 'fallback'}
          collection={collection}
          itemId={item.id}
          itemIndex={index}
          itemField="title"
          className="min-w-0 flex-1 text-base font-bold leading-snug text-[color:var(--storefront-primary,#102A43)] sm:text-lg"
        >
          {item.title}
        </EditableText>
      </div>
      <EditableText
        as="p"
        field={`content.${collection}`}
        label={`${labelPrefix} ${index + 1} description`}
        source={hasPersisted ? 'persisted' : 'fallback'}
        collection={collection}
        itemId={item.id}
        itemIndex={index}
        itemField="description"
        className="mt-3 text-sm leading-7 text-slate-600"
      >
        {item.description}
      </EditableText>
    </article>
  );
}

export function BrokerFirstHomeServices({ block }) {
  const content = blockContent(block);
  const presentation = transparentSectionPresentation(block, P.ink, '4');
  const { items, hasPersisted } = normalizedItems(content, FIRST_HOME_SERVICES, 'items', 6);

  return (
    <section
      id="services"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow="First-home essentials"
          heading="Support for every decision that matters"
          body="Practical guidance for affordability, pre-approval, down payment, and product choice."
          bodyClassName="max-w-2xl"
        />
        <div className={`mt-10 grid items-start gap-5 sm:gap-6 ${lawyerClassicGridClass(presentation.columns, items.length, true)} ${brokerContentRegionClass(presentation.contentAlignment)}`}>
          {items.map((item, index) => (
            <EditableCollectionCard
              key={item.id}
              content={content}
              item={item}
              index={index}
              collection="items"
              hasPersisted={hasPersisted}
              presentation={presentation}
              iconKeys={['calculator', 'shield', 'home', 'percent']}
              labelPrefix="Service"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrokerFirstHomeAbout({ profile, block }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const presentation = transparentSectionPresentation(block, P.ink, '2');
  const profilePhoto = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || '';

  return (
    <section
      id="about"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="grid w-full max-w-none items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div className="min-w-0">
          <BrokerSectionHeading
            align={presentation.headingAlignment}
            content={content}
            eyebrow="A team you can trust"
            heading="Your first mortgage should feel informed, not overwhelming"
            body={brokerContentValue(
              content,
              'body',
              'Clear answers and responsive support at every step of your first purchase.',
            )}
            bodyClassName="max-w-2xl"
          />
          <div className="mt-8 border-l-4 border-[color:var(--storefront-accent,#1B4B73)] pl-5">
            <Quote size={23} className="text-[color:var(--storefront-accent,#1B4B73)]" />
            <EditableText
              as="p"
              field="content.trust_statement"
              label="Trust statement"
              source={lawyerContentSource(content, 'trust_statement')}
              className="mt-3 max-w-2xl text-lg font-semibold leading-8 text-[color:var(--storefront-primary,#102A43)]"
            >
              {brokerContentValue(content, 'trust_statement', 'Advice shaped around your budget, timeline, and long-term comfort.')}
            </EditableText>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <div
            className={`relative min-h-[28rem] overflow-hidden sm:min-h-[32rem] ${presentation.cardVisualClass}`}
            style={cardSurfaceStyle(presentation)}
            data-storefront-field="brandKit.profile_photo_url"
            data-storefront-source="profile"
            data-storefront-label="About advisor photo"
          >
            {profilePhoto ? (
              <ResilientStorefrontImage
                profile={profile}
                candidates={[{ src: profilePhoto, kind: 'profile' }]}
                alt={identity.name || 'Mortgage advisor'}
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="grid min-h-[28rem] place-items-center bg-[linear-gradient(145deg,#102A43,#1B4B73)] text-7xl font-bold text-white/85 sm:min-h-[32rem]">
                {(identity.name || 'M').charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrokerFirstHomeGuidance({ block }) {
  const content = blockContent(block);
  const presentation = transparentSectionPresentation(block, P.ink, '4');
  const { items, hasPersisted } = normalizedItems(content, FIRST_HOME_GUIDANCE_STEPS, 'steps', 6);

  return (
    <section
      id="guidance"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow="Your first-home roadmap"
          heading="Four steps from curiosity to closing"
          body="A simple path that keeps your numbers, documents, and decisions organized."
        />
        <div className={`mt-10 grid items-start gap-6 md:grid-cols-2 xl:grid-cols-4 ${brokerContentRegionClass(presentation.contentAlignment)}`}>
          {items.map((item, index) => (
            <article key={item.id} className="relative" data-storefront-anim-item="true">
              <div className="flex items-start gap-3">
                <span
                  className="relative z-10 grid h-12 w-12 shrink-0 place-items-center bg-[color:var(--storefront-accent,#1B4B73)] text-sm font-extrabold text-white"
                  style={{ borderRadius: presentation.controlRadius }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <EditableText
                    as="h3"
                    field="content.steps"
                    label={`Step ${index + 1} title`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="steps"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="title"
                    className="text-lg font-bold leading-snug text-[color:var(--storefront-primary,#102A43)]"
                  >
                    {item.title}
                  </EditableText>
                  <EditableText
                    as="p"
                    field="content.steps"
                    label={`Step ${index + 1} description`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="steps"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="description"
                    className="mt-2 text-sm leading-7 text-slate-600"
                  >
                    {item.description}
                  </EditableText>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrokerFirstHomeCta({ actions = {}, block }) {
  const content = blockContent(block);
  const presentation = sectionPresentation(block, P.primary, P.white);
  const layout = block?.data?.layout || block?.layout || {};
  const isInlineButtons = layout.buttonLayout === 'inline';
  const primaryLabel = brokerContentValue(content, 'cta_label', 'Start my pre-approval');
  const secondaryLabel = brokerContentValue(content, 'secondary_cta_label', 'Book a consultation');

  return (
    <section
      id="contact"
      className={`relative isolate overflow-hidden px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 80% at 0% 0%, rgba(27,75,115,0.45) 0%, transparent 58%),
            radial-gradient(ellipse 40% 60% at 100% 100%, rgba(27,75,115,0.28) 0%, transparent 55%)
          `,
        }}
      />
      <div className="pointer-events-none absolute -right-16 top-1/2 hidden h-48 w-48 -translate-y-1/2 rotate-45 border border-white/10 lg:block" />
      <div className="pointer-events-none absolute right-8 top-1/2 hidden h-28 w-28 -translate-y-1/2 rotate-45 border border-white/10 lg:block" />

      <div className="relative grid w-full max-w-none items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
        <div
          className={`${brokerAlignmentClass(presentation.headingAlignment)} ${brokerAlignmentMarginClass(presentation.headingAlignment)}`}
          data-storefront-anim-item="true"
        >
          <EditableText
            as="p"
            field="content.eyebrow"
            label="CTA eyebrow"
            source={lawyerContentSource(content, 'eyebrow')}
            className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/75"
          >
            {brokerContentValue(content, 'eyebrow', 'Your plan starts here')}
          </EditableText>
          <EditableText
            as="h2"
            field="content.heading"
            label="CTA heading"
            source={lawyerContentSource(content, 'heading')}
            className="mt-3 max-w-3xl text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-white text-balance sm:text-4xl lg:text-[2.75rem]"
          >
            {brokerContentValue(content, 'heading', 'Talk to a first-home mortgage expert')}
          </EditableText>
          <div className="mt-4 h-[3px] w-10 rounded-full bg-white/35" />
          <EditableText
            as="p"
            field="content.body"
            label="CTA description"
            source={lawyerContentSource(content, 'body')}
            className="mt-4 max-w-2xl text-[15px] leading-7 text-white/85 sm:leading-8"
          >
            {brokerContentValue(content, 'body', 'Share where you are today and get a practical next step for your budget, pre-approval, or purchase timeline.')}
          </EditableText>
        </div>

        <div
          className={`flex w-full flex-col gap-3 sm:flex-row lg:min-w-[18.5rem] lg:w-auto ${
            isInlineButtons ? 'lg:flex-row' : 'lg:flex-col'
          }`}
          data-storefront-anim-item="true"
        >
          <button
            type="button"
            onClick={actions.onDirectLeadClick}
            className="inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2.5 bg-white px-6 text-[13px] font-bold tracking-[0.02em] text-[#102A43] shadow-[0_14px_32px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-white/95 lg:min-w-[16.5rem]"
            style={{ borderRadius: presentation.controlRadius }}
          >
            <MessageSquareText size={16} strokeWidth={2.2} />
            <EditableText
              as="span"
              field="content.cta_label"
              label="Primary CTA button"
              source={lawyerContentSource(content, 'cta_label')}
            >
              {primaryLabel}
            </EditableText>
            <ArrowRight size={15} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => actions.onCtaClick?.('book_consultation')}
            className="inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2.5 border border-white/55 bg-white/[0.08] px-6 text-[13px] font-bold tracking-[0.02em] text-white backdrop-blur-[2px] transition duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white/14 lg:min-w-[16.5rem]"
            style={{ borderRadius: presentation.controlRadius }}
          >
            <CalendarDays size={16} strokeWidth={2.2} />
            <EditableText
              as="span"
              field="content.secondary_cta_label"
              label="Secondary CTA button"
              source={lawyerContentSource(content, 'secondary_cta_label')}
            >
              {secondaryLabel}
            </EditableText>
          </button>
        </div>
      </div>
    </section>
  );
}
