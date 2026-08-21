'use client';

import { Check, MapPin, MessageSquareText, Scale } from 'lucide-react';
import { resolvePublicProfileAreas } from '@/lib/publicProfileAreas';
import { STANDARD_LANGUAGE_OPTIONS } from '@/lib/matchingTaxonomy';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  isLightHexColor,
  lawyerClassicGridClass,
  lawyerClassicHasColor,
  lawyerClassicResolvedPaddingClass,
  lawyerClassicSectionStyle,
  uniqueNamedList,
  LAWYER_CLASSIC_PROCESS_DEFAULTS,
} from '../shared/lawyerSectionUtils';

const LAWYER_LANGUAGE_LABELS = new Map(
  STANDARD_LANGUAGE_OPTIONS
    .filter((option) => option.value !== 'other')
    .flatMap((option) => [
      [option.value.toLowerCase(), option.label],
      [option.label.toLowerCase(), option.label],
    ]),
);

function resolveLawyerLanguages(profile = {}, professional = {}) {
  const rawLanguages = [
    ...(Array.isArray(professional.languages_spoken) ? professional.languages_spoken : []),
    ...(Array.isArray(profile.languages_spoken) ? profile.languages_spoken : []),
  ];
  const languages = rawLanguages
    .map((item) => (typeof item === 'object' ? item?.value || item?.label || item?.name : item))
    .map((item) => LAWYER_LANGUAGE_LABELS.get(String(item || '').trim().toLowerCase()))
    .filter(Boolean);
  const otherLanguage = String(
    professional.other_language_text || profile.other_language_text || '',
  ).trim();
  if (
    otherLanguage.length >= 2
    && !/\b(lorem|ipsum|quibusdam|placeholder|asdf)\b/i.test(otherLanguage)
  ) {
    languages.push(otherLanguage);
  }
  const unique = [...new Set(languages)];
  return unique.length ? unique.slice(0, 6) : ['Languages available on request'];
}

