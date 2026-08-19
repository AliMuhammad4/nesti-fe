'use client';

import { useEffect, useRef, useState } from 'react';
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

function luxuryListingCardVisualClass(cardStyle = 'bordered') {
  if (cardStyle === 'flat') {
    return 'rounded-[1.15rem] border border-transparent bg-[#141210]';
  }
  if (cardStyle === 'glass') {
    return 'rounded-[1.15rem] border border-white/20 bg-white/[0.04] backdrop-blur-md';
  }
  if (cardStyle === 'elevated') {
    return 'rounded-[1.15rem] border border-accent/18 bg-[#141210] ring-1 ring-white/8';
  }
  return 'rounded-[1.15rem] border border-accent/24 bg-[#141210] ring-1 ring-white/10';
}

function luxuryListingHoverClass(cardStyle = 'bordered') {
  if (cardStyle === 'flat') {
    return 'hover:-translate-y-0.5 hover:bg-[#191613]';
  }
  if (cardStyle === 'glass') {
    return 'hover:-translate-y-1 hover:border-accent/42 hover:bg-white/[0.06] hover:shadow-[0_16px_36px_rgba(0,0,0,0.34)]';
  }
  if (cardStyle === 'elevated') {
    return 'hover:-translate-y-1 hover:border-accent/48 hover:ring-accent/25 hover:shadow-[0_20px_44px_rgba(0,0,0,0.4)]';
  }
  return 'hover:-translate-y-1 hover:border-accent/50 hover:ring-accent/22 hover:shadow-[0_18px_40px_rgba(0,0,0,0.36)]';
}

function sellerListingCardVisualClass(cardStyle = 'bordered') {
  if (cardStyle === 'flat') {
    return 'rounded-[1.1rem] border border-transparent bg-white';
  }
  if (cardStyle === 'glass') {
    return 'rounded-[1.1rem] border border-primary/20 bg-white/90 backdrop-blur-sm ring-1 ring-accent/20';
  }
  if (cardStyle === 'elevated') {
    return 'rounded-[1.1rem] border border-primary/18 bg-white ring-1 ring-accent/14';
  }
  return 'rounded-[1.1rem] border border-primary/16 bg-white ring-1 ring-accent/12';
}

