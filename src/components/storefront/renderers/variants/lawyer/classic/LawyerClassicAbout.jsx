'use client';

import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import { ResilientStorefrontImage } from '../shared/ResilientStorefrontImage';
import { blockContent, lawyerClassicResolvedPaddingClass, resolveProfessionalIdentity } from '../shared/lawyerSectionUtils';

export function LawyerClassicAbout({ profile, block }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const profilePhoto = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || '';
  const padding = block?.data?.layout?.padding || block?.layout?.padding;

  return (
    <div id="about" className={`w-full max-w-none bg-transparent ${lawyerClassicResolvedPaddingClass(padding, 'pt-12 sm:pt-16')}`}>
      <div className="grid min-h-[34rem] w-full max-w-none overflow-hidden bg-transparent lg:grid-cols-2">
        <div className="flex items-center px-6 py-14 sm:px-10 lg:px-14 xl:px-20">
          <div className="max-w-2xl" data-storefront-anim-item="true">
          <EditableText
            as="p"
            field="content.eyebrow"
            label="About eyebrow"
            source={content.eyebrow ? 'persisted' : 'fallback'}
            className="text-[11px] font-bold uppercase tracking-[0.26em] text-accent"
          >
            {content.eyebrow || 'About the practice'}
          </EditableText>
          <EditableText
            as="h2"
            field="content.heading"
            label="About heading"
            source={content.heading ? 'persisted' : 'fallback'}
            className="mt-4 text-3xl font-semibold tracking-tight text-primary sm:text-4xl"
          >
            {content.heading || `About ${identity.name}`}
          </EditableText>
          <div className="mt-5 h-0.5 w-14 bg-accent" />
          <EditableText
            as="p"
            field="content.body"
            label="About description"
            source={content.body ? 'persisted' : 'fallback'}
            className="mt-6 text-[15px] leading-7 text-slate-600"
          >
            {content.body || profile?.about || 'Practical legal counsel focused on protecting your transaction, documents, title, and closing timeline.'}
          </EditableText>
          </div>
        </div>
        <div
          className="relative min-h-[26rem] overflow-hidden bg-[#222] lg:min-h-full"
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
              sizes="(min-width: 1024px) 50vw, 100vw"
              fallback={(
                <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#292929,#111)] text-8xl font-semibold text-accent">
                  {identity.name.charAt(0)}
                </div>
              )}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#292929,#111)] text-8xl font-semibold text-accent">
              {identity.name.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-7 left-7 border-l-2 border-accent pl-4 text-white">
            <EditableText
              field="content.image_name"
              label="About image name"
              source={content.image_name ? 'persisted' : 'fallback'}
              className="text-xl font-semibold"
            >
              {content.image_name || identity.name}
            </EditableText>
            <EditableText
              field="content.image_role"
              label="About image role"
              source={content.image_role ? 'persisted' : 'fallback'}
              className="mt-1 text-xs uppercase tracking-[0.2em] text-white/[0.65]"
            >
              {content.image_role || identity.role}
            </EditableText>
          </div>
        </div>
      </div>
    </div>
  );
}
