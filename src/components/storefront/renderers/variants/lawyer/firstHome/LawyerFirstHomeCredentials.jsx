import { ShieldCheck } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicBandColors,
  lawyerClassicGridClass,
  lawyerClassicItemSurface,
  lawyerClassicPaddingClass,
  lawyerClassicSectionStyle,
  resolveProfessionalIdentity,
  resolveLawyerClassicIcon,
  resolveLawyerClassicItems,
} from '../shared/lawyerSectionUtils';

const TRUST_FALLBACK = [
  {
    title: 'Law society and licence',
    description: 'Current licensing details appear when they are available on the verified professional profile.',
    icon: 'shield',
    source: 'license',
  },
  {
    title: 'Jurisdiction served',
    description: 'Confirm the province and service area covered by the lawyer before opening a file.',
    icon: 'landmark',
    source: 'jurisdiction',
  },
  {
    title: 'Practice affiliation',
    description: 'See the firm or practice connected to this professional profile.',
    icon: 'contract',
    source: 'company',
  },
];

const GENERIC_DESCRIPTIONS = new Set(
  TRUST_FALLBACK.map((entry) => entry.description.toLowerCase()),
);

function resolveCardSource(item, index) {
  if (item.source_overridden === true) return '';
  const title = String(item.title || '').toLowerCase();
  if (title.includes('language')) return 'languages';
  return item.source
    || (title.includes('licence') || title.includes('license') || title.includes('society') ? 'license' : '')
    || (title.includes('jurisdiction') || title.includes('service area') ? 'jurisdiction' : '')
    || (title.includes('affiliation') || title.includes('firm') ? 'company' : '')
    || TRUST_FALLBACK[index]?.source
    || '';
}

function resolveProfessionalDetail(item, profile, isVerified, index) {
  const professional = profile?.professional_profile || {};
  const identity = resolveProfessionalIdentity(profile);
  const source = resolveCardSource(item, index);
  const description = String(item.description || '').trim();
  const hasCustomDescription = description
    && !GENERIC_DESCRIPTIONS.has(description.toLowerCase());
  if (hasCustomDescription) return description;
  if (source === 'license') {
    const license = profile?.license_number || professional.license_number || '';
    return isVerified && license
      ? `Law society or licence number: ${license}`
      : item.description;
  }
  if (source === 'jurisdiction') {
    const location = professional.location || profile?.location || '';
    return location ? `Serving real estate matters in ${location}.` : item.description;
  }
  if (source === 'company' && identity.company) {
    return identity.company;
  }
  return item.description;
}

export function LawyerFirstHomeCredentials({ profile, block }) {
  const content = blockContent(block);
  const layout = block?.data?.layout || block?.layout || {};
  const sectionStyle = lawyerClassicSectionStyle(block);
  const items = resolveLawyerClassicItems(content, TRUST_FALLBACK, 6)
    .filter((item, index) => resolveCardSource(item, index) !== 'languages');
  const isVerified = profile?.credentials_verified === true
    || profile?.professional_profile?.credentials_verified === true;
  const padding = layout.padding || 'small';
  const band = lawyerClassicBandColors(sectionStyle, {
    emptyBackgrounds: ['', '#1f2839', '#101a2b'],
    themeBackground: 'var(--storefront-primary, #1f2839)',
    themeText: 'var(--storefront-primary-contrast, #ffffff)',
    fallbackDark: '#1f2839',
  });

  return (
    <div
      id="professional-standing"
      className={`relative w-full max-w-none overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-20 ${lawyerClassicPaddingClass(padding)}`}
      style={{ backgroundColor: band.background, color: band.color }}
    >
      <div className="border-b border-white/10 pb-8" data-first-home-stack="compact">
        <div className="max-w-3xl" data-storefront-anim-item="true">
          <EditableText
            as="p"
            field="content.eyebrow"
            label="Trust eyebrow"
            source={content.eyebrow ? 'persisted' : 'fallback'}
            className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            {content.eyebrow || 'Professional standing'}
          </EditableText>
          <EditableText
            as="h2"
            field="content.heading"
            label="Trust heading"
            source={content.heading ? 'persisted' : 'fallback'}
            className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl"
          >
            {content.heading || 'Professional details you can verify'}
          </EditableText>
          <EditableText
            as="p"
            field="content.body"
            label="Trust description"
            source={content.body ? 'persisted' : 'fallback'}
            className="mt-4 max-w-2xl text-sm leading-7 text-current opacity-65"
          >
            {content.body || 'Review licensing, jurisdiction, and practice information before deciding who should handle your closing.'}
          </EditableText>
        </div>
        {isVerified ? (
          <EditableText
            field="content.verification_label"
            label="Verification label"
            source={content.verification_label ? 'persisted' : 'fallback'}
            className="mt-6 inline-flex w-fit items-center gap-3 border border-accent/35 bg-white/[0.05] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em]"
            animated
          >
            <ShieldCheck size={17} className="text-accent" aria-hidden="true" />
            {content.verification_label || 'Verified legal profile'}
          </EditableText>
        ) : null}
      </div>

      <div className={`mt-8 grid gap-3 ${lawyerClassicGridClass(layout.columns || 3, items.length)}`} data-first-home-grid="credentials">
        {items.map((item, index) => {
          const Icon = resolveLawyerClassicIcon(item, index, ['shield', 'landmark', 'contract']);
          const resolvedDescription = resolveProfessionalDetail(item, profile, isVerified, index);
          return (
            <article
              key={item.id || `${item.title}-${index}`}
              className="group min-h-[11.5rem] border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:bg-white/[0.075]"
              style={lawyerClassicItemSurface(item)}
              data-storefront-anim-item="true"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center border border-accent/30 bg-accent/10 text-accent">
                  <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <EditableText
                  as="h3"
                  field={`content.items.${index}.title`}
                  label={`Trust card ${index + 1} title`}
                  source="persisted"
                  collection="items"
                  itemId={item.id}
                  itemIndex={index}
                  itemField="title"
                  className="min-w-0 flex-1 font-serif text-lg font-semibold leading-snug text-current"
                >
                  {item.title}
                </EditableText>
              </div>
              <EditableText
                as="p"
                field={`content.items.${index}.description`}
                label={`Trust card ${index + 1} description`}
                source="persisted"
                collection="items"
                itemId={item.id}
                itemIndex={index}
                itemField="description"
                className="mt-5 text-sm leading-6 text-current opacity-70 [text-wrap:pretty]"
              >
                {resolvedDescription}
              </EditableText>
            </article>
          );
        })}
      </div>
    </div>
  );
}
