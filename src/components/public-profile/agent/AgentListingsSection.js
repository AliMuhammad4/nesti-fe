'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bath, Bed, DollarSign, MapPin, Ruler } from 'lucide-react';
import { getOwnStorefrontProperties, getSellerProperties, trackAnalyticsEvent } from '@/lib/publicProfileClient';
import { generateSessionId, generateVisitorId } from '@/utils/sessionHelpers';
import { PropertyModal } from './AgentPropertiesSection';

function listingCardVisualClass(cardStyle = 'bordered') {
  if (cardStyle === 'glass') {
    return 'border border-white/70 bg-white/70 backdrop-blur-md ring-1 ring-white/40';
  }
  if (cardStyle === 'elevated') {
    return 'border border-slate-100 bg-white';
  }
  if (cardStyle === 'flat') {
    return 'border border-transparent bg-white';
  }
  return 'border border-slate-200/90 bg-white';
}

function listingCardRadius(radius = 'default') {
  if (radius === 'none') return '0px';
  if (radius === 'large') return '1.25rem';
  return '0.75rem';
}

const LISTING_CARD_SHADOW = {
  none: 'none',
  small: '0 8px 24px rgba(15,23,42,0.10)',
  medium: '0 14px 36px rgba(15,23,42,0.14)',
  large: '0 22px 56px rgba(15,23,42,0.18)',
};

