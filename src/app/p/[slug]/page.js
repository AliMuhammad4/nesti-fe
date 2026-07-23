import { notFound } from 'next/navigation';
import { getPublicProfile, getPublishedStorefront } from '@/lib/publicProfileClient';
import PublicProfileLayout from '@/components/public-profile/PublicProfileLayout';
import PublicStorefrontPage from '@/components/storefront/PublicStorefrontPage';

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
  
  try {
    data = await getPublicProfile(params.slug);
  } catch (error) {
    notFound();
  }

  const profile = data.profile;

  if (!profile || !profile.enabled) {
    notFound();
  }
  const storefrontResponse = await getPublishedStorefront(params.slug);
  const published = storefrontResponse?.storefront?.published || null;
  const storefrontProfile = published
    ? {
        ...profile,
        storefront_blocks: (published.blocks || []).map((block) => ({
          ...block,
          enabled: block.data?.enabled ?? true,
          content: block.data?.content || {},
        })),
        storefront_theme: {
          primary: published.brandKit?.primary_color || undefined,
          accent: published.brandKit?.accent_color || undefined,
          fontFamily: published.brandKit?.font_family || undefined,
          radius: published.brandKit?.button_shape === 'pill'
            ? '999px'
            : published.brandKit?.button_shape === 'square'
              ? '2px'
              : '0.75rem',
        },
        storefront_logo_url: published.brandKit?.logo_url || '',
      storefront_template_key: published.template?.id || '',
      }
    : profile;

  return (
    <PublicProfileLayout profile={storefrontProfile}>
      <PublicStorefrontPage profile={storefrontProfile} />
    </PublicProfileLayout>
  );
}
