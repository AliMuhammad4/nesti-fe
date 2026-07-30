'use client';

import { useEffect, useRef } from 'react';
import CustomToastContainer from '@/components/ui/ToastContainer';
import PublicStorefrontFooter from '@/components/public-profile/PublicStorefrontFooter';
import { trackAnalyticsEvent } from '@/lib/publicProfileClient';
import { generateSessionId, generateVisitorId } from '@/utils/sessionHelpers';

export default function PublicProfileLayout({ profile, children }) {
  const trackedViewRef = useRef(false);

  useEffect(() => {
    if (trackedViewRef.current) return;
    trackedViewRef.current = true;

    const sessionId = generateSessionId();
    const visitorId = generateVisitorId();
    
    const trackView = async () => {
      try {
        await trackAnalyticsEvent({
          slug: profile.slug,
          event_type: 'profile_view',
          session_id: sessionId,
          visitor_id: visitorId,
        });
      } catch (error) {
        console.error('Failed to track profile view:', error);
      }
    };

    trackView();
  }, [profile.slug]);

  const hasStorefrontFooter = profile.storefront_blocks?.some((block) => block.type === 'footer');

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: profile?.storefront_theme?.canvas || '#ffffff' }}
    >
      <main className="relative z-10 w-full flex-1">
        {children}
      </main>

      {!hasStorefrontFooter ? <PublicStorefrontFooter profile={profile} /> : null}
      <CustomToastContainer />
    </div>
  );
}

