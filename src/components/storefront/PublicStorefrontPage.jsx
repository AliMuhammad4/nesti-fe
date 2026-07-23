'use client';

import { useState } from 'react';
import PublicChatBubble from '@/components/public-profile/PublicChatBubble';
import PublicInquiryChatWidget from '@/components/public-profile/PublicInquiryChatWidget';
import PublicLeadCaptureModal from '@/components/public-profile/PublicLeadCaptureModal';
import { trackAnalyticsEvent } from '@/lib/publicProfileClient';
import { generateSessionId, generateVisitorId } from '@/utils/sessionHelpers';
import StorefrontBlockRenderer from './StorefrontBlockRenderer';

/**
 * Client interaction shell for every template. Individual blocks stay purely
 * presentational and send calls to action through this common surface.
 */
export default function PublicStorefrontPage({ profile }) {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [prefillInquiryProperty, setPrefillInquiryProperty] = useState(null);

  const track = async (eventType, data = {}) => {
    try {
      await trackAnalyticsEvent({
        slug: profile.slug,
        event_type: eventType,
        session_id: generateSessionId(),
        visitor_id: generateVisitorId(),
        ...data,
      });
    } catch {
      // Analytics must never interrupt a visitor's conversion flow.
    }
  };

  const openLeadModal = (property = null) => {
    setPrefillInquiryProperty(property || null);
    setLeadModalOpen(true);
  };

  const actions = {
    onCtaClick: async (ctaType = 'storefront_cta') => {
      await track('cta_click', { cta_type: String(ctaType) });
      setChatbotOpen(true);
    },
    onDirectLeadClick: () => openLeadModal(),
    onPropertyInquiry: (property) => openLeadModal(property),
    onServiceClick: async (service) => {
      await track('service_click', { service_id: service?._id || service?.id || null });
      setChatbotOpen(true);
    },
  };

  return (
    <>
      <div
        className="storefront-page-col12 mx-auto w-full max-w-6xl px-3 pb-10 pt-[4.75rem] sm:px-5 sm:pb-12 sm:pt-20 lg:px-6"
        data-layout="col-12"
      >
        <div className="overflow-hidden rounded-xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:rounded-2xl">
          <StorefrontBlockRenderer
            profile={profile}
            blocks={profile.storefront_blocks}
            templateKey={profile.storefront_template_key}
            theme={profile.storefront_theme}
            actions={actions}
          />
        </div>
      </div>
      <PublicLeadCaptureModal
        open={leadModalOpen}
        onClose={() => {
          setLeadModalOpen(false);
          setPrefillInquiryProperty(null);
        }}
        profile={profile}
        prefillProperty={prefillInquiryProperty}
      />
      <PublicInquiryChatWidget
        profile={profile}
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        inquiryType="contact"
      />
      <PublicChatBubble profile={profile} hideWhenOpen={chatbotOpen} />
    </>
  );
}
