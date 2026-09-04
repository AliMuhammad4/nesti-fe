'use client';

import { ResilientStorefrontImage } from '../../lawyer/shared/ResilientStorefrontImage';
import {
  blockContent,
  resolveProfessionalIdentity,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from './BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentValue,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  transparentSectionPresentation,
} from './brokerSectionUtils';

export function BrokerClassicAbout({ profile, block }) {
  const content = blockContent(block);
  const identity = resolveProfessionalIdentity(profile);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '2');
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
      <div className="grid w-full max-w-none items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="relative mx-auto w-full max-w-md">
          <div
            className={`relative min-h-[28rem] overflow-hidden ${presentation.cardVisualClass}`}
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
                className="object-cover"
              />
            ) : (
              <div className="grid min-h-[28rem] place-items-center bg-[linear-gradient(145deg,#0c2139,#004aa1)] text-7xl font-bold text-white/80">
                {(identity.name || 'M').charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div>
          <BrokerSectionHeading
            align={presentation.headingAlignment}
            content={content}
            eyebrow="Company introductions"
            heading="Mortgage advice shaped around your goals"
            body={brokerContentValue(
              content,
              'body',
              'Loan solutions that help transform your goals into reality with trusted financial support and flexible repayment options.',
            )}
          />
        </div>
      </div>
    </section>
  );
}
