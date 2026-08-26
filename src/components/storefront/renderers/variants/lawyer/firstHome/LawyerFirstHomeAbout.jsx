'use client';

import { CheckCircle2, Scale } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../shared/ResilientStorefrontImage';
import {
  blockContent,
  lawyerClassicResolvedPaddingClass,
  lawyerContentSource,
  lawyerContentValue,
  resolveProfessionalIdentity,
} from '../shared/lawyerSectionUtils';

export function LawyerFirstHomeAbout({ profile, block }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const imageName = lawyerContentValue(content, 'image_name', identity.name);
  const imageRole = lawyerContentValue(content, 'image_role', identity.role);
  const eyebrow = lawyerContentValue(content, 'eyebrow', 'A calmer path to closing');
  const heading = lawyerContentValue(content, 'heading', 'Guidance built for a first purchase.');
  const body = lawyerContentValue(
    content,
    'body',
    profile?.about || 'Your first purchase should feel informed, not intimidating. We explain the documents, timing, expected costs, and legal decisions in clear language.',
  );
  const aboutLabel = lawyerContentValue(content, 'about_label', 'Clear from offer to keys');
  const aboutNote = lawyerContentValue(content, 'about_note', 'Practical answers at every stage of the closing.');
  const practiceLabel = lawyerContentValue(content, 'practice_label', 'Practice');
  const practiceValue = lawyerContentValue(content, 'practice_value', identity.company || 'Residential real estate law');
  const profilePhoto = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || '';
  const padding = block?.data?.layout?.padding || block?.layout?.padding;
  const sectionStyle = block?.data?.style || block?.style || {};
  const hasCustomText = Boolean(String(sectionStyle.textColor || '').trim());

  return (
    <div
      id="about"
      className={`w-full max-w-none bg-transparent px-5 sm:px-8 lg:px-12 xl:px-20 ${lawyerClassicResolvedPaddingClass(padding, 'py-16 sm:py-20')}`}
      style={{
        ...(sectionStyle.background ? { backgroundColor: sectionStyle.background } : {}),
        ...(sectionStyle.textColor ? { color: sectionStyle.textColor } : {}),
      }}
    >
      <div
        className="grid w-full overflow-hidden border border-primary/10 bg-white/60 shadow-[0_28px_80px_rgba(15,23,42,.08)] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]"
        data-first-home-grid="about-shell"
      >
        <div
          className="relative min-h-[28rem] overflow-hidden bg-primary lg:min-h-[40rem]"
          data-first-home-about-media="true"
          data-storefront-anim-item="true"
          data-storefront-field="brandKit.profile_photo_url"
          data-storefront-source="profile"
          data-storefront-label="About profile image"
        >
          {profilePhoto ? (
            <ResilientStorefrontImage
              profile={profile}
              candidates={[{ src: profilePhoto, kind: 'profile' }]}
              alt={identity.name}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-center"
              fallback={(
                <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,var(--storefront-primary),#070d17)] text-8xl font-semibold text-accent">
                  {identity.name.charAt(0)}
                </div>
              )}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,var(--storefront-primary),#070d17)] text-8xl font-semibold text-accent">
              {identity.name.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-primary/90 px-6 py-5 text-primary-contrast backdrop-blur sm:px-8">
            <EditableText
              field="content.image_name"
              label="About image name"
              source={lawyerContentSource(content, 'image_name')}
              className="font-serif text-2xl font-semibold"
            >
              {imageName}
            </EditableText>
            <EditableText
              as="p"
              field="content.image_role"
              label="About image role"
              source={lawyerContentSource(content, 'image_role')}
              className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent"
            >
              {imageRole}
            </EditableText>
          </div>
        </div>

        <div className="flex items-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
          <div className="max-w-2xl" data-storefront-anim-item="true">
            <EditableText
              as="p"
              field="content.eyebrow"
              label="About eyebrow"
              source={lawyerContentSource(content, 'eyebrow')}
              className="text-xs font-bold uppercase tracking-[0.24em] text-accent"
            >
              {eyebrow}
            </EditableText>
            <EditableText
              as="h2"
              field="content.heading"
              label="About heading"
              source={lawyerContentSource(content, 'heading')}
              className={`mt-4 font-serif text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl lg:text-5xl ${hasCustomText ? 'text-current' : 'text-primary'}`}
            >
              {heading}
            </EditableText>
            <div className="mt-6 h-px w-16 bg-accent" />
            <EditableText
              as="p"
              field="content.body"
              label="About description"
              source={lawyerContentSource(content, 'body')}
              className={`mt-6 text-[15px] leading-8 ${hasCustomText ? 'text-current opacity-70' : 'text-slate-600'}`}
            >
              {body}
            </EditableText>

            <div className="mt-8 grid gap-3 border-t border-primary/10 pt-7 sm:grid-cols-2" data-first-home-grid="about-details">
              <div className="flex min-h-28 items-start gap-3 border border-primary/10 bg-[color-mix(in_srgb,var(--storefront-canvas,#f6f3ed)_76%,#ffffff)] p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center border border-accent/25 bg-accent/10 text-accent">
                  <CheckCircle2 size={17} aria-hidden="true" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <EditableText
                    as="h3"
                    field="content.about_label"
                    label="About detail title"
                    source={lawyerContentSource(content, 'about_label')}
                    className={`text-sm font-semibold leading-5 ${hasCustomText ? 'text-current' : 'text-primary'}`}
                  >
                    {aboutLabel}
                  </EditableText>
                  <EditableText
                    as="p"
                    field="content.about_note"
                    label="About detail description"
                    source={lawyerContentSource(content, 'about_note')}
                    className={`mt-1 text-xs leading-5 ${hasCustomText ? 'text-current opacity-60' : 'text-slate-500'}`}
                  >
                    {aboutNote}
                  </EditableText>
                </div>
              </div>
              <div className="flex min-h-28 items-start gap-3 border border-primary/10 bg-[color-mix(in_srgb,var(--storefront-canvas,#f6f3ed)_76%,#ffffff)] p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center border border-accent/25 bg-accent/10 text-accent">
                  <Scale size={17} aria-hidden="true" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <EditableText
                    as="p"
                    field="content.practice_label"
                    label="About practice label"
                    source={lawyerContentSource(content, 'practice_label')}
                    className={`text-[10px] font-bold uppercase tracking-[0.18em] ${hasCustomText ? 'text-current opacity-55' : 'text-slate-400'}`}
                  >
                    {practiceLabel}
                  </EditableText>
                  <EditableText
                    as="p"
                    field="content.practice_value"
                    label="About practice value"
                    source={lawyerContentSource(content, 'practice_value')}
                    className={`mt-2 text-sm font-semibold leading-5 ${hasCustomText ? 'text-current' : 'text-primary'}`}
                  >
                    {practiceValue}
                  </EditableText>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
