'use client';

import { useMemo, useState } from 'react';
import PublicChatBubble from '@/components/public-profile/PublicChatBubble';
import PublicInquiryChatWidget from '@/components/public-profile/PublicInquiryChatWidget';
import PublicLeadCaptureModal from '@/components/public-profile/PublicLeadCaptureModal';
import { trackAnalyticsEvent } from '@/lib/publicProfileClient';
import { buildTrackedCalendlyUrl } from '@/lib/publicProfileLinks';
import { generateSessionId, generateVisitorId } from '@/utils/sessionHelpers';
import StorefrontBlockRenderer from './StorefrontBlockRenderer';
import { materializeTemplate } from './templates';
import { migrateLawyerFirstHomeBlocks } from './templates/lawyer/firstHomeMigration';

const PROOF_TEMPLATE_KEYS = new Set([
  'agent-luxury-advisor',
  'agent-first-home',
  'agent-community-expert',
]);
const PROOF_BLOCK_TYPES = new Set([
  'seller-performance',
  'seller-sold-results',
  'seller-case-study',
  'seller-credentials',
]);
const COMMUNITY_LEGACY_SURFACES = new Set([
  '#eaf8ef',
  '#f5fbf7',
  '#f5fbf8',
  '#f7fbf6',
  '#e6f2f0',
  '#d9f4df',
]);

function migrateCommunityPublishedBlocks(blocks = []) {
  const migrateSurface = (value) => (
    COMMUNITY_LEGACY_SURFACES.has(String(value || '').trim().toLowerCase()) ? '' : value
  );
  return blocks.map((block) => ({
    ...block,
    data: {
      ...(block.data || {}),
      style: {
        ...(block.data?.style || {}),
        background: migrateSurface(block.data?.style?.background),
      },
      content: {
        ...(block.data?.content || {}),
        panel_background: migrateSurface(block.data?.content?.panel_background),
        section_background: migrateSurface(block.data?.content?.section_background),
      },
    },
  }));
}

/**
 * Client interaction shell for every template. Individual blocks stay purely
 * presentational and send calls to action through this common surface.
 */
export default function PublicStorefrontPage({ profile }) {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [prefillInquiryProperty, setPrefillInquiryProperty] = useState(null);
  const publicBlocks = useMemo(() => {
    const savedBlocks = Array.isArray(profile.storefront_blocks) ? profile.storefront_blocks : [];
    if (profile.storefront_template_key === 'lawyer-first-home-closing') {
      const defaults = materializeTemplate(
        profile.storefront_template_key,
        profile,
        profile.storefront_brand_kit || profile.brand_kit || {},
      )?.blocks || [];
      return migrateLawyerFirstHomeBlocks(savedBlocks, defaults);
    }
    if (!PROOF_TEMPLATE_KEYS.has(profile.storefront_template_key)) return savedBlocks;
    const baseBlocks = profile.storefront_template_key === 'agent-community-expert'
      ? migrateCommunityPublishedBlocks(savedBlocks)
      : savedBlocks;
    const defaults = materializeTemplate(
      profile.storefront_template_key,
      profile,
      profile.storefront_brand_kit || profile.brand_kit || {},
    )?.blocks || [];
    const existingTypes = new Set(baseBlocks.map((block) => block?.type));
    const missingProof = defaults.filter(
      (block) => PROOF_BLOCK_TYPES.has(block.type) && !existingTypes.has(block.type),
    );
    if (!missingProof.length) return baseBlocks;
    const next = [...baseBlocks];
    const footerIndex = next.findIndex((block) => block?.type === 'footer');
    next.splice(footerIndex >= 0 ? footerIndex : next.length, 0, ...missingProof);
    return next;
  }, [profile]);

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

  // Same source as PublicHero / PublicCTA: professional profile Calendly URL.
  const calendlyUrl = buildTrackedCalendlyUrl(
    profile?.professional_profile?.calendly_link,
    profile,
  );

  const actions = {
    onCtaClick: async (ctaType = 'storefront_cta') => {
      await track('cta_click', { cta_type: String(ctaType) });
      if (String(ctaType) === 'book_consultation' && calendlyUrl) {
        window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      // Default: keep published pages non-intrusive and open the lead form.
      openLeadModal();
    },
    onDirectLeadClick: async () => {
      await track('cta_click', { cta_type: 'direct_inquiry' });
      openLeadModal();
    },
    // Tracking-only, matching PublicHero/PublicCTA: callers open Calendly themselves.
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
            blocks={publicBlocks}
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
        <PublicChatBubble
          profile={profile}
          controlledOpen={chatbotOpen}
          onControlledToggle={setChatbotOpen}
        />
      )}
    </>
  );
}
