'use client';

import { useEffect } from 'react';
import PublicProfileLayout from '@/components/public-profile/PublicProfileLayout';
import PublicStorefrontPage from './PublicStorefrontPage';

export default function PublicStorefrontPageClient({ profile }) {
  useEffect(() => {
    const templateKey = profile?.storefront_template_key;
    if (!['lawyer-newcomer', 'mortgage_broker-first-home', 'mortgage_broker-commercial'].includes(templateKey)) return undefined;

    const alignHashTarget = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!hash) return;
      const target = document.getElementById(hash);
      if (!target) return;
      const header = document.querySelector('header');
      const headerHeight = header?.getBoundingClientRect().height || 64;
      const top = target.getBoundingClientRect().top
        + window.scrollY
        - headerHeight
        - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    };
    const handleHashChange = () => window.requestAnimationFrame(alignHashTarget);
    const firstFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(alignHashTarget);
    });
    const settledLayoutTimer = window.setTimeout(alignHashTarget, 300);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.clearTimeout(settledLayoutTimer);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [profile?.storefront_template_key]);

  return (
    <PublicProfileLayout profile={profile}>
      <PublicStorefrontPage profile={profile} />
    </PublicProfileLayout>
  );
}
