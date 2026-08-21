import { notFound } from 'next/navigation';
import { getPublicProfile, getPublishedStorefront, getSellerProperties } from '@/lib/publicProfileClient';
import PublicStorefrontPageClient from '@/components/storefront/PublicStorefrontPageClient';

function normalizePublishedListing(property = {}) {
  return {
    ...property,
    _id: property._id || property.id,
    price: property.price || property.expected_price,
    photos: property.photos?.length ? property.photos : property.images || [],
    image_url: property.image_url || property.photos?.[0] || property.images?.[0] || '',
    square_feet: property.square_feet || property.square_footage,
    status: property.status || 'available',
  };
}

function isSoldListing(property = {}) {
  return ['sold', 'closed'].includes(String(property.status || '').toLowerCase());
}

function resolvePublishedBrandKit(templateKey, brandKit = {}) {
  if (templateKey !== 'agent-community-expert') return brandKit;
  const next = { ...brandKit };
  const primary = String(next.primary_color || '').trim().toLowerCase();
  const accent = String(next.accent_color || '').trim().toLowerCase();
  const canvas = String(next.page_background || '').trim().toLowerCase();
  const usesLegacyPalette = [
    '#166534|#f97316',
    '#172b42|#42b7f5',
    '#0f172a|#06b6d4',
    '#1e3a8a|#f59e0b',
  ].includes(`${primary}|${accent}`);
  const usesIndigoAccent = ['#8b5cf6', '#7c3aed', '#6366f1', '#a78bfa'].includes(accent);
  if (!usesLegacyPalette && !usesIndigoAccent) return next;
  if (usesLegacyPalette) next.primary_color = '#17152b';
  next.accent_color = '#1f6fbf';
  if (['#ffffff', '#eaf8ef', '#f7fbf6', '#f6f7f9', '#f8fafc', '#f5f7ff', '#f8f7fc'].includes(canvas)) {
    next.page_background = '#f5f7fa';
  }
  if (next.image_style === 'warm') next.image_style = 'editorial';
  return next;
}

function normalizePublishedBlocks(blocks = []) {
  return (Array.isArray(blocks) ? blocks : []).map((block, index) => {
    const data = block?.data || {};
    const type = block?.type || data.type || `block-${index + 1}`;
    const content = data.content || block?.content || {};
    const layout = data.layout || block?.layout || {};
    const style = data.style || block?.style || {};
    return {
      ...block,
      id: block?.id || `${type}-${index + 1}`,
      type,
      enabled: data.enabled ?? block?.enabled ?? true,
      content,
      layout,
      style,
      data: {
        ...data,
        enabled: data.enabled ?? block?.enabled ?? true,
        content,
        layout,
        style,
      },
    };
  });
}

