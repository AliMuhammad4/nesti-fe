'use client';

import { Check, Languages, MapPin, Target } from 'lucide-react';
import { resolvePublicProfileAreas } from '@/lib/publicProfileAreas';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  uniqueNamedList,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from './BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentRegionClass,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  transparentSectionPresentation,
} from './brokerSectionUtils';

function titleCase(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function BrokerClassicSnapshot({ profile, block }) {
  const content = blockContent(block);
  const professional = profile?.professional_profile || {};
  const presentation = transparentSectionPresentation(block, BROKER_INK, '3');
  const specialties = uniqueNamedList([
    ...(professional.specializations || []),
    ...(professional.core_specialization_tags || []),
    ...(professional.specialty_strength_tags || []),
  ], [
    'Purchase financing',
    'Refinance strategy',
    'Mortgage renewals',
  ]);
  const markets = uniqueNamedList([
    ...resolvePublicProfileAreas(profile),
    ...(professional.service_area_cities || []),
    ...(professional.service_area_regions || []),
    ...(professional.service_area_primary_zones || []),
  ], ['Coverage available on request']);
  const languages = uniqueNamedList(
    (professional.languages_spoken || []).map(titleCase),
    ['Languages available on request'],
  );
  const groups = [
    {
      key: 'practice_focus',
      title: content.practice_focus_label || 'Mortgage focus',
      subtitle: content.practice_focus_subtitle || 'Financing areas supported',
      Icon: Target,
      items: specialties,
      profileField: 'profile.professional_profile.specializations',
    },
    {
      key: 'markets',
      title: content.markets_label || 'Markets served',
      subtitle: content.markets_subtitle || 'Service areas and communities',
      Icon: MapPin,
      items: markets,
      profileField: 'profile.professional_profile.service_area_cities',
    },
    {
      key: 'languages',
      title: content.languages_label || 'Languages spoken',
      subtitle: content.languages_subtitle || 'Consultation accessibility',
      Icon: Languages,
      items: languages,
      profileField: 'profile.professional_profile.languages_spoken',
    },
  ];

  return (
    <section
      id="practice-snapshot"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow="Advisor snapshot"
          heading="Mortgage guidance shaped around your needs"
          body="A concise view of financing specialties, service markets, and consultation languages."
        />
        <div className={`mt-10 grid gap-4 lg:grid-cols-3 ${brokerContentRegionClass(presentation.contentAlignment)}`}>
          {groups.map((group) => {
            const Icon = group.Icon;
            return (
              <article
                key={group.key}
                className={`p-6 ${presentation.cardVisualClass}`}
                style={cardSurfaceStyle(presentation)}
                data-storefront-anim-item="true"
              >
                <header className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color:var(--storefront-accent,#008fd5)]/10 text-[color:var(--storefront-accent,#008fd5)]">
                    <Icon size={20} />
                  </span>
                  <div>
                    <EditableText
                      as="h3"
                      field={`content.${group.key}_label`}
                      label={`${group.title} title`}
                      className="text-base font-bold text-[color:var(--storefront-primary,#0c2139)]"
                    >
                      {group.title}
                    </EditableText>
                    <EditableText
                      as="p"
                      field={`content.${group.key}_subtitle`}
                      label={`${group.title} subtitle`}
                      className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"
                    >
                      {group.subtitle}
                    </EditableText>
                  </div>
                </header>
                <ul className="mt-6 space-y-2">
                  {group.items.slice(0, 5).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                      data-storefront-field={group.profileField}
                      data-storefront-source="profile"
                    >
                      <Check size={15} className="mt-1 shrink-0 text-[color:var(--storefront-accent,#008fd5)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