function listingCardShadow(cardStyle = 'bordered', shadow = 'none') {
  if (cardStyle === 'flat') return 'none';
  if (shadow === 'none') {
    if (cardStyle === 'elevated') return LISTING_CARD_SHADOW.medium;
    if (cardStyle === 'glass') return LISTING_CARD_SHADOW.small;
  }
  return LISTING_CARD_SHADOW[shadow] || 'none';
}

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
  content = {},
  layout = {},
  sectionStyle = {},
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
      });
    } catch {
      // Analytics should never block listing open.
    }
  };

  const isSold = type === 'sold';
  const previewMode = profile?.storefront_preview_mode || 'desktop';
  const forceMobilePreview = Boolean(preview && previewMode === 'mobile');
  const forceTabletPreview = Boolean(preview && previewMode === 'tablet');
  const visibleListings = showAll ? resolvedListings : resolvedListings.slice(0, 4);
  const cardStyle = layout.cardStyle || 'bordered';
  const cardVisualClass = listingCardVisualClass(cardStyle);
  const cardBackground = content.card_background || '';
  const cardTextColor = content.card_text_color || '';
  const hasCardText = Boolean(cardTextColor);
  const cardRadius = listingCardRadius(sectionStyle.radius || layout.radius || 'default');
  const cardBoxShadow = listingCardShadow(cardStyle, sectionStyle.shadow || 'none');
  const columnCount = forceMobilePreview ? '1' : forceTabletPreview ? '2' : String(layout.columns || '4');
  // In builder preview, avoid breakpoint utilities — the frame is scaled inside a desktop viewport.
  const listingsGridClass = forceMobilePreview
    ? 'grid-cols-1'
    : forceTabletPreview
      ? 'grid-cols-2'
      : columnCount === '1'
        ? 'grid-cols-1'
        : columnCount === '2'
          ? 'grid-cols-1 sm:grid-cols-2'
          : columnCount === '3'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  const eyebrowDefault = showAll
    ? 'Complete inventory'
    : isSold
      ? 'Recently sold'
      : type === 'top'
        ? 'Top picks'
        : 'Available properties';
  const eyebrow = (content.eyebrow || '').trim() || eyebrowDefault;
  const hasSectionText = Boolean(sectionStyle.textColor);
  const propertiesHref = `/professional/${profileSlug}/properties`;
  const sectionAlignment = layout.alignment || 'left';
  const sectionVariant = layout.variant || 'standard';
  const sectionPadding = layout.padding || 'medium';
  const sectionWidth = layout.width || 'full';
  const sectionPaddingClass = {
    small: type === 'featured' && !showAll ? 'pb-3 pt-8 sm:pb-4 sm:pt-10' : 'py-8 sm:py-10',
    medium: type === 'featured' && !showAll ? 'pb-4 pt-10 sm:pb-5 sm:pt-12' : 'py-10 sm:py-12',
    large: type === 'featured' && !showAll ? 'pb-6 pt-12 sm:pb-7 sm:pt-14' : 'py-12 sm:py-14',
  }[sectionPadding] || (type === 'featured' && !showAll ? 'pb-4 pt-10 sm:pb-5 sm:pt-12' : 'py-10 sm:py-12');
  const containerWidthClass = showAll
    ? 'max-w-none'
    : sectionWidth === 'narrow'
      ? 'max-w-5xl'
      : sectionWidth === 'contained'
        ? 'max-w-6xl'
        : 'max-w-7xl';
  const sectionContainerClass = showAll
    ? 'w-full px-5 sm:px-8 lg:px-12 xl:px-16'
    : `mx-auto ${containerWidthClass} px-4 sm:px-6 lg:px-8`;
  const headerWrapClass = forceMobilePreview
    ? (sectionAlignment === 'center'
      ? 'items-center text-center'
      : sectionAlignment === 'right'
        ? 'items-end text-right'
        : 'items-stretch')
    : sectionAlignment === 'center'
      ? 'items-center text-center'
      : sectionAlignment === 'right'
        ? 'items-end text-right'
        : forceTabletPreview
          ? 'items-stretch sm:flex-row sm:items-end sm:justify-between'
          : 'sm:flex-row sm:items-end sm:justify-between';
  const headerTextClass = sectionAlignment === 'center'
    ? 'mx-auto max-w-2xl text-center'
    : sectionAlignment === 'right'
      ? 'ml-auto max-w-2xl text-right'
      : 'max-w-2xl text-left';
  const viewAllPlacementClass = forceMobilePreview
    ? (sectionAlignment === 'center' ? 'self-center w-full justify-center' : sectionAlignment === 'right' ? 'self-end' : 'self-start w-full justify-center')
    : sectionAlignment === 'center'
      ? 'self-center'
      : sectionAlignment === 'right'
        ? 'self-end'
        : 'self-start sm:self-auto';
  const variantConfig = {
    standard: {
      sectionToneClass: '',
      headerTitleClass: '',
      headerBodyClass: '',
      gridGapClass: 'gap-4',
      cardImageHeightClass: 'h-36',
      cardBodyPaddingClass: 'p-3.5',
    },
    editorial: {
      sectionToneClass: 'bg-slate-50/40',
      headerTitleClass: 'tracking-[-0.015em] sm:text-[1.7rem]',
      headerBodyClass: 'text-[14px] leading-6',
      gridGapClass: 'gap-5',
      cardImageHeightClass: 'h-40',
      cardBodyPaddingClass: 'p-4',
    },
    split: {
      sectionToneClass: '',
      headerTitleClass: '',
      headerBodyClass: '',
      gridGapClass: 'gap-4',
      cardImageHeightClass: 'h-36',
      cardBodyPaddingClass: 'p-3.5',
    },
    'feature-grid': {
      sectionToneClass: '',
      headerTitleClass: 'sm:text-[1.65rem]',
      headerBodyClass: '',
      gridGapClass: 'gap-5',
      cardImageHeightClass: 'h-44',
      cardBodyPaddingClass: 'p-4',
    },
    'lead-magnet': {
      sectionToneClass: 'bg-primary/[0.03]',
      headerTitleClass: 'sm:text-[1.7rem]',
      headerBodyClass: 'text-[14px] leading-6',
      gridGapClass: 'gap-5',
      cardImageHeightClass: 'h-40',
      cardBodyPaddingClass: 'p-4',
    },
    premium: {
      sectionToneClass: 'bg-slate-900/[0.04]',
      headerTitleClass: 'tracking-[-0.02em] sm:text-[1.75rem]',
      headerBodyClass: 'text-[14px] leading-6',
      gridGapClass: 'gap-6',
      cardImageHeightClass: 'h-44',
      cardBodyPaddingClass: 'p-4',
    },
    minimal: {
      sectionToneClass: '',
      headerTitleClass: 'font-medium',
      headerBodyClass: 'text-[12px]',
      gridGapClass: 'gap-3',
      cardImageHeightClass: 'h-32',
      cardBodyPaddingClass: 'p-3',
    },
  }[sectionVariant] || {
    sectionToneClass: '',
    headerTitleClass: '',
    headerBodyClass: '',
    gridGapClass: 'gap-4',
    cardImageHeightClass: 'h-36',
    cardBodyPaddingClass: 'p-3.5',
  };

  if (loadingLiveListings && !resolvedListings.length) {
    return (
      <section className={`bg-transparent ${sectionPaddingClass} ${variantConfig.sectionToneClass}`}>
        <div className={sectionContainerClass}>
          <div className="mb-6 h-7 w-56 animate-pulse rounded bg-slate-200" />
          <div
            className={`storefront-listings-grid grid ${listingsGridClass} ${variantConfig.gridGapClass}`}
          >
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        </div>
      </section>
    );
  }

  if (!resolvedListings.length) {
    if (preview) {
      return (
        <section className={`bg-transparent ${sectionPaddingClass} ${variantConfig.sectionToneClass}`}>
          <div className={sectionContainerClass}>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Listings section</p>
              <h2 className="mt-2 text-3xl font-bold text-text-heading">{title}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted">
                Add listing details in the section editor or connect live listing data to populate this area.
              </p>
            </div>
            <div
              className={`mt-8 storefront-listings-grid grid ${listingsGridClass} ${variantConfig.gridGapClass}`}
            >
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`overflow-hidden ${cardVisualClass}`}
                  style={{
                    borderRadius: cardRadius,
                    boxShadow: cardBoxShadow,
                    ...(cardBackground ? { backgroundColor: cardBackground } : {}),
                  }}
                >
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
        className={`bg-transparent ${sectionPaddingClass} ${variantConfig.sectionToneClass}`}
        style={{ color: sectionStyle.textColor || undefined }}
      >
        <div className={sectionContainerClass}>
          <div className={`mb-6 flex flex-col gap-3 ${headerWrapClass}`}>
            <div className={headerTextClass}>
              <p
                data-storefront-field="content.eyebrow"
                data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
                data-storefront-label="Listings eyebrow"
                className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  hasSectionText ? 'text-current' : 'text-primary'
                }`}
                style={hasSectionText ? { opacity: 0.78 } : undefined}
              >
                {eyebrow}
              </p>
              <h2
                data-storefront-field="content.heading"
                data-storefront-source={content.heading ? 'persisted' : 'fallback'}
                data-storefront-label="Listings heading"
                className={`mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl ${variantConfig.headerTitleClass} ${
                  hasSectionText ? 'text-current' : 'text-slate-900'
                }`}
              >
                {title}
              </h2>
              {description ? (
                <p
                  data-storefront-field="content.body"
                  data-storefront-source={content.body ? 'persisted' : 'fallback'}
                  data-storefront-label="Listings description"
                  className={`mt-1.5 text-[13px] leading-5 ${variantConfig.headerBodyClass} ${
                    hasSectionText ? 'text-current' : 'text-slate-500'
                  }`}
                  style={hasSectionText ? { opacity: 0.86 } : undefined}
                >
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
                className={`storefront-btn inline-flex h-9 shrink-0 items-center gap-1.5 border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-slate-50 hover:text-primary ${viewAllPlacementClass}`}
                style={{ borderRadius: 'var(--storefront-radius)' }}
              >
                View all properties
                <ArrowRight size={13} />
              </Link>
            ) : null}
          </div>

          <div
            className={`storefront-listings-grid grid ${listingsGridClass} ${variantConfig.gridGapClass}`}
          >
          {visibleListings.map((listing, index) => (
            <button
              type="button"
              key={listing._id || index}
              onClick={() => handleListingClick(listing)}
              data-storefront-anim-item="true"
              data-storefront-field="content.card_background"
              data-storefront-source={content.card_background ? 'persisted' : 'fallback'}
              data-storefront-label={`Property card ${index + 1}`}
              className={`group w-full cursor-pointer overflow-hidden text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 ${cardVisualClass}`}
              style={{
                borderRadius: cardRadius,
                boxShadow: cardBoxShadow,
                ...(cardBackground ? { backgroundColor: cardBackground } : {}),
                ...(cardTextColor ? { color: cardTextColor } : {}),
              }}
            >
              <div className={`relative overflow-hidden bg-slate-100 ${variantConfig.cardImageHeightClass}`}>
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
                  <div className="absolute right-2.5 top-2.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold text-white">
                    SOLD
                  </div>
                )}
                {!isSold && listing.status && (
                  <div className="absolute right-2.5 top-2.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                    {listing.status.toUpperCase()}
                  </div>
                )}
              </div>

              <div className={variantConfig.cardBodyPaddingClass}>
                <div className="mb-2 flex items-center gap-1">
                  <DollarSign size={14} className={hasCardText ? 'text-current' : 'text-accent'} />
                  <span className={`text-base font-bold tracking-tight ${hasCardText ? 'text-current' : 'text-accent'}`}>
                    {listing.price
                      ? typeof listing.price === 'number'
                        ? listing.price.toLocaleString()
                        : listing.price
                      : 'Contact for Price'}
                  </span>
                </div>

                {(listing.address || listing.location) && (
                  <p className={`mb-2.5 flex items-start gap-1.5 text-[12px] ${hasCardText ? 'text-current' : 'text-slate-500'}`} style={hasCardText ? { opacity: 0.8 } : undefined}>
                    <MapPin size={13} className={`mt-0.5 shrink-0 ${hasCardText ? 'text-current' : 'text-primary'}`} />
                    <span className="line-clamp-1">{listing.address || listing.location}</span>
                  </p>
                )}

                <div className={`flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium ${hasCardText ? 'text-current' : 'text-slate-600'}`} style={hasCardText ? { opacity: 0.88 } : undefined}>
                  {listing.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed size={13} className={hasCardText ? 'text-current' : 'text-primary'} />
                      <span>{listing.bedrooms} Bed</span>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath size={13} className={hasCardText ? 'text-current' : 'text-primary'} />
                      <span>{listing.bathrooms} Bath</span>
                    </div>
                  )}
                  {listing.square_feet && (
                    <div className="flex items-center gap-1">
                      <Ruler size={13} className={hasCardText ? 'text-current' : 'text-primary'} />
                      <span>{listing.square_feet.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div>

                {listing.property_type && (
                  <div className={`mt-2.5 border-t pt-2 ${hasCardText ? 'border-current/20' : 'border-slate-100'}`}>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${hasCardText ? 'text-current' : 'text-slate-500'}`} style={hasCardText ? { opacity: 0.72 } : undefined}>
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
