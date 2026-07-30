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
      // Default: keep published pages non-intrusive and open the lead form.
      openLeadModal();
    },
    onDirectLeadClick: () => openLeadModal(),
    onAppointmentClick: () => track('cta_click', { cta_type: 'book_consultation' }),
    onPropertyInquiry: (property) => openLeadModal(property),
    onServiceClick: async (service) => {
      await track('service_click', { service_id: service?._id || service?.id || null });
      // Service cards are informational/read-only on public pages.
    },
  };

  return (
    <>
      <div className="w-full" data-layout="full-width">
        <div className="w-full">
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
      {profile?.storefront_show_chatbot === false ? null : (
        <PublicChatBubble profile={profile} hideWhenOpen={chatbotOpen} />
      )}
    </>
  );
}
