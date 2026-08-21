'use client';

import IndustrialClientFeedbackSection from '../../IndustrialClientFeedbackSection';
import { blockContent } from '../shared/lawyerSectionUtils';

export function LawyerClassicTestimonials({ profile, testimonials, block }) {
  const content = blockContent(block);
  const copy = {
    eyebrow: content.eyebrow || 'Client feedback',
    heading: content.heading || 'Happy clients',
    body: content.body || 'Buyers, sellers, and property owners who moved forward with confidence.',
  };
  return (
    <IndustrialClientFeedbackSection
      profile={profile}
      testimonials={Array.isArray(testimonials) && testimonials.length ? testimonials : profile?.testimonials}
      copy={copy}
      variant="lawyer"
      sectionId="reviews"
    />
  );
}
