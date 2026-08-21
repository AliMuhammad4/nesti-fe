'use client';

import { useEffect, useState } from 'react';
import PublicProfileLayout from '@/components/public-profile/PublicProfileLayout';
import PublicStorefrontPage from './PublicStorefrontPage';

function StorefrontFallback() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-16 border-b border-slate-200 bg-white" />
      <div className="h-[34rem] animate-pulse bg-slate-200" />
    </div>
  );
}

export default function PublicStorefrontPageClient({ profile }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <StorefrontFallback />;

  return (
    <PublicProfileLayout profile={profile}>
      <PublicStorefrontPage profile={profile} />
    </PublicProfileLayout>
  );
}
