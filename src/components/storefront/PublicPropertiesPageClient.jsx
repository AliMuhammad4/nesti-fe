'use client';

import { useEffect, useState } from 'react';
import PublicPropertiesPage from './PublicPropertiesPage';

export default function PublicPropertiesPageClient({ profile, listings = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen animate-pulse bg-slate-100" />;
  }

  return <PublicPropertiesPage profile={profile} listings={listings} />;
}
