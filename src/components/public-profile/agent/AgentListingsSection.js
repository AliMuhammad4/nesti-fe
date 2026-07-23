'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bath, Bed, DollarSign, MapPin, Ruler } from 'lucide-react';
import { getOwnStorefrontProperties, getSellerProperties, trackAnalyticsEvent } from '@/lib/publicProfileClient';
import { generateSessionId, generateVisitorId } from '@/utils/sessionHelpers';
import { PropertyModal } from './AgentPropertiesSection';

export default function AgentListingsSection({
  title,
  description,
  listings,
  type,
  profileSlug,
  preview = false,
  builderAccessToken,
  onPropertyInquiry,
  profile,
  showAll = false,
  showViewAll = true,
}) {
  const [resolvedListings, setResolvedListings] = useState(Array.isArray(listings) ? listings : []);
  const [loadingLiveListings, setLoadingLiveListings] = useState(false);
  const [detailProperty, setDetailProperty] = useState(null);

  useEffect(() => {
    if (Array.isArray(listings) && listings.length) {
      setResolvedListings(listings);
      setLoadingLiveListings(false);
      return;
    }

    if (type !== 'featured' || (!profileSlug && !builderAccessToken)) {
      setResolvedListings([]);
      setLoadingLiveListings(false);
      return;
    }

    let cancelled = false;
    setLoadingLiveListings(true);
    const propertiesRequest = preview && builderAccessToken
      ? getOwnStorefrontProperties(builderAccessToken)
      : getSellerProperties(profileSlug);
    propertiesRequest
      .then((data) => {
        if (cancelled) return;
        const properties = Array.isArray(data?.properties) ? data.properties : [];
        setResolvedListings(properties.map((property) => ({
          ...property,
          _id: property._id || property.id,
          price: property.price || property.expected_price,
          photos: property.photos?.length ? property.photos : property.images || [],
          square_feet: property.square_feet || property.square_footage,
          status: property.status || 'available',
        })));
      })
      .catch(() => {
        if (!cancelled) setResolvedListings([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingLiveListings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [builderAccessToken, listings, preview, profileSlug, type]);

  const handleListingClick = (listing) => {
    if (preview) return;
    setDetailProperty(listing);
    const listingId = listing._id || listing.id;
    try {
      trackAnalyticsEvent({
        slug: profileSlug,
        event_type: 'listing_click',
        listing_id: listingId,
        session_id: generateSessionId(),
        visitor_id: generateVisitorId(),
      }).catch(() => {});
    } catch (error) {
      console.error('Failed to track listing click:', error);
    }
  };

  const isSold = type === 'sold';
  const visibleListings = showAll ? resolvedListings : resolvedListings.slice(0, 4);
  const propertiesHref = `/professional/${profileSlug}/properties`;

  if (loadingLiveListings && !resolvedListings.length) {
    return (
      <section className="bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 h-7 w-56 animate-pulse rounded bg-slate-200" />
          <div className="storefront-listings-grid grid gap-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        </div>
      </section>
    );
  }

  if (!resolvedListings.length) {
    if (preview) {
      return (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Listings section</p>
              <h2 className="mt-2 text-3xl font-bold text-text-heading">{title}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted">
                Add listing details in the section editor or connect live listing data to populate this area.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200" />
                  <div className="space-y-2 p-4">
                    <div className="h-2.5 w-1/3 rounded bg-slate-200" />
                    <div className="h-3 w-3/4 rounded bg-slate-200" />
                    <div className="h-2.5 w-1/2 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <>
      <section
        id={type === 'featured' ? 'properties' : type ? `${type}-listings` : 'properties'}
        className={`bg-white ${
          type === 'featured' && !showAll
            ? 'pb-4 pt-10 sm:pb-5 sm:pt-12'
            : 'py-10 sm:py-12'
        } ${isSold ? 'bg-slate-50' : ''}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                {showAll ? 'Complete inventory' : 'Available properties'}
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {title}
              </h2>
              {description ? (
                <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
                  {description}
                </p>
              ) : isSold ? (
                <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
                  See the successful transactions I&apos;ve recently closed.
                </p>
              ) : null}
            </div>
            {type === 'featured' && !showAll && showViewAll && resolvedListings.length > 4 ? (
              <Link
                href={propertiesHref}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-slate-50 hover:text-primary sm:self-auto"
              >
                View all properties
                <ArrowRight size={13} />
              </Link>
            ) : null}
          </div>

          <div
            className="storefront-listings-grid grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            }}
          >
          {visibleListings.map((listing, index) => (
            <button
              type="button"
              key={listing._id || index}
              onClick={() => handleListingClick(listing)}
              className="group w-full cursor-pointer overflow-hidden rounded-xl border border-slate-200/90 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              {/* Listing Image */}
              <div className="relative h-36 overflow-hidden bg-slate-100">
                {listing.image_url || listing.photos?.[0] ? (
                  <Image
                    src={listing.image_url || listing.photos[0]}
                    alt={listing.title || 'Property'}
                    fill
                    sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                    <MapPin size={32} />
                  </div>
                )}
                {isSold && (
                  <div className="absolute right-2.5 top-2.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                    SOLD
                  </div>
                )}
                {!isSold && listing.status && (
                  <div className="absolute right-2.5 top-2.5 rounded-full bg-slate-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                    {listing.status.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Listing Details */}
              <div className="p-3.5">
                {/* Price */}
                <div className="mb-2 flex items-center gap-1">
                  <DollarSign size={14} className="text-emerald-600" />
                  <span className="text-base font-bold tracking-tight text-slate-900">
                    {listing.price
                      ? typeof listing.price === 'number'
                        ? listing.price.toLocaleString()
                        : listing.price
                      : 'Contact for Price'}
                  </span>
                </div>

                {/* Address */}
                {(listing.address || listing.location) && (
                  <p className="mb-2.5 flex items-start gap-1.5 text-[12px] text-slate-500">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-primary" />
                    <span className="line-clamp-1">{listing.address || listing.location}</span>
                  </p>
                )}

                {/* Property Details */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-600">
                  {listing.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed size={13} className="text-primary" />
                      <span>{listing.bedrooms} Bed</span>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath size={13} className="text-primary" />
                      <span>{listing.bathrooms} Bath</span>
                    </div>
                  )}
                  {listing.square_feet && (
                    <div className="flex items-center gap-1">
                      <Ruler size={13} className="text-primary" />
                      <span>{listing.square_feet.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div>

                {/* Property Type */}
                {listing.property_type && (
                  <div className="mt-2.5 border-t border-slate-100 pt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {listing.property_type}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
          </div>
        </div>
      </section>
      {detailProperty ? (
        <PropertyModal
          property={detailProperty}
          profile={profile}
          onClose={() => setDetailProperty(null)}
          onInquire={(property) => {
            setDetailProperty(null);
            onPropertyInquiry?.(property);
          }}
        />
      ) : null}
    </>
  );
}


