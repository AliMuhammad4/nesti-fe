import { notFound } from 'next/navigation';
import { getPublicProfile, getPublishedStorefront, getSellerProperties } from '@/lib/publicProfileClient';
import PublicStorefrontPageClient from '@/components/storefront/PublicStorefrontPageClient';
import {
  canonicalPublishedStorefrontBlocks,
  resolvePublishedStorefrontBrandKit,
} from '@/lib/publishedStorefront';

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

export async function generateMetadata({ params }) {
  try {
    const [data, storefrontResponse] = await Promise.all([
      getPublicProfile(params.slug),
      getPublishedStorefront(params.slug).catch(() => null),
    ]);
    const profile = data.profile;
    const published = storefrontResponse?.storefront?.published || null;
    if (!published) {
      return {
        title: 'Profile Not Found',
        description: 'This professional profile is not currently published.',
        robots: { index: false, follow: false },
      };
    }
    const templateKey = published?.template?.id || profile.storefront_template_key || '';
    const publishedBrandKit = resolvePublishedStorefrontBrandKit(
      templateKey,
      published?.brandKit || {},
    );
    const publishedBlocks = canonicalPublishedStorefrontBlocks({
      templateKey,
      blocks: published?.blocks || [],
      profile,
      brandKit: publishedBrandKit,
    });
    const publishedHero = publishedBlocks.find((block) => block.type === 'hero' && block.enabled !== false);
    const heroContent = publishedHero?.data?.content || {};
    const heroMediaMode = publishedHero?.data?.layout?.mediaPosition || '';
    const heroImage = heroMediaMode === 'none'
      ? ''
      : heroMediaMode === 'portrait'
      ? (publishedBrandKit.profile_photo_url || profile.profile_photo_url || '')
      : (publishedBrandKit.cover_url || profile.cover_photo_url || '');
    const publishedSeo = published?.seo || published?.seoMeta || {};

    const title = publishedSeo.title
      || profile.seo_meta?.title
      || heroContent.heading
      || `${profile.professional_name} - ${profile.professional_type === 'agent' ? 'Real Estate Agent' : profile.professional_type === 'mortgage_broker' ? 'Mortgage Broker' : 'Real Estate Lawyer'}`;
    
    const description = publishedSeo.description
      || profile.seo_meta?.description
      || heroContent.body
      || profile.tagline
      || profile.about?.substring(0, 160)
      || `Connect with ${profile.professional_name}, a trusted ${profile.professional_type} professional.`;

    return {
      title,
      description,
      keywords: publishedSeo.keywords || profile.seo_meta?.keywords || [],
      alternates: {
        canonical: `/p/${params.slug}`,
      },
      openGraph: {
        title,
        description,
        url: `/p/${params.slug}`,
        images: heroImage ? [heroImage] : [],
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
  if (!published) {
    notFound();
  }
  const publishedTemplateKey = published?.template?.id || profile.storefront_template_key || '';
  const publishedBrandKit = resolvePublishedStorefrontBrandKit(publishedTemplateKey, published?.brandKit || {});
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
        storefront_blocks: canonicalPublishedStorefrontBlocks({
          templateKey: publishedTemplateKey,
          blocks: published.blocks,
          profile,
          brandKit: publishedBrandKit,
        }),
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
