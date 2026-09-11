'use client';

import IndustrialClientFeedbackSection from '../../IndustrialClientFeedbackSection';
import { blockContent } from '../shared/lawyerSectionUtils';

export function LawyerClassicTestimonials({ profile, testimonials, block }) {
  const content = blockContent(block);
  const hasPersistedTestimonials = Object.prototype.hasOwnProperty.call(content, 'items')
    && Array.isArray(content.items);
  const copy = {
    eyebrow: content.eyebrow || 'Client feedback',
    heading: content.heading || 'Happy clients',
    body: content.body || 'Buyers, sellers, and property owners who moved forward with confidence.',
  };
  return (
    <IndustrialClientFeedbackSection
      profile={profile}
      testimonials={hasPersistedTestimonials
        ? content.items
        : (Array.isArray(testimonials) ? testimonials : profile?.testimonials)}
      testimonialSource={hasPersistedTestimonials ? 'persisted' : 'profile'}
      copy={copy}
      variant="lawyer"
      sectionId="reviews"
    />
  );
}