function sellerListingHoverClass(cardStyle = 'bordered') {
  if (cardStyle === 'flat') {
    return 'hover:-translate-y-0.5 hover:bg-slate-50';
  }
  if (cardStyle === 'glass') {
    return 'hover:-translate-y-1 hover:border-accent/40 hover:ring-accent/28 hover:shadow-[0_18px_42px_rgba(15,23,42,0.14)]';
  }
  if (cardStyle === 'elevated') {
    return 'hover:-translate-y-1.5 hover:border-accent/42 hover:ring-accent/30 hover:shadow-[0_22px_46px_rgba(15,23,42,0.16)]';
  }
  return 'hover:-translate-y-1 hover:border-accent/35 hover:ring-accent/24 hover:shadow-[0_20px_44px_rgba(15,23,42,0.14)]';
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

function formatListingPrice(value, includeDollar = false) {
  if (value == null || value === '') return 'Contact for Price';
  if (typeof value === 'number') {
    const formatted = value.toLocaleString();
    return includeDollar ? `$${formatted}` : formatted;
  }
  const raw = String(value).trim();
  const numericOnly = raw.replace(/[^0-9.]/g, '');
  const parsed = Number(numericOnly);
  if (numericOnly && Number.isFinite(parsed) && parsed > 0) {
    const formatted = parsed.toLocaleString();
    return includeDollar ? `$${formatted}` : formatted;
  }
  return raw;
}

function validListingObjects(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((listing) => (
    listing
    && typeof listing === 'object'
    && !Array.isArray(listing)
    && [
      listing.title,
      listing.address,
      listing.location,
      listing.price,
      listing.expected_price,
      listing.image_url,
      listing.photos?.[0],
      listing.images?.[0],
      listing.property_type,
    ].some((field) => field != null && field !== '')
  ));
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
  presentation = 'standard',
}) {
  const [resolvedListings, setResolvedListings] = useState(() => validListingObjects(listings));
  // Keep SSR and the first client paint aligned: if live listings will be fetched,
  // render the loading shell instead of null so sections below the hero do not jump.
  const [loadingLiveListings, setLoadingLiveListings] = useState(() => {
    if (validListingObjects(listings).length) return false;
    return ['featured', 'sold'].includes(type) && Boolean(profileSlug || builderAccessToken);
  });
  const [detailProperty, setDetailProperty] = useState(null);
  const resolvedListingsRef = useRef(resolvedListings);
  resolvedListingsRef.current = resolvedListings;

  useEffect(() => {
    const suppliedListings = validListingObjects(listings);
    if (suppliedListings.length) {
      setResolvedListings(suppliedListings);
      setLoadingLiveListings(false);
      return;
    }

    if (!['featured', 'sold'].includes(type) || (!profileSlug && !builderAccessToken)) {
      setResolvedListings([]);
      setLoadingLiveListings(false);
      return;
    }

    let cancelled = false;
    // Avoid skeleton flash when cards are already painted (common in builder remounts).
    if (!resolvedListingsRef.current.length) {
      setLoadingLiveListings(true);
    }
    const propertiesRequest = preview && builderAccessToken
      ? getOwnStorefrontProperties(builderAccessToken)
      : getSellerProperties(profileSlug);
    propertiesRequest
      .then((data) => {
        if (cancelled) return;
        const properties = validListingObjects(data?.properties);
        const normalizedProperties = properties.map((property) => ({
          ...property,
          _id: property._id || property.id,
          price: property.price || property.expected_price,
          photos: property.photos?.length ? property.photos : property.images || [],
          square_feet: property.square_feet || property.square_footage,
          status: property.status || 'available',
        }));
        setResolvedListings(type === 'sold'
          ? normalizedProperties.filter((property) => ['sold', 'closed'].includes(String(property.status || '').toLowerCase()))
          : normalizedProperties);
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
    if (preview || type === 'sold') return;
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
  const configuredColumnCount = String(layout.columns || '4');
  const visibleListingLimit = Math.min(4, Math.max(1, Number(configuredColumnCount) || 4));
  const visibleListings = showAll
    ? resolvedListings
    : resolvedListings.slice(0, visibleListingLimit);
  const cardStyle = presentation === 'firstHome' && layout.cardStyle === 'glass'
    ? 'bordered'
    : (layout.cardStyle || 'bordered');
  const cardVisualClass = listingCardVisualClass(cardStyle);
  const storedCardBackground = String(content.card_background || '').trim();
  const normalizedCardBackground = storedCardBackground.toLowerCase().replace(/\s+/g, '');
  const isLegacyLuxuryCard = presentation === 'luxury' && (
    normalizedCardBackground.includes('fffdf8')
    || /255,253,248/.test(normalizedCardBackground)
  );
  const cardBackground = isLegacyLuxuryCard
    ? '#171513'
    : storedCardBackground;
  const cardTextColor = content.card_text_color || '';
  const hasCardText = Boolean(cardTextColor);
  const cardRadius = listingCardRadius(sectionStyle.radius || layout.radius || 'default');
  const cardBoxShadow = listingCardShadow(cardStyle, sectionStyle.shadow || 'none');
  const columnCount = forceMobilePreview ? '1' : forceTabletPreview ? '2' : configuredColumnCount;
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
  const singleSoldGridWidthClass = isSold && visibleListings.length === 1 && !forceMobilePreview
    ? (columnCount === '1'
      ? 'w-full grid-cols-1'
      : preview
        ? 'w-full max-w-[26rem] grid-cols-1'
        : 'w-full grid-cols-1 sm:max-w-[26rem]')
    : '';
  const effectiveListingsGridClass = singleSoldGridWidthClass || listingsGridClass;
  const eyebrowDefault = showAll
    ? 'Complete inventory'
    : isSold
      ? 'Recently sold'
      : type === 'top'
        ? 'Top picks'
        : 'Available properties';
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
  const useFullWidthSection = showAll
    || presentation === 'luxury'
    || presentation === 'firstHome'
    || presentation === 'seller'
    || (presentation === 'community' && sectionWidth === 'full');
  const containerWidthClass = useFullWidthSection
    ? 'max-w-none'
    : sectionWidth === 'narrow'
      ? 'max-w-5xl'
      : sectionWidth === 'contained'
        ? 'max-w-6xl'
        : 'max-w-7xl';
  const sectionContainerClass = useFullWidthSection
    ? (presentation === 'luxury'
      ? 'w-full px-2 sm:px-4 lg:px-6 xl:px-8'
      : 'w-full px-5 sm:px-8 lg:px-12 2xl:px-16')
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
  const presentationConfig = {
    luxury: { grid: '', card: '', image: 'h-44 sm:h-52', eyebrow: 'Featured property' },
    firstHome: { grid: 'lg:grid-cols-3', card: 'rounded', image: 'h-52', eyebrow: 'Buyer-friendly starting point' },
    seller: { grid: '', card: '', image: 'h-48', eyebrow: 'Campaign showcase' },
    community: { grid: '', card: 'rounded-[1.25rem]', image: 'h-52', eyebrow: 'Around the neighborhood' },
    standard: { grid: '', card: '', image: '', eyebrow: '' },
  }[presentation] || { grid: '', card: '', image: '', eyebrow: '' };
  const isLuxuryPresentation = presentation === 'luxury';
  const isFirstHomePresentation = presentation === 'firstHome';
  const isSellerPresentation = presentation === 'seller';
  const isCommunityPresentation = presentation === 'community';
  const luxuryCardClass = luxuryListingCardVisualClass(cardStyle);
  const luxuryHoverClass = luxuryListingHoverClass(cardStyle);
  const sellerCardClass = sellerListingCardVisualClass(cardStyle);
  const sellerHoverClass = sellerListingHoverClass(cardStyle);
  const legacyLuxuryHeading = isLuxuryPresentation && (
    /^(signature properties|available properties)$/i.test(String(title || '').trim())
    || /redefining modern elegance/i.test(String(title || '').trim())
  );
  const legacyLuxuryBody = isLuxuryPresentation && (
    /curated inventory presented with discretion/i.test(String(description || ''))
    || /portfolio is art and prestige/i.test(String(description || ''))
  );
  const luxuryTitle = legacyLuxuryHeading ? 'Featured properties' : title;
  // Keep builder body editable, but hide the old marketing blurbs that made this header noisy.
  const luxuryDescription = legacyLuxuryBody ? '' : description;
  const rawEyebrow = (content.eyebrow || '').trim()
    || (isLuxuryPresentation ? '' : (presentationConfig.eyebrow || eyebrowDefault));
  const legacyLuxuryEyebrow = isLuxuryPresentation && /^(featured property|available properties|signature properties)$/i.test(rawEyebrow);
  // Drop redundant eyebrows once the heading already carries the section label.
  const eyebrow = legacyLuxuryEyebrow ? '' : rawEyebrow;
  const presentationSectionClass = presentation === 'luxury' ? 'pb-10 sm:pb-12' : '';
  const luxuryRadius = sectionStyle.radius === 'none'
    ? '0px'
    : sectionStyle.radius === 'small'
      ? '1rem'
      : '1.75rem';
  const resolvedCardRadius = isLuxuryPresentation ? luxuryRadius : cardRadius;
  const resolvedCardShadow = isLuxuryPresentation
    ? (sectionStyle.shadow === 'none' ? 'none' : '0 24px 60px rgba(0,0,0,0.35)')
    : isSellerPresentation
      ? (sectionStyle.shadow === 'none' ? '0 14px 34px rgba(15,23,42,0.09)' : cardBoxShadow)
      : isCommunityPresentation && !sectionStyle.shadow
        ? '0 18px 45px rgba(15,23,42,.09)'
        : cardBoxShadow;
  const communityCardRadius = sectionStyle.radius || layout.radius
    ? cardRadius
    : '1.5rem';
  const viewAllToneClass = presentation === 'luxury'
    ? 'border-accent/55 bg-transparent text-[#f5f1e8] hover:border-accent hover:bg-[#1a1714]'
    : 'border-slate-300 bg-white text-slate-700 hover:border-primary/40 hover:bg-slate-50 hover:text-primary';
  const showLuxuryViewAll = type === 'featured' && !showAll && showViewAll && resolvedListings.length > visibleListingLimit;

  if (loadingLiveListings && !resolvedListings.length) {
    return (
      <section className={`bg-transparent ${sectionPaddingClass} ${variantConfig.sectionToneClass}`}>
        <div className={sectionContainerClass}>
          <div className="mb-6 h-7 w-56 animate-pulse rounded bg-slate-200" />
          <div
            className={`storefront-listings-grid grid ${effectiveListingsGridClass} ${presentationConfig.grid} ${variantConfig.gridGapClass}`}
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
              className={`mt-8 storefront-listings-grid grid ${effectiveListingsGridClass} ${variantConfig.gridGapClass}`}
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
        className={`bg-transparent ${sectionPaddingClass} ${variantConfig.sectionToneClass} ${presentationSectionClass}`}
        style={{
          color: sectionStyle.textColor || undefined,
          background: sectionStyle.background || undefined,
        }}
      >
        <div className={sectionContainerClass}>
          {isLuxuryPresentation ? (
            <div className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 max-w-2xl">
                {eyebrow ? (
                  <p
                    data-storefront-field="content.eyebrow"
                    data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
                    data-storefront-label="Listings eyebrow"
                    className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent/80"
                  >
                    {eyebrow}
                  </p>
                ) : (
                  <span
                    data-storefront-field="content.eyebrow"
                    data-storefront-source="fallback"
                    data-storefront-label="Listings eyebrow"
                    className="sr-only"
                  >
                    Featured properties
                  </span>
                )}
                <h2
                  data-storefront-field="content.heading"
                  data-storefront-source={content.heading && !legacyLuxuryHeading ? 'persisted' : 'fallback'}
                  data-storefront-label="Listings heading"
                  className={`font-serif text-[1.65rem] font-normal leading-[1.15] tracking-[-0.01em] text-white sm:text-[2rem] ${eyebrow ? 'mt-2.5' : ''}`}
                >
                  {luxuryTitle}
                </h2>
                {luxuryDescription ? (
                  <p
                    data-storefront-field="content.body"
                    data-storefront-source={content.body && !legacyLuxuryBody ? 'persisted' : 'fallback'}
                    data-storefront-label="Listings description"
                    className="mt-2.5 max-w-lg text-[13px] leading-6 text-[#e8e0d0]/62"
                  >
                    {luxuryDescription}
                  </p>
                ) : (
                  <span
                    data-storefront-field="content.body"
                    data-storefront-source="fallback"
                    data-storefront-label="Listings description"
                    className="sr-only"
                  />
                )}
              </div>
              {showLuxuryViewAll ? (
                <Link
                  href={propertiesHref}
                  onClick={(event) => {
                    if (preview) event.preventDefault();
                  }}
                  aria-disabled={preview}
                  className={`storefront-btn inline-flex h-9 shrink-0 items-center gap-2 border px-4 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${viewAllToneClass}`}
                  style={{ borderRadius: '999px' }}
                >
                  View all
                  <ArrowRight size={13} />
                </Link>
              ) : null}
            </div>
          ) : (
            <div className={`mb-6 flex flex-col gap-3 ${headerWrapClass}`}>
              <div className={headerTextClass}>
                <p
                  data-storefront-field="content.eyebrow"
                  data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
                  data-storefront-label="Listings eyebrow"
                  className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    isCommunityPresentation
                      ? 'inline-flex rounded-md bg-primary px-2.5 py-1 text-primary-contrast'
                      : hasSectionText ? 'text-current' : 'text-primary'
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
                    hasSectionText ? 'text-current' : isCommunityPresentation ? 'text-text-heading' : 'text-slate-900'
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
                      hasSectionText ? 'text-current' : isCommunityPresentation ? 'text-text-muted' : 'text-slate-500'
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
              {type === 'featured' && !showAll && showViewAll && resolvedListings.length > visibleListingLimit ? (
                <Link
                  href={propertiesHref}
                  onClick={(event) => {
                    if (preview) event.preventDefault();
                  }}
                  aria-disabled={preview}
                  className={`storefront-btn inline-flex h-9 shrink-0 items-center gap-1.5 border px-3.5 text-xs font-semibold transition ${viewAllToneClass} ${viewAllPlacementClass}`}
                  style={{ borderRadius: 'var(--storefront-radius)' }}
                >
                  View all properties
                  <ArrowRight size={13} />
                </Link>
              ) : null}
            </div>
          )}

          <div
            className={`storefront-listings-grid grid ${singleSoldGridWidthClass ? 'storefront-single-sold-grid' : ''} ${effectiveListingsGridClass} ${presentationConfig.grid} ${isLuxuryPresentation ? 'gap-4 lg:gap-5' : variantConfig.gridGapClass}`}
          >
          {visibleListings.map((listing, index) => (
            <button
              type="button"
              key={listing._id || index}
              onClick={() => handleListingClick(listing)}
              disabled={isSold && !preview}
              data-storefront-anim-item="true"
              data-storefront-field="content.card_background"
              data-storefront-source={content.card_background ? 'persisted' : 'fallback'}
              data-storefront-label={`Property card ${index + 1}`}
              className={`group relative w-full overflow-hidden text-left transition-all duration-500 ${isSold && !preview ? 'cursor-default' : 'cursor-pointer'} ${isLuxuryPresentation ? luxuryHoverClass : isSellerPresentation ? sellerHoverClass : isCommunityPresentation ? 'hover:-translate-y-1.5 hover:border-accent/70 hover:shadow-[0_24px_55px_rgba(15,23,42,.14)]' : 'hover:-translate-y-0.5 hover:border-primary/30'} ${isLuxuryPresentation ? luxuryCardClass : isSellerPresentation ? sellerCardClass : cardVisualClass} ${!isLuxuryPresentation ? presentationConfig.card : ''}`}
              style={{
                borderRadius: isCommunityPresentation ? communityCardRadius : resolvedCardRadius,
                boxShadow: resolvedCardShadow,
                ...(cardBackground ? { backgroundColor: isLegacyLuxuryCard ? '#141210' : cardBackground } : {}),
                ...(cardTextColor ? { color: cardTextColor } : {}),
                ...(!cardBackground && isLuxuryPresentation ? { backgroundColor: '#141210' } : {}),
                ...(!cardBackground && isCommunityPresentation ? { backgroundColor: '#ffffff' } : {}),
              }}
            >
              <div className={`relative overflow-hidden ${isLuxuryPresentation ? 'bg-[#1c1917]' : isSellerPresentation ? 'bg-[#0f172a]' : isCommunityPresentation ? 'bg-primary' : 'bg-slate-100'} ${presentationConfig.image || variantConfig.cardImageHeightClass}`}>
                {listing.image_url || listing.photos?.[0] ? (
                  <Image
                    src={listing.image_url || listing.photos[0]}
                    alt={listing.title || 'Property'}
                    fill
                    sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={`object-cover transition-transform duration-700 ${isSellerPresentation || isCommunityPresentation ? 'group-hover:scale-[1.04]' : 'group-hover:scale-[1.025]'} ${isLuxuryPresentation ? 'grayscale-[0.14] contrast-[1.03] saturate-[0.95]' : isSellerPresentation ? 'contrast-[1.05] saturate-[1.03]' : isCommunityPresentation ? 'contrast-[1.02]' : ''}`}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                    <MapPin size={32} />
                  </div>
                )}
                {isLuxuryPresentation ? (
                  <>
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
                      style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.36), rgba(0, 0, 0, 0.12), transparent)' }}
                    />
                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-accent/12 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />
                  </>
                ) : isSellerPresentation ? (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/65 via-[#0f172a]/18 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent/70 to-transparent opacity-75 transition duration-500 group-hover:opacity-100" />
                  </>
                ) : null}
                {isSold && (
                  <div className={`absolute right-3 top-3 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[.14em] ${isLuxuryPresentation ? 'rounded-full bg-accent text-[#14110e] ring-1 ring-black/20 shadow-[0_8px_18px_rgba(0,0,0,.28)]' : isSellerPresentation ? 'rounded-full bg-primary text-white shadow-[0_8px_18px_rgba(2,6,23,.24)]' : isCommunityPresentation ? 'rounded-full border border-accent/50 bg-accent text-accent-contrast shadow-[0_8px_22px_rgba(15,23,42,.2)]' : 'rounded-full bg-accent text-white'}`}>
                    SOLD
                  </div>
                )}
                {!isSold && listing.status && (
                  <div className={`absolute right-3 top-3 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[.14em] ${isLuxuryPresentation ? 'rounded-full bg-accent text-[#14110e] ring-1 ring-black/20 shadow-[0_8px_18px_rgba(0,0,0,.28)]' : isSellerPresentation ? 'rounded-full bg-primary text-white shadow-[0_8px_18px_rgba(2,6,23,.24)]' : isCommunityPresentation ? 'rounded-full border border-accent/35 bg-primary/90 text-white shadow-[0_8px_22px_rgba(15,23,42,.24)] backdrop-blur' : 'shadow-sm rounded-full bg-primary text-white'}`}>
                    {listing.status.toUpperCase()}
                  </div>
                )}
              </div>

              {isFirstHomePresentation ? (
                <div className="grid min-h-14 grid-cols-3 divide-x divide-white/10 bg-[#111111] text-white">
                  <div className="flex items-center justify-center gap-2 px-2 py-3 text-[10px] font-semibold">
                    <Bed size={15} className="text-white/70" />
                    <span className="tabular-nums">{listing.bedrooms || '—'} Bed</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-2 py-3 text-[10px] font-semibold">
                    <Bath size={15} className="text-white/70" />
                    <span className="tabular-nums">{listing.bathrooms || '—'} Bath</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-accent px-2 py-3 text-[10px] font-bold text-[#0b3d20]">
                    <Ruler size={15} />
                    <span>{listing.square_feet ? `${listing.square_feet.toLocaleString()} sqft` : 'Details'}</span>
                  </div>
                </div>
              ) : null}

              <div className={isLuxuryPresentation ? 'relative p-4 sm:p-5' : isFirstHomePresentation ? 'p-5' : isSellerPresentation ? 'relative p-4 sm:p-[1.125rem]' : isCommunityPresentation ? 'relative bg-white p-4 text-primary sm:p-5' : variantConfig.cardBodyPaddingClass}>
                {isLuxuryPresentation ? (
                  <span className="pointer-events-none absolute left-5 right-5 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" aria-hidden="true" />
                ) : null}
                <div className={`mb-2.5 flex items-center gap-1.5 ${isSellerPresentation ? 'relative' : ''}`}>
                  {!isLuxuryPresentation ? <DollarSign size={14} className={hasCardText ? 'text-current' : 'text-accent'} /> : null}
                  <span className={`${isLuxuryPresentation ? 'font-serif text-[1.28rem] font-normal tracking-[0.01em] text-accent' : 'text-base font-bold tracking-tight'} tabular-nums leading-none ${!isLuxuryPresentation && (hasCardText ? 'text-current' : 'text-accent')}`}>
                    {formatListingPrice(listing.price, isLuxuryPresentation)}
                  </span>
                  {isSellerPresentation ? <span className="ml-auto h-px w-10 bg-gradient-to-r from-accent/60 to-transparent" /> : null}
                </div>

                {(listing.address || listing.location) && (
                  <p className={`mb-2 flex items-start gap-1.5 text-[11px] ${hasCardText ? 'text-current' : isLuxuryPresentation ? 'text-white/58' : isCommunityPresentation ? 'text-slate-500' : 'text-slate-500'}`} style={hasCardText ? { opacity: 0.8 } : undefined}>
                    <MapPin size={13} className={`mt-0.5 shrink-0 ${hasCardText ? 'text-current' : isLuxuryPresentation ? 'text-accent' : isCommunityPresentation ? 'text-accent' : 'text-primary'}`} />
                    <span className="line-clamp-1">{listing.address || listing.location}</span>
                  </p>
                )}

                {!isFirstHomePresentation ? <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-medium ${hasCardText ? 'text-current' : isLuxuryPresentation ? 'text-white/68' : isCommunityPresentation ? 'text-slate-600' : 'text-slate-600'}`} style={hasCardText ? { opacity: 0.88 } : undefined}>
                  {listing.bedrooms && (
                    <div className="flex items-center gap-1 whitespace-nowrap leading-none">
                      <Bed size={13} className={`shrink-0 ${hasCardText ? 'text-current' : isLuxuryPresentation ? 'text-accent' : isCommunityPresentation ? 'text-accent' : 'text-primary'}`} />
                      <span className="tabular-nums">{listing.bedrooms} Bed</span>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="flex items-center gap-1 whitespace-nowrap leading-none">
                      <Bath size={13} className={`shrink-0 ${hasCardText ? 'text-current' : isLuxuryPresentation ? 'text-accent' : isCommunityPresentation ? 'text-accent' : 'text-primary'}`} />
                      <span className="tabular-nums">{listing.bathrooms} Bath</span>
                    </div>
                  )}
                  {listing.square_feet && (
                    <div className="flex items-center gap-1">
                      <Ruler size={13} className={hasCardText ? 'text-current' : isLuxuryPresentation ? 'text-accent' : isCommunityPresentation ? 'text-accent' : 'text-primary'} />
                      <span>{listing.square_feet.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div> : null}

                {listing.property_type && (
                  <div className={`mt-2.5 border-t pt-2 ${hasCardText ? 'border-current/20' : isLuxuryPresentation ? 'border-accent/28' : isCommunityPresentation ? 'border-slate-100' : 'border-slate-100'}`}>
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${hasCardText ? 'text-current' : isLuxuryPresentation ? 'text-white/44' : isCommunityPresentation ? 'text-slate-500' : 'text-slate-500'}`} style={hasCardText ? { opacity: 0.72 } : undefined}>
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
      {detailProperty && !isSold ? (
        <PropertyModal
          property={detailProperty}
          profile={profile}
          onClose={() => setDetailProperty(null)}
          onInquire={isSold
            ? undefined
            : (property) => {
                setDetailProperty(null);
                onPropertyInquiry?.(property);
              }}
        />
      ) : null}
    </>
  );
}
