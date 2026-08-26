import { Check, MapPin, MessageSquareText, Scale } from 'lucide-react';
import { resolvePublicProfileAreas } from '@/lib/publicProfileAreas';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicPaddingClass,
  lawyerClassicSectionStyle,
  uniqueNamedList,
} from '../shared/lawyerSectionUtils';
import { resolveFirstHomeLanguages } from './firstHomeLanguages';

export function LawyerFirstHomePracticeSnapshot({ profile, block }) {
  const content = blockContent(block);
  const layout = block?.data?.layout || block?.layout || {};
  const sectionStyle = lawyerClassicSectionStyle(block);
  const professional = profile?.professional_profile || {};
  const hasCustomText = Boolean(String(sectionStyle.textColor || '').trim());
  const specializations = uniqueNamedList([
    ...(Array.isArray(professional.specializations) ? professional.specializations : []),
    ...(Array.isArray(professional.core_specialization_tags) ? professional.core_specialization_tags : []),
    ...(Array.isArray(professional.specialty_strength_tags) ? professional.specialty_strength_tags : []),
  ], [
    'Purchase closings',
    'Title diligence',
    'Closing coordination',
  ]);
  const markets = uniqueNamedList([
    ...resolvePublicProfileAreas(profile),
    ...(Array.isArray(professional.service_area_cities) ? professional.service_area_cities : []),
    ...(Array.isArray(professional.service_area_regions) ? professional.service_area_regions : []),
  ], [
    'Local closings',
    'Remote consultation available',
  ]);
  const languages = resolveFirstHomeLanguages(profile, professional);
  const spokenLanguages = languages.length ? languages : ['Languages available on request'];
  const groups = [
    {
      title: content.practice_focus_label || 'Practice focus',
      subtitle: content.practice_focus_subtitle || 'Where counsel is concentrated',
      Icon: Scale,
      items: specializations,
    },
    {
      title: content.markets_label || 'Markets served',
      subtitle: content.markets_subtitle || 'Locations and closing contexts',
      Icon: MapPin,
      items: markets,
    },
    {
      title: content.languages_label || 'Languages spoken',
      subtitle: content.languages_subtitle || 'Languages available for consultation',
      Icon: MessageSquareText,
      items: spokenLanguages,
    },
  ];

  return (
    <div
      id="practice-snapshot"
      className={`relative w-full max-w-none overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-20 ${lawyerClassicPaddingClass(layout.padding || 'small')}`}
      style={{
        ...(sectionStyle.background ? { backgroundColor: sectionStyle.background } : {}),
        ...(sectionStyle.textColor ? { color: sectionStyle.textColor } : {}),
      }}
    >
      <div className="border-b border-primary/10 pb-9" data-storefront-anim-item="true">
        <div className="max-w-5xl">
          <EditableText
            as="p"
            field="content.eyebrow"
            label="Practice snapshot eyebrow"
            source={content.eyebrow ? 'persisted' : 'fallback'}
            className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            {content.eyebrow || 'Practice snapshot'}
          </EditableText>
          <EditableText
            as="h2"
            field="content.heading"
            label="Practice snapshot heading"
            source={content.heading ? 'persisted' : 'fallback'}
            className={`mt-4 max-w-none font-serif text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl xl:whitespace-nowrap ${hasCustomText ? 'text-current' : 'text-primary'}`}
          >
            {content.heading || 'Where counsel is focused'}
          </EditableText>
          <EditableText
            as="p"
            field="content.body"
            label="Practice snapshot description"
            source={content.body ? 'persisted' : 'fallback'}
            className="mt-5 max-w-3xl text-[15px] leading-7 text-current opacity-65"
          >
            {content.body || 'A concise view of specializations, markets, and languages available for consultation.'}
          </EditableText>
        </div>
      </div>

      <div className="mt-10 grid gap-px overflow-hidden border border-primary/10 bg-primary/10 lg:grid-cols-3" data-first-home-grid="practice-snapshot">
        {groups.map((group, index) => {
          const Icon = group.Icon;
          const fieldPrefix = ['practice_focus', 'markets', 'languages'][index];
          return (
            <article
              key={group.title}
              className="bg-[color-mix(in_srgb,var(--storefront-canvas,#f6f3ed)_88%,#ffffff)] p-6 sm:p-7"
              data-storefront-anim-item="true"
            >
              <header className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-accent/35 bg-accent/10 text-accent">
                  <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <EditableText
                    as="h3"
                    field={`content.${fieldPrefix}_label`}
                    label={`${group.title} card title`}
                    source={content[`${fieldPrefix}_label`] ? 'persisted' : 'fallback'}
                    className={`font-serif text-lg font-semibold leading-snug ${hasCustomText ? 'text-current' : 'text-primary'}`}
                  >
                    {group.title}
                  </EditableText>
                  <EditableText
                    as="p"
                    field={`content.${fieldPrefix}_subtitle`}
                    label={`${group.title} card subtitle`}
                    source={content[`${fieldPrefix}_subtitle`] ? 'persisted' : 'fallback'}
                    className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-current opacity-45"
                  >
                    {group.subtitle}
                  </EditableText>
                </div>
              </header>
              <ul className="mt-6 space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 py-1.5 text-sm leading-6 text-current">
                    <Check size={15} strokeWidth={2.4} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
