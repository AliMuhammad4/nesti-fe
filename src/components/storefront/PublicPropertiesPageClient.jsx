'use client';

import dynamic from 'next/dynamic';

function PropertiesPageFallback() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-16 border-b border-slate-200 bg-white" />
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="h-7 w-52 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-slate-200/80" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="aspect-[4/3] animate-pulse bg-slate-200" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PublicPropertiesPage = dynamic(
  () => import('./PublicPropertiesPage'),
  {
    ssr: false,
    loading: PropertiesPageFallback,
  },
);

export default function PublicPropertiesPageClient({ profile, listings = [] }) {
  return <PublicPropertiesPage profile={profile} listings={listings} />;
}
