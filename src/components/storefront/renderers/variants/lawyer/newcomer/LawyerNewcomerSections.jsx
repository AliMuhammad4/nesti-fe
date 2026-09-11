'use client';

import {
  ArrowUpRight,
  CalendarDays,
  FileCheck2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { buildTrackedCalendlyUrl, resolvePublicCalendlySource } from '@/lib/publicProfileLinks';
import { isStorefrontHashTargetAvailable } from '@/components/storefront/storefrontContentVisibility';
import IndustrialClientFeedbackSection from '../../IndustrialClientFeedbackSection';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../shared/ResilientStorefrontImage';
import {
  blockContent,
  hasReadableHexContrast,
  isLightHexColor,
  lawyerClassicGridClass,
  lawyerClassicPaddingClass,
  lawyerContentSource,
  lawyerContentValue,
  resolveLawyerClassicIcon,
  resolveProfessionalIdentity,
} from '../shared/lawyerSectionUtils';
import { resolveLawyerStandingItems } from '../classic/lawyerCredentialMetrics';
import {
  newcomerCollection,
  newcomerFooterLinkProps,
  realNewcomerTestimonials,
} from './newcomerData';

const THEME_INK = 'var(--storefront-primary, #4b3a2f)';
const WARM_CARD = '#ffffff';

function readableColor(background, requested, fallback = THEME_INK) {
  if (!background || !requested || hasReadableHexContrast(requested, background)) {
    return requested || fallback;
  }
  return isLightHexColor(background) ? THEME_INK : '#ffffff';
}

function presentation(block, {
  background = 'transparent',
  color = THEME_INK,
  columns = '3',
} = {}) {
  const layout = block?.data?.layout || block?.layout || {};
  const style = block?.data?.style || block?.style || {};
  const resolvedBackground = style.background || background;
  return {
    background: resolvedBackground,
    color: readableColor(resolvedBackground, style.textColor, color),
    alignment: ['left', 'center', 'right'].includes(layout.alignment)
      ? layout.alignment
      : 'left',
    padding: layout.padding || 'medium',
    columns: layout.columns || columns,
    cardStyle: layout.cardStyle || 'bordered',
    buttonLayout: layout.buttonLayout || 'stacked',
  };
}

function alignmentClass(alignment) {
  return {
    center: 'text-center',
    right: 'text-right',
    left: 'text-left',
  }[alignment] || 'text-left';
}

function cardClass(cardStyle) {
  return {
    flat: 'border-transparent bg-transparent shadow-none',
    elevated: 'border-transparent bg-white shadow-xl shadow-black/[0.07]',
    glass: 'border-white/80 bg-white/70 shadow-lg shadow-black/[0.06] backdrop-blur-xl',
    bordered: 'border-primary/15 bg-white/90 shadow-lg shadow-black/[0.04]',
  }[cardStyle] || 'border-primary/15 bg-white/90 shadow-lg shadow-black/[0.04]';
}

function anchorId(block, canonical) {
  const occurrence = Number(block?.runtime?.typeOccurrence || 0);
  if (!occurrence) return canonical;
  return `${canonical}-${String(block?.id || occurrence).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function NewcomerHeading({ content, eyebrow, heading, body, alignment = 'left' }) {
  const align = alignmentClass(alignment);
  const margin = alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : '';
  return (
    <header className={`${align} ${margin} max-w-3xl`} data-storefront-anim-item="true">
      <EditableText
        field="content.eyebrow"
        label="Section eyebrow"
        source={lawyerContentSource(content, 'eyebrow')}
        className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-current"
      >
        {lawyerContentValue(content, 'eyebrow', eyebrow)}
      </EditableText>
      <EditableText
        as="h2"
        field="content.heading"
        label="Section heading"
        source={lawyerContentSource(content, 'heading')}
        className="mt-4 text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-current sm:text-4xl"
      >
        {lawyerContentValue(content, 'heading', heading)}
      </EditableText>
      <EditableText
        as="p"
        field="content.body"
        label="Section supporting copy"
        source={lawyerContentSource(content, 'body')}
        className="mt-4 text-sm leading-7 text-current opacity-70 sm:text-[15px]"
      >
        {lawyerContentValue(content, 'body', body)}
      </EditableText>
    </header>
  );
}

function NewcomerCardSection({
  block,
  kind,
  fallback,
  isPreview = false,
  eyebrow,
  heading,
  body,
}) {
  const content = blockContent(block);
  const section = presentation(block);
  const { items, hasPersisted } = newcomerCollection(content, 'items', fallback, 6);
  const iconKeys = kind === 'practice'
    ? ['home', 'contract', 'landmark', 'shield', 'file', 'scale']
    : ['notebook', 'message', 'contract', 'calendar', 'shield', 'home'];
  return (
    <div
      id={anchorId(block, kind === 'practice' ? 'practice-areas' : 'services')}
      data-newcomer-section="true"
      className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(section.padding)}`}
      style={{ backgroundColor: section.background, color: section.color }}
    >
      <div className="relative mx-auto max-w-7xl">
        <NewcomerHeading {...{ content, eyebrow, heading, body }} alignment={section.alignment} />
        {items.length ? (
          <div data-newcomer-grid="cards" className={`mt-10 grid auto-rows-fr gap-4 ${lawyerClassicGridClass(section.columns, items.length, true)}`}>
            {items.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, iconKeys);
              const cardBackground = item.background || (kind === 'services' ? WARM_CARD : undefined);
              const cardColor = readableColor(cardBackground, item.text_color, section.color);
              return (
                <article
                  key={item.id}
                  data-storefront-anim-item="true"
                  data-storefront-collection="items"
                  data-storefront-item-id={item.id}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                  className={`group relative min-h-52 overflow-hidden rounded-[1.5rem] border p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl hover:shadow-black/10 ${cardClass(section.cardStyle)}`}
                  style={{ backgroundColor: cardBackground, color: cardColor }}
                >
                  <span
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-accent transition group-hover:rotate-3 group-hover:bg-accent group-hover:text-accent-contrast"
                    style={{
                      backgroundColor: item.icon_background || content.icon_background || undefined,
                      color: item.icon_color || content.icon_color || undefined,
                    }}
                  >
                    <Icon size={19} />
                  </span>
                  <EditableText
                    as="h3"
                    field={`content.items.${index}.title`}
                    label={`Card ${index + 1} title`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="items"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="title"
                    className="mt-5 text-lg font-bold leading-snug text-current"
                  >
                    {item.title}
                  </EditableText>
                  <EditableText
                    as="p"
                    field={`content.items.${index}.description`}
                    label={`Card ${index + 1} description`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="items"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="description"
                    className="mt-3 text-sm leading-6 text-current opacity-70"
                  >
                    {item.description}
                  </EditableText>
                </article>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-10 rounded-3xl border border-dashed border-primary/20 p-10 text-center text-sm opacity-60">
            Add {kind === 'practice' ? 'practice areas' : 'services'} in the Content panel.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LawyerNewcomerAbout({ profile, block }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const section = presentation(block, { background: 'transparent' });
  const photo = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || '';
  return (
    <div
      id={anchorId(block, 'about')}
      data-newcomer-section="true"
      className={`px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(section.padding)}`}
      style={{ backgroundColor: section.background, color: section.color }}
    >
      <div data-newcomer-grid="about" className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-primary/10 bg-white/90 shadow-2xl shadow-black/[0.07] lg:grid-cols-[.82fr_1.18fr]">
        <div
          className="relative min-h-[24rem] overflow-hidden bg-primary/10"
          data-storefront-field="brandKit.profile_photo_url"
          data-storefront-source="profile"
          data-storefront-label="About profile image"
        >
          {photo ? (
            <ResilientStorefrontImage
              profile={profile}
              candidates={[{ src: photo, kind: 'profile' }]}
              alt={identity.name}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              fallback={<div className="absolute inset-0 bg-primary/10" />}
            />
          ) : (
            <div className="grid h-full min-h-[24rem] place-items-center text-7xl font-bold text-primary/35">
              {identity.name.charAt(0)}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-primary/90 p-7 text-primary-contrast">
            <EditableText field="content.image_name" label="Profile name" source={lawyerContentSource(content, 'image_name')} className="text-xl font-bold">
              {lawyerContentValue(content, 'image_name', identity.name)}
            </EditableText>
            <EditableText field="content.image_role" label="Profile role" source={lawyerContentSource(content, 'image_role')} className="mt-1 text-xs uppercase tracking-[0.17em] opacity-75">
              {lawyerContentValue(content, 'image_role', identity.role)}
            </EditableText>
          </div>
        </div>
        <div className={`flex items-center p-7 sm:p-10 lg:p-14 ${alignmentClass(section.alignment)}`}>
          <NewcomerHeading
            content={content}
            eyebrow="A welcoming legal practice"
            heading={`Clear guidance with ${identity.name}`}
            body={profile?.about || 'Plain-language real estate counsel for newcomers preparing to buy, sign, and close with confidence.'}
            alignment={section.alignment}
          />
        </div>
      </div>
    </div>
  );
}

export function LawyerNewcomerPracticeAreas({ profile, block }) {
  const fallback = (Array.isArray(profile?.practice_areas) ? profile.practice_areas : [])
    .map((item) => (typeof item === 'string' ? { title: item } : item));
  return (
    <NewcomerCardSection
      block={block}
      kind="practice"
      fallback={fallback}
      isPreview={Boolean(profile?.storefront_builder_preview)}
      eyebrow="Purchase support"
      heading="Legal help for each part of your move"
      body="Understand the agreement, title, funds, and closing requirements without unnecessary legal jargon."
    />
  );
}

export function LawyerNewcomerServices({ profile, block }) {
  return (
    <NewcomerCardSection
      block={block}
      kind="services"
      fallback={Array.isArray(profile?.services) ? profile.services : []}
      isPreview={Boolean(profile?.storefront_builder_preview)}
      eyebrow="Newcomer-ready services"
      heading="Support designed around a new beginning"
      body="Practical legal help that keeps the people, paperwork, and timing of your Canadian home purchase organized."
    />
  );
}

export function LawyerNewcomerGuidance({ block, profile }) {
  const content = blockContent(block);
  const section = presentation(block);
  const fallback = [
    { title: 'Share your purchase details', text: 'Send the agreement, closing date, financing details, and the names that will appear on title.' },
    { title: 'Review documents and costs', text: 'Receive plain-language guidance on legal documents, funds, insurance, taxes, and expected disbursements.' },
    { title: 'Prepare for signing day', text: 'Confirm identification, funds, signing arrangements, registration, and how keys will be released.' },
  ];
  const { items, hasPersisted } = newcomerCollection(content, 'steps', fallback, 6);
  const isPreview = Boolean(profile?.storefront_builder_preview);
  return (
    <div
      id={anchorId(block, 'guidance')}
      data-newcomer-section="true"
      className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(section.padding)}`}
      style={{ backgroundColor: section.background, color: section.color }}
    >
      <div className="mx-auto max-w-7xl">
        <NewcomerHeading
          content={content}
          eyebrow="Your newcomer closing guide"
          heading="Know what happens before closing day"
          body="A simple path through documents, funds, signing, registration, and the final handoff."
          alignment={section.alignment}
        />
        {items.length ? (
          <div data-newcomer-grid="cards" className={`mt-11 grid gap-4 ${lawyerClassicGridClass(section.columns, items.length, true)}`}>
            {items.map((item, index) => {
              const Icon = resolveLawyerClassicIcon(item, index, ['message', 'file', 'shield', 'calendar']);
              const cardBackground = item.background || content.process_card_background || undefined;
              const cardColor = readableColor(cardBackground, item.text_color || content.process_card_text_color, section.color);
              return (
                <article
                  key={item.id}
                  data-storefront-anim-item="true"
                  data-storefront-collection="steps"
                  data-storefront-item-id={item.id}
                  data-storefront-item-index={index}
                  data-storefront-item-field="title"
                  data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                  className={`relative min-h-52 rounded-[1.5rem] border p-6 ${cardClass(section.cardStyle)}`}
                  style={{ backgroundColor: cardBackground, color: cardColor }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-contrast">
                      <Icon size={19} />
                    </span>
                    <span className="text-xs font-bold tracking-[0.18em] text-current opacity-35">0{index + 1}</span>
                  </div>
                  <EditableText as="h3" field="content.steps" label={`Step ${index + 1} title`} source={hasPersisted ? 'persisted' : 'fallback'} collection="steps" itemId={item.id} itemIndex={index} itemField="title" className="mt-5 text-lg font-bold text-current">
                    {item.title}
                  </EditableText>
                  <EditableText as="p" field="content.steps" label={`Step ${index + 1} description`} source={hasPersisted ? 'persisted' : 'fallback'} collection="steps" itemId={item.id} itemIndex={index} itemField="text" className="mt-3 text-sm leading-6 text-current opacity-70">
                    {item.description}
                  </EditableText>
                </article>
              );
            })}
          </div>
        ) : isPreview ? (
          <div className="mt-10 rounded-3xl border border-dashed border-primary/20 p-10 text-center text-sm opacity-60">
            Add guidance steps in the Content panel.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LawyerNewcomerCredentials({ profile, block }) {
  const content = blockContent(block);
  const section = presentation(block, { columns: '4' });
  const isVerified = profile?.credentials_verified === true
    || profile?.professional_profile?.credentials_verified === true;
  const hidden = new Set(Array.isArray(content.hidden_metrics) ? content.hidden_metrics : []);
  const order = new Map((Array.isArray(content.metric_order) ? content.metric_order : [])
    .map((kind, index) => [kind, index]));
  const items = resolveLawyerStandingItems(profile)
    .filter((item) => !hidden.has(item.kind))
    .sort((a, b) => (order.get(a.kind) ?? 99) - (order.get(b.kind) ?? 99))
    .map((item) => ({ ...item, title: content.metric_labels?.[item.kind] || item.title }));
  const icons = { pipeline: FileCheck2, experience: CalendarDays, clients: Sparkles, cases: ShieldCheck };
  const cardBackground = content.card_background || undefined;
  const cardColor = readableColor(cardBackground, content.card_text_color, section.color);
  const metricsGridClass = section.columns === '4'
    ? 'sm:grid-cols-2 lg:grid-cols-4'
    : lawyerClassicGridClass(section.columns, items.length, true);
  return (
    <div
      id={anchorId(block, 'credentials')}
      data-newcomer-section="true"
      className={`px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(section.padding)}`}
      style={{ backgroundColor: section.background, color: section.color }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <NewcomerHeading
            content={content}
            eyebrow="Professional standing"
            heading="Experience you can review"
            body="Profile-backed practice information to help you understand who will support your transaction."
            alignment={section.alignment}
          />
          {isVerified ? (
            <EditableText field="content.verification_label" label="Verification label" source={lawyerContentSource(content, 'verification_label')} className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-contrast">
              <ShieldCheck size={15} />
              {lawyerContentValue(content, 'verification_label', 'Verified legal profile')}
            </EditableText>
          ) : null}
        </div>
        <div data-newcomer-grid="metrics" className={`mt-10 grid gap-4 ${metricsGridClass}`}>
          {items.map((item, index) => {
            const Icon = content.metric_icons?.[item.kind]
              ? resolveLawyerClassicIcon({ icon: content.metric_icons[item.kind] }, index)
              : (icons[item.kind] || FileCheck2);
            return (
              <article
                key={item.id}
                data-storefront-anim-item="true"
                data-storefront-metric={item.kind}
                className={`min-h-40 rounded-[1.5rem] border p-6 ${cardClass(section.cardStyle)}`}
                style={{ backgroundColor: cardBackground, color: cardColor }}
              >
                <Icon size={19} className="text-accent" />
                <EditableText as="h3" field={`content.metric_labels.${item.kind}`} label={`${item.title} label`} source={content.metric_labels?.[item.kind] ? 'persisted' : 'fallback'} className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-current opacity-55">
                  {item.title}
                </EditableText>
                <p className="mt-2 text-2xl font-bold text-current" data-storefront-source="profile" data-storefront-field={`profile.professional_credential_metrics.${item.kind}`}>
                  {item.value}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LawyerNewcomerTestimonials({ profile, block }) {
  const content = blockContent(block);
  const sectionProfile = {
    ...profile,
    storefront_section_content: content,
    storefront_section_layout: block?.data?.layout || block?.layout || {},
    storefront_section_style: block?.data?.style || block?.style || {},
  };
  const hasPersisted = Object.prototype.hasOwnProperty.call(content, 'items')
    && Array.isArray(content.items);
  const testimonials = realNewcomerTestimonials(
    hasPersisted ? content.items : profile?.testimonials,
  );
  return (
    <IndustrialClientFeedbackSection
      profile={sectionProfile}
      testimonials={testimonials}
      testimonialSource={hasPersisted ? 'persisted' : 'profile'}
      copy={{
        eyebrow: lawyerContentValue(content, 'eyebrow', 'New beginnings, shared'),
        heading: lawyerContentValue(content, 'heading', 'What clients say'),
        body: lawyerContentValue(content, 'body', 'Real feedback from people who received help with their move and closing.'),
      }}
      sectionId={anchorId(block, 'reviews')}
      variant="lawyer"
    />
  );
}

export function LawyerNewcomerCta({ profile, actions = {}, block }) {
  const content = blockContent(block);
  const section = presentation(block, {
    background: 'var(--storefront-accent, #416f82)',
    color: 'var(--storefront-accent-contrast, #17252b)',
  });
  const primary = lawyerContentValue(content, 'cta_label', 'Start consultation');
  const secondary = lawyerContentValue(content, 'secondary_cta_label', 'Send my details');
  const calendlyUrl = buildTrackedCalendlyUrl(resolvePublicCalendlySource(profile), profile);
  const openCalendar = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      actions.onAppointmentClick?.();
      return;
    }
    actions.onCtaClick?.('book_consultation');
  };
  const primaryBackground = content.primary_button_background || 'var(--storefront-primary)';
  const secondaryBackground = content.secondary_button_background || 'transparent';
  return (
    <div
      id={anchorId(block, 'contact')}
      data-newcomer-section="true"
      className={`relative overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(section.padding)}`}
      style={{ backgroundColor: section.background, color: section.color, textAlign: section.alignment }}
    >
      <div data-newcomer-grid="cta" className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <NewcomerHeading
          content={content}
          eyebrow="Your next step"
          heading="Bring your closing questions"
          body="Share your offer, preferred language, and timeline for a focused response."
          alignment={section.alignment}
        />
        <div className={`flex gap-3 ${section.buttonLayout === 'inline' ? 'flex-row flex-wrap' : 'flex-col'}`}>
          <button type="button" onClick={openCalendar} data-storefront-field="content.cta_label" data-storefront-source={lawyerContentSource(content, 'cta_label')} className={`${primary ? 'inline-flex' : 'hidden'} storefront-btn min-h-12 items-center justify-center gap-2 rounded-full px-6 text-xs font-bold`} style={{ backgroundColor: primaryBackground, color: readableColor(primaryBackground, content.primary_button_text_color, 'var(--storefront-primary-contrast, #ffffff)') }}>
            <CalendarDays size={16} />
            {primary}
          </button>
          <button type="button" onClick={actions.onDirectLeadClick} data-storefront-field="content.secondary_cta_label" data-storefront-source={lawyerContentSource(content, 'secondary_cta_label')} className={`${secondary ? 'inline-flex' : 'hidden'} storefront-btn min-h-12 items-center justify-center gap-2 rounded-full border border-current px-6 text-xs font-bold`} style={{ backgroundColor: secondaryBackground, color: content.secondary_button_text_color || 'currentColor' }}>
            <MessageCircle size={16} />
            {secondary}
          </button>
        </div>
        {content.helper_text ? (
          <EditableText as="p" field="content.helper_text" label="CTA helper text" source="persisted" className="text-xs leading-5 opacity-65 lg:col-span-2">
            {content.helper_text}
          </EditableText>
        ) : null}
      </div>
    </div>
  );
}

export function LawyerNewcomerFooter({
  profile,
  actions = {},
  block,
  absoluteHashes = false,
}) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const section = presentation(block, {
    background: 'var(--storefront-primary, #4b3a2f)',
    color: 'var(--storefront-primary-contrast, #ffffff)',
  });
  const { items, hasPersisted } = newcomerCollection(content, 'items', [
    { label: 'About', target: '#about' },
    { label: 'Practice areas', target: '#practice-areas' },
    { label: 'Services', target: '#services' },
    { label: 'Closing guide', target: '#guidance' },
  ], 8);
  const visibleItems = items.filter((item) => (
    !String(item.target || '').trim().startsWith('#')
    || isStorefrontHashTargetAvailable(profile, item.target)
  ));
  const email = profile?.email || profile?.professional_profile?.email || '';
  const phone = profile?.phone || profile?.professional_profile?.phone || '';
  const location = profile?.professional_profile?.location || '';
  const calendlyUrl = buildTrackedCalendlyUrl(resolvePublicCalendlySource(profile), profile);
  const footerName = lawyerContentValue(content, 'heading', identity.name);
  return (
    <footer
      data-newcomer-section="true"
      className={`px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(section.padding)}`}
      style={{ backgroundColor: section.background, color: section.color, textAlign: section.alignment }}
    >
      <div className="mx-auto max-w-7xl">
        <div data-newcomer-grid="footer" className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_.75fr_1fr]">
          <div className="min-w-0">
            <EditableText as="h2" field="content.heading" label="Footer heading" source={lawyerContentSource(content, 'heading')} className="text-2xl font-bold text-current">
              {footerName}
            </EditableText>
            <EditableText field="content.role_label" label="Footer role label" source={lawyerContentSource(content, 'role_label')} className="mt-2 block text-xs font-bold uppercase tracking-[0.16em] text-current opacity-75">
              {lawyerContentValue(content, 'role_label', 'Newcomer home closing counsel')}
            </EditableText>
            <EditableText as="p" field="content.body" label="Footer description" source={lawyerContentSource(content, 'body')} className="mt-5 max-w-lg text-sm leading-7 text-current opacity-70">
              {lawyerContentValue(content, 'body', 'Warm, plain-language legal guidance for buying and closing a home in Canada.')}
            </EditableText>
          </div>
          <nav className="min-w-0">
            <EditableText field="content.resource_heading" label="Footer navigation heading" source={lawyerContentSource(content, 'resource_heading')} className="text-sm font-bold text-current">
              {lawyerContentValue(content, 'resource_heading', 'Explore')}
            </EditableText>
            <ul className="mt-4 space-y-3">
              {visibleItems.map((item, index) => {
                const linkProps = newcomerFooterLinkProps(
                  item,
                  { absoluteHashes, slug: profile?.slug },
                );
                return (
                  <li key={item.id}>
                    <a
                      {...linkProps}
                      onClick={(event) => {
                        if (linkProps.href === '#') event.preventDefault();
                      }}
                      data-storefront-collection="items"
                      data-storefront-item-id={item.id}
                      data-storefront-item-index={index}
                      data-storefront-item-field="label"
                      data-storefront-source={hasPersisted ? 'persisted' : 'fallback'}
                      className="inline-flex items-center gap-2 text-sm text-current opacity-70 transition hover:text-accent hover:opacity-100"
                    >
                      {item.label || item.title}
                      <ArrowUpRight size={12} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="min-w-0">
            <EditableText field="content.contact_heading" label="Footer contact heading" source={lawyerContentSource(content, 'contact_heading')} className="text-sm font-bold text-current">
              {lawyerContentValue(content, 'contact_heading', 'Contact')}
            </EditableText>
            <div className="mt-4 space-y-3 text-sm text-current opacity-75">
              {content.show_email !== false && email ? <a href={`mailto:${email}`} className="flex min-w-0 items-start gap-2 break-all hover:text-accent"><Mail size={15} className="mt-0.5 shrink-0" />{email}</a> : null}
              {content.show_phone !== false && phone ? <a href={`tel:${phone}`} className="flex min-w-0 items-start gap-2 break-words hover:text-accent"><Phone size={15} className="mt-0.5 shrink-0" />{phone}</a> : null}
              {location ? <p className="flex min-w-0 items-start gap-2 break-words"><MapPin size={15} className="mt-0.5 shrink-0" />{location}</p> : null}
              {content.show_booking !== false && calendlyUrl ? (
                <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" onClick={() => actions.onAppointmentClick?.()} className="storefront-btn mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-bold text-accent-contrast opacity-100">
                  <CalendarDays size={15} />
                  Book an appointment
                </a>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-current/15 pt-5 text-xs text-current opacity-55 sm:flex-row sm:justify-between">
          <EditableText field="content.disclaimer" label="Footer disclaimer" source={lawyerContentSource(content, 'disclaimer')}>
            {lawyerContentValue(content, 'disclaimer', 'An inquiry does not create a lawyer-client relationship. Do not send confidential information until representation is confirmed.')}
          </EditableText>
          <span className="shrink-0">© {new Date().getFullYear()} {footerName}</span>
        </div>
      </div>
    </footer>
  );
}

