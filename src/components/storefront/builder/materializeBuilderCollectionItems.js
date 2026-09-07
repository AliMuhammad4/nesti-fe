import { getGuidanceCollectionFallback } from '@/components/public-profile/PublicGuidanceSection';
import { getRoleDetailsCollectionFallback } from '@/components/public-profile/PublicRoleDetailSection';
import { brokerClassicCollectionFallback } from '@/components/storefront/renderers/variants/broker/classic/brokerClassicDefaults';
import {
  brokerFirstHomeCollectionFallback,
  normalizeFirstHomeHeroSlides,
} from '@/components/storefront/renderers/variants/broker/firstHome/brokerFirstHomeDefaults';
import { LAWYER_CLASSIC_PROCESS_DEFAULTS } from '../renderers/variants/lawyer/shared/lawyerSectionUtils';
import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';
import {
  COMMUNITY_SERVICE_SUPPLEMENTAL,
  SELLER_ROLE_SUPPLEMENTAL,
  SELLER_SERVICE_SUPPLEMENTAL,
} from './builderWorkspaceConstants';
import { appendUniqueItems } from './builderWorkspaceUtils';
import { coerceCollectionItems } from './storefrontBuilderState';

export function materializeBuilderCollectionItems({
  collection,
  content,
  blockType = '',
  templateKey,
  profile,
}) {
  if (
    templateKey === 'lawyer-newcomer'
    && blockType === STOREFRONT_BLOCK_TYPES.TESTIMONIALS
    && collection === 'items'
  ) {
    const source = Object.prototype.hasOwnProperty.call(content || {}, 'items')
      && Array.isArray(content.items)
      ? content.items
      : (Array.isArray(profile?.testimonials) ? profile.testimonials : []);
    const seen = new Set();
    return source
      .map((item, index) => {
        if (!item || typeof item !== 'object') return null;
        const clientName = String(item.client_name || item.name || '').trim();
        const text = String(item.text || item.review || '').trim();
        if (!clientName || !text) return null;
        const baseId = String(item.id || item._id || `fallback-testimonial-${index}`);
        let id = baseId;
        let suffix = 2;
        while (seen.has(id)) {
          id = `${baseId}-${suffix}`;
          suffix += 1;
        }
        seen.add(id);
        return {
          ...item,
          id,
          client_name: clientName,
          text,
          role: item.role || 'Verified client',
          rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  if (collection === 'slides'
    && templateKey === 'mortgage_broker-first-home'
    && blockType === STOREFRONT_BLOCK_TYPES.HERO
  ) {
    const persistedSlides = Object.prototype.hasOwnProperty.call(content || {}, 'slides')
      && Array.isArray(content.slides)
      ? content.slides
      : [];
    return normalizeFirstHomeHeroSlides(persistedSlides);
  }

  if (Object.prototype.hasOwnProperty.call(content || {}, collection)
    && Array.isArray(content[collection])) {
    if (collection === 'steps' || collection === 'faqs' || collection === 'items' || collection === 'services' || collection === 'highlights' || collection === 'proof' || collection === 'process_steps') {
      const persisted = coerceCollectionItems(
        collection === 'services' ? 'items' : collection,
        content[collection],
      );
      if (
        templateKey === 'agent-seller-expert'
        && blockType === STOREFRONT_BLOCK_TYPES.SERVICES
        && (collection === 'items' || collection === 'services')
      ) {
        return appendUniqueItems(persisted, SELLER_SERVICE_SUPPLEMENTAL, 6);
      }
      if (
        templateKey === 'agent-community-expert'
        && blockType === STOREFRONT_BLOCK_TYPES.SERVICES
        && (collection === 'items' || collection === 'services')
        && persisted.length === 5
      ) {
        return [...persisted, { ...COMMUNITY_SERVICE_SUPPLEMENTAL }];
      }
      if (
        templateKey === 'agent-seller-expert'
        && blockType === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS
        && collection === 'highlights'
      ) {
        return appendUniqueItems(persisted, SELLER_ROLE_SUPPLEMENTAL, 5);
      }
      return persisted;
    }
  }

  if (collection === 'items' || collection === 'services') {
    if (templateKey === 'mortgage_broker-first-home') {
      const firstHomeFallback = brokerFirstHomeCollectionFallback(
        blockType,
        collection === 'services' ? 'items' : collection,
      );
      if (firstHomeFallback?.length) {
        return coerceCollectionItems(collection === 'services' ? 'items' : collection, firstHomeFallback);
      }
    }
    if (templateKey === 'mortgage_broker-classic') {
      const brokerFallback = brokerClassicCollectionFallback(blockType, collection);
      if (brokerFallback?.length) {
        return coerceCollectionItems(collection === 'services' ? 'items' : collection, brokerFallback);
      }
    }
    const supplementalByRole = {
      agent: {
        title: 'Portfolio Growth Strategy',
        description: 'Build a practical acquisition and diversification plan around your long-term property goals.',
        icon: 'shield',
      },
      mortgage_broker: {
        title: 'Financing Strategy Review',
        description: 'Review borrowing options and structure a financing path aligned with your next property goal.',
        icon: 'shield',
      },
      lawyer: {
        title: 'Property Advisory',
        description: 'Get clear legal guidance for complex property decisions before moving forward.',
        icon: 'shield',
      },
    };
    const fallbackByRole = {
      agent: [
        { title: 'Buyer Strategy', description: 'Neighborhood guidance, viewing strategy, and offer planning.', icon: 'home' },
        { title: 'Seller Positioning', description: 'Pricing, staging, launch timing, and negotiation support.', icon: 'building' },
        { title: 'Closing Coordination', description: 'From accepted offer to keys with clear communication.', icon: 'handshake' },
      ],
      mortgage_broker: [
        { title: 'Pre-Approval Planning', description: 'Income, debt, and down payment strategy before shopping.', icon: 'percent' },
        { title: 'Program Comparison', description: 'Fixed, variable, refinance, and investor pathways.', icon: 'building' },
        { title: 'Renewal Optimization', description: 'Review terms and improve payment structure before maturity.', icon: 'target' },
      ],
      lawyer: [
        { title: 'Agreement Review', description: 'Plain-language review of purchase and sale documents.', icon: 'handshake' },
        { title: 'Closing Support', description: 'Title, registration, lender coordination, and completion.', icon: 'home' },
        { title: 'Transaction Counsel', description: 'Guidance for purchase, sale, refinance, and transfer matters.', icon: 'building' },
      ],
    };
    const role = profile?.professional_type || 'agent';
    const fromProfile = (profile?.services || [])
      .map((item, index) => ({
        id: item?.id || `fallback-service-${index}`,
        title: item?.title || item?.name || '',
        description: item?.description || item?.text || '',
        icon: item?.icon || ['target', 'building', 'home', 'percent', 'handshake', 'shield'][index % 6],
        background: item?.background || '',
        text_color: item?.text_color || '',
        icon_background: item?.icon_background || '',
        icon_color: item?.icon_color || '',
      }))
      .filter((item) => item.title)
      .slice(0, 6);
    const base = fromProfile.length
      ? fromProfile
      : (fallbackByRole[role] || fallbackByRole.agent).map((item, index) => ({
        ...item,
        id: `fallback-service-${index}`,
        background: '',
        text_color: '',
        icon_background: '',
        icon_color: '',
      }));
    if (
      templateKey === 'agent-seller-expert'
      && blockType === STOREFRONT_BLOCK_TYPES.SERVICES
    ) {
      return appendUniqueItems(base, SELLER_SERVICE_SUPPLEMENTAL, 6);
    }
    if (base.length === 5) {
      base.push(
        templateKey === 'agent-community-expert'
          ? { ...COMMUNITY_SERVICE_SUPPLEMENTAL }
          : {
              ...(supplementalByRole[role] || supplementalByRole.agent),
              id: 'fallback-service-5',
              background: '',
              text_color: '',
              icon_background: '',
              icon_color: '',
            },
      );
    }
    return base.slice(0, 6);
  }

  if (collection === 'steps' || collection === 'faqs') {
    if (templateKey === 'mortgage_broker-first-home') {
      const firstHomeFallback = brokerFirstHomeCollectionFallback(blockType, collection);
      if (firstHomeFallback?.length) {
        return coerceCollectionItems(collection, firstHomeFallback);
      }
    }
    if (templateKey === 'mortgage_broker-classic' && blockType === STOREFRONT_BLOCK_TYPES.FAQ) {
      const brokerFallback = brokerClassicCollectionFallback(blockType, collection);
      if (brokerFallback?.length) {
        return coerceCollectionItems('faqs', brokerFallback);
      }
    }
    return getGuidanceCollectionFallback(profile?.professional_type, collection);
  }

  if (collection === 'process_steps') {
    if (templateKey !== 'lawyer-classic') return [];
    return coerceCollectionItems('process_steps', LAWYER_CLASSIC_PROCESS_DEFAULTS);
  }

  if (collection === 'highlights' || collection === 'proof') {
    if (templateKey === 'mortgage_broker-classic' && blockType === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS && collection === 'highlights') {
      const brokerFallback = brokerClassicCollectionFallback(blockType, collection);
      if (brokerFallback?.length) {
        return coerceCollectionItems('highlights', brokerFallback);
      }
    }
    const fallback = getRoleDetailsCollectionFallback(profile?.professional_type, collection);
    if (
      templateKey === 'agent-seller-expert'
      && blockType === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS
      && collection === 'highlights'
    ) {
      return appendUniqueItems(fallback, SELLER_ROLE_SUPPLEMENTAL, 5);
    }
    return fallback;
  }

  return [];
}

export function resolveBuilderCollectionForEdit({
  collection,
  content,
  itemId,
  itemIndex,
  blockType = '',
  templateKey,
  profile,
}) {
  const items = materializeBuilderCollectionItems({
    collection,
    content,
    blockType,
    templateKey,
    profile,
  });
  if (items.some((item) => item?.id === itemId)) return items;

  const indexFromAttr = Number.isInteger(itemIndex) ? itemIndex : Number(itemIndex);
  if (Number.isInteger(indexFromAttr) && items[indexFromAttr]) {
    return items.map((item, index) => (
      index === indexFromAttr ? { ...item, id: itemId || item.id } : item
    ));
  }

  const fallbackMatch = String(itemId || '').match(/^fallback-(step|faq|service|testimonial|highlight|proof)-(\d+)$/);
  if (fallbackMatch) {
    const index = Number(fallbackMatch[2]);
    if (items[index]) {
      return items.map((item, itemIndexValue) => (
        itemIndexValue === index ? { ...item, id: itemId } : item
      ));
    }
  }

  return items.length ? items : null;
}

export function createCollectionMaterializer(templateKey, profile) {
  return {
    materializeCollectionItems: (collection, content, blockType = '') => (
      materializeBuilderCollectionItems({ collection, content, blockType, templateKey, profile })
    ),
    resolveCollectionForEdit: (collection, content, itemId, itemIndex, blockType = '') => (
      resolveBuilderCollectionForEdit({
        collection,
        content,
        itemId,
        itemIndex,
        blockType,
        templateKey,
        profile,
      })
    ),
  };
}