export function LawyerClassicExpertise({ profile, block }) {
  const content = blockContent(block);
  const professional = profile?.professional_profile || {};
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const specializations = uniqueNamedList(professional.specializations, [
    'Contract review',
    'Title diligence',
    'Closing coordination',
  ]);
  const markets = uniqueNamedList(resolvePublicProfileAreas(profile), [
    'Local closings',
    'Remote consultation available',
  ]);
  const languages = resolveLawyerLanguages(profile, professional);
  const hasPersistedProcess = Object.prototype.hasOwnProperty.call(content, 'process_steps')
    && Array.isArray(content.process_steps);
  const processSteps = (hasPersistedProcess ? content.process_steps : LAWYER_CLASSIC_PROCESS_DEFAULTS)
    .filter((item) => item && (item.title || item.text))
    .slice(0, 4);
  const padding = block?.data?.layout?.padding || block?.layout?.padding || 'medium';
  const sectionStyle = lawyerClassicSectionStyle(block);
  const requestedBackground = String(sectionStyle.background || '').trim();
  const requestedTextColor = String(sectionStyle.textColor || '').trim();
  const customBg = lawyerClassicHasColor(requestedBackground);
  const lightBand = isLightHexColor(requestedBackground);
  const snapshotCardClass = customBg
    ? (lightBand ? 'bg-white/80 p-7' : 'bg-white/[0.055] p-7')
    : 'bg-[color-mix(in_srgb,var(--storefront-canvas,#f2f1ef)_88%,#ffffff)] p-7';
  const snapshotOnDark = customBg && !lightBand;
  const snapshotTitleClass = requestedTextColor
    ? 'text-current'
    : snapshotOnDark
      ? 'text-primary-contrast'
      : 'text-primary';
  const snapshotMutedClass = requestedTextColor
    ? 'text-current opacity-60'
    : snapshotOnDark
      ? 'text-primary-contrast/55'
      : 'text-slate-400';
  const snapshotBodyClass = requestedTextColor
    ? 'text-current opacity-80'
    : snapshotOnDark
      ? 'text-primary-contrast/80'
      : 'text-slate-600';
  const processUsesThemePrimary = !customBg || lightBand;
  const processSurfaceStyle = processUsesThemePrimary
    ? undefined
    : {
        backgroundColor: requestedBackground,
        color: requestedTextColor || '#ffffff',
      };
  const groups = [
    {
      title: 'Practice focus',
      subtitle: 'Where counsel is concentrated',
      Icon: Scale,
      items: specializations,
    },
    {
      title: 'Markets served',
      subtitle: 'Locations and closing contexts',
      Icon: MapPin,
      items: markets,
    },
    {
      title: 'Languages spoken',
      subtitle: 'Languages available for consultation',
      Icon: MessageSquareText,
      items: languages,
    },
  ];

  return (
    <div
      id="expertise"
      className={`lawyer-classic-expertise relative w-full max-w-none overflow-hidden border-b border-primary/10 bg-transparent px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicResolvedPaddingClass(padding, 'py-20')}`}
    >
      <div className="w-full max-w-none">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" data-storefront-anim-item="true">
          <div className="max-w-3xl">
            <EditableText
              as="p"
              field="content.eyebrow"
              label="Expertise eyebrow"
              source={content.eyebrow ? 'persisted' : 'fallback'}
              className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
            >
              {content.eyebrow || 'Practice snapshot'}
            </EditableText>
            <EditableText
              as="h2"
              field="content.heading"
              label="Expertise heading"
              source={content.heading ? 'persisted' : 'fallback'}
              className="mt-3 text-3xl font-semibold uppercase tracking-[-0.02em] text-primary sm:text-4xl"
            >
              {content.heading || 'Where counsel is focused'}
            </EditableText>
            <EditableText
              as="p"
              field="content.body"
              label="Expertise description"
              source={content.body ? 'persisted' : 'fallback'}
              className="mt-4 max-w-2xl text-sm leading-7 text-slate-500"
            >
              {content.body || 'A concise view of specializations, markets, and languages available for consultation.'}
            </EditableText>
            <div className="mt-5 h-0.5 w-16 bg-accent" />
          </div>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden border border-primary/15 bg-primary/10 lg:grid-cols-3">
          {groups.map((group) => {
            const Icon = group.Icon;
            return (
              <article
                key={group.title}
                data-storefront-anim-item="true"
                className={snapshotCardClass}
              >
                <header className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center border border-accent/35 bg-accent/5 text-accent">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <div>
                    <h3 className={`text-lg font-semibold ${snapshotTitleClass}`}>{group.title}</h3>
                    <p className={`mt-1 text-[11px] font-bold uppercase tracking-[0.16em] ${snapshotMutedClass}`}>
                      {group.subtitle}
                    </p>
                  </div>
                </header>
                <ul className="mt-6 space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item} className={`flex items-start gap-3 py-1.5 text-sm leading-6 ${snapshotBodyClass}`}>
                      <Check size={15} strokeWidth={2.4} className="mt-1 shrink-0 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {processSteps.length || isPreview ? (
          <div
            className={`-mx-5 mt-14 w-[calc(100%+2.5rem)] overflow-hidden px-6 py-9 shadow-[0_22px_55px_rgba(15,23,42,.14)] sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-8 sm:py-10 lg:-mx-12 lg:w-[calc(100%+6rem)] xl:-mx-16 xl:w-[calc(100%+8rem)] ${
              processUsesThemePrimary ? 'bg-primary text-primary-contrast' : ''
            }`}
            style={processSurfaceStyle}
          >
            <div
              className="max-w-4xl"
              data-storefront-anim-item="true"
            >
              <div className="max-w-2xl">
                <EditableText
                  as="p"
                  field="content.process_label"
                  label="Process label"
                  source={content.process_label ? 'persisted' : 'fallback'}
                  className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent"
                >
                  {content.process_label || 'How representation starts'}
                </EditableText>
                <EditableText
                  as="h3"
                  field="content.process_heading"
                  label="Process heading"
                  source={content.process_heading ? 'persisted' : 'fallback'}
                  className={`mt-3 text-2xl font-semibold uppercase leading-tight tracking-[-0.02em] sm:text-3xl ${
                    processUsesThemePrimary ? 'text-primary-contrast' : 'text-current'
                  }`}
                >
                  {content.process_heading || 'A clear path before any file is opened'}
                </EditableText>
              </div>
              <EditableText
                as="p"
                field="content.process_body"
                label="Process description"
                source={content.process_body ? 'persisted' : 'fallback'}
                className={`mt-4 max-w-2xl text-sm leading-6 ${
                  processUsesThemePrimary ? 'text-primary-contrast/75' : 'text-current opacity-75'
                }`}
              >
                {content.process_body || 'This is an inquiry process, not legal advice or a promise of representation.'}
              </EditableText>
            </div>
            {processSteps.length ? (
              <div className={`mt-10 grid gap-3 ${lawyerClassicGridClass(4, processSteps.length)}`}>
                {processSteps.map((step, index) => (
                  <article
                    key={step.id || `${step.title}-${index}`}
                    data-storefront-anim-item="true"
                    data-storefront-field="content.process_steps"
                    data-storefront-source={hasPersistedProcess ? 'persisted' : 'fallback'}
                    data-storefront-collection="process_steps"
                    data-storefront-item-id={step.id}
                    data-storefront-item-index={index}
                    data-storefront-item-field="title"
                    data-storefront-label={`Process step ${index + 1}`}
                    className="min-h-44 bg-white/[0.055] p-6 transition-colors hover:bg-white/[0.09]"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                      Step {String(index + 1).padStart(2, '0')}
                    </span>
                    <h4 className={`mt-4 text-lg font-semibold leading-tight ${
                      processUsesThemePrimary ? 'text-primary-contrast' : 'text-current'
                    }`}>{step.title}</h4>
                    <p className={`mt-3 text-sm leading-6 ${
                      processUsesThemePrimary ? 'text-primary-contrast/70' : 'text-current opacity-70'
                    }`}>{step.text || step.description}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-primary-contrast/55">Add intake steps in the Content panel.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