export async function generateMetadata({ params }) {
  try {
    const data = await getPublicProfile(params.slug);
    const profile = data.profile;

    const title = profile.seo_meta?.title || 
      `${profile.professional_name} - ${profile.professional_type === 'agent' ? 'Real Estate Agent' : profile.professional_type === 'mortgage_broker' ? 'Mortgage Broker' : 'Real Estate Lawyer'}`;
    
    const description = profile.seo_meta?.description || 
      profile.tagline || 
      profile.about?.substring(0, 160) || 
      `Connect with ${profile.professional_name}, a trusted ${profile.professional_type} professional.`;

    return {
      title,
      description,
      keywords: profile.seo_meta?.keywords || [],
      openGraph: {
        title,
        description,
        images: profile.cover_photo_url ? [profile.cover_photo_url] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Profile Not Found',
      description: 'This professional profile could not be found.',
    };
  }
}

export default async function PublicProfilePage({ params }) {
  let data;
  let storefrontResponse;
  let propertiesResponse;
  
  try {
    [data, storefrontResponse, propertiesResponse] = await Promise.all([
      getPublicProfile(params.slug),
      getPublishedStorefront(params.slug).catch(() => null),
      getSellerProperties(params.slug).catch(() => null),
    ]);
  } catch (error) {
    notFound();
  }

  const profile = data.profile;

  if (!profile || !profile.enabled) {
    notFound();
  }
  const published = storefrontResponse?.storefront?.published || null;
  const publishedTemplateKey = published?.template?.id || profile.storefront_template_key || '';
  const publishedBrandKit = resolvePublishedBrandKit(publishedTemplateKey, published?.brandKit || {});
  const resolvedCoverPhoto = publishedBrandKit.cover_url || profile.cover_photo_url || '';
  const resolvedProfilePhoto = publishedBrandKit.profile_photo_url || profile.profile_photo_url || '';

  // Prefetch seller properties on the server so featured/sold sections render in the
  // initial HTML. Without this, those blocks are empty on first paint and the page
  // briefly shows the next section under the hero until the client fetch completes.
  let publishedFeaturedListings = Array.isArray(profile.featured_listings) ? profile.featured_listings : [];
  let publishedSoldListings = Array.isArray(profile.recent_closed_seller_leads)
    ? profile.recent_closed_seller_leads
    : (Array.isArray(profile.sold_listings) ? profile.sold_listings : []);
  if (profile.professional_type === 'agent') {
    const normalized = (Array.isArray(propertiesResponse?.properties) ? propertiesResponse.properties : [])
      .map(normalizePublishedListing)
      .filter((listing) => listing && (
        listing.title
        || listing.address
        || listing.location
        || listing.price
        || listing.image_url
        || listing.photos?.[0]
        || listing.property_type
      ));
    if (!publishedFeaturedListings.length) {
      publishedFeaturedListings = normalized.filter((listing) => !isSoldListing(listing));
    }
    if (!publishedSoldListings.length) {
      publishedSoldListings = normalized.filter((listing) => isSoldListing(listing));
    }
  }

  const storefrontProfile = published
    ? {
        ...profile,
        featured_listings: publishedFeaturedListings,
        sold_listings: publishedSoldListings,
        recent_closed_seller_leads: publishedSoldListings,
        storefront_blocks: normalizePublishedBlocks(published.blocks),
        storefront_theme: {
          primary: publishedBrandKit.primary_color || undefined,
          accent: publishedBrandKit.accent_color || undefined,
          canvas: publishedBrandKit.page_background || undefined,
          fontFamily: publishedBrandKit.font || publishedBrandKit.font_family || undefined,
          radius: publishedBrandKit.button_shape === 'pill'
            ? '999px'
            : publishedBrandKit.button_shape === 'square'
              ? '2px'
              : '0.75rem',
        },
        storefront_brand_kit: publishedBrandKit,
        professional_name: profile.professional_name,
        storefront_logo_url: publishedBrandKit.logo_url || '',
        storefront_logo_dark_url: publishedBrandKit.logo_dark_url || '',
        storefront_logo_size: publishedBrandKit.logo_size || 40,
        storefront_image_style: publishedBrandKit.image_style || '',
        storefront_essentials: publishedBrandKit.essentials || {},
        storefront_template_key: publishedTemplateKey,
        cover_photo_url: resolvedCoverPhoto,
        profile_photo_url: resolvedProfilePhoto,
        storefront_profile_fallback_url: profile.profile_photo_url || '',
        storefront_cover_position: {
          x: Number(publishedBrandKit.cover_position_x ?? 50),
          y: Number(publishedBrandKit.cover_position_y ?? 50),
        },
        storefront_cover_zoom: Math.max(1, Number(publishedBrandKit.cover_zoom ?? 1)),
        storefront_profile_position: {
          x: Number(publishedBrandKit.profile_position_x ?? 50),
          y: Number(publishedBrandKit.profile_position_y ?? 25),
        },
        storefront_profile_zoom: Number(publishedBrandKit.profile_zoom ?? 1),
        storefront_show_chatbot: publishedBrandKit.show_chatbot !== false,
      }
    : {
        ...profile,
        featured_listings: publishedFeaturedListings,
        sold_listings: publishedSoldListings,
        recent_closed_seller_leads: publishedSoldListings,
      };

  return <PublicStorefrontPageClient profile={storefrontProfile} />;
}
