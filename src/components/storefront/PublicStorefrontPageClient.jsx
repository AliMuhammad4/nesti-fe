'use client';

import PublicProfileLayout from '@/components/public-profile/PublicProfileLayout';
import PublicStorefrontPage from './PublicStorefrontPage';

export default function PublicStorefrontPageClient({ profile }) {
  return (
    <PublicProfileLayout profile={profile}>
      <PublicStorefrontPage profile={profile} />
    </PublicProfileLayout>
  );
}
