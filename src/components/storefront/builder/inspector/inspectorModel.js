import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';
import { FIRST_HOME_ROADMAP_LIMIT } from '../../storefrontLimits';
import {
  coerceCollectionItems,
  createContentItemId,
  labelForBlock,
} from '../storefrontBuilderState';
import { CONTENT_COLLECTIONS } from '../builderContentCollections';
import { getGuidanceCollectionFallback, getGuidanceTextDefaults } from '@/components/public-profile/PublicGuidanceSection';
import { getRoleDetailsCollectionFallback, getRoleDetailsDefaults } from '@/components/public-profile/PublicRoleDetailSection';
import { listingCardThemeFromTemplate, materializeTemplate } from '../../templates';
import {
  BROKER_CLASSIC_COMPENSATION_ITEMS,
  BROKER_CLASSIC_FAQS,
  BROKER_CLASSIC_FOOTER_ITEMS,
  BROKER_CLASSIC_PROGRAM_ITEMS,
  BROKER_CLASSIC_ROLE_HIGHLIGHTS,
  BROKER_CLASSIC_SERVICE_ITEMS,
  brokerClassicCollectionFallback,
} from '../../renderers/variants/broker/classic/brokerClassicDefaults';
import { LAWYER_CLASSIC_PROCESS_DEFAULTS } from '../../renderers/variants/lawyer/shared/lawyerSectionUtils';
import { SERVICE_ICON_DEFAULTS } from '../storefrontServiceIcons';
import {
  COLUMN_SUPPORT_BASE_TYPES,
  COLUMN_SUPPORT_LAWYER_OR_COMMUNITY_TYPES,
  COLUMN_SUPPORT_TAIL_TYPES,
  COMMUNITY_SERVICE_FALLBACK,
  EXPERTISE_PROCESS_LIMIT,
  FAQ_CARD_FIELDS,
  LAYERED_LAWYER_COLUMN_EXCEPTIONS,
  LAWYER_CLASSIC_ITEM_CARD_TYPES,
  LAWYER_CLASSIC_LAYOUT_BASE_TYPES,
  LISTING_BLOCK_TYPES,
  PROCESS_CARD_FIELDS,
  ROLE_HIGHLIGHT_LIMIT,
  ROLE_PROOF_LIMIT,
  SELLER_ALIGNMENT_TYPES,
  SELLER_CARD_STYLE_TYPES,
  SELLER_CUSTOM_BLOCK_TYPES,
  SELLER_RADIUS_SHADOW_TYPES,
  SERVICE_CARD_LIMIT,
  SERVICES_CARD_STYLE_FIELDS,
  SUPPLEMENTAL_SERVICE,
} from './inspectorConstants';
import { lawyerInvestorCapabilities } from './investorCapabilities';
import { lawyerNewcomerCapabilities } from './newcomerCapabilities';
import { brokerClassicCapabilities } from '../../renderers/variants/broker/classic/brokerClassicCapabilities';
import { readContentPath } from '../contentPath';

function mapProfileServiceCards(profile) {
  return (profile?.services || [])
    .map((item, index) => ({
      id: item?.id || `fallback-service-${index}`,
      title: item?.title || item?.name || '',
      description: item?.description || item?.text || '',
      icon: item?.icon || SERVICE_ICON_DEFAULTS[index % SERVICE_ICON_DEFAULTS.length],
      background: item?.background || '',
      text_color: item?.text_color || '',
      icon_background: item?.icon_background || '',
      icon_color: item?.icon_color || '',
      url: item?.url || item?.href || '',
    }))
    .filter((item) => item.title)
    .slice(0, SERVICE_CARD_LIMIT);
}

function withSupplementalService(profileServiceCards, { isServices, isCommunityTemplate, professionalType }) {
  if (!(isServices && profileServiceCards.length === 5)) return profileServiceCards;
  profileServiceCards.push(
    isCommunityTemplate
      ? { ...COMMUNITY_SERVICE_FALLBACK }
      : {
          ...(SUPPLEMENTAL_SERVICE[professionalType] || SUPPLEMENTAL_SERVICE.agent),
          id: 'fallback-service-5',
          icon: 'shield',
          background: '',
          text_color: '',
        },
  );
  return profileServiceCards;
}

function resolveCardSource(rawCardSource, { isCommunityTemplate, isServices }) {
  if (
    isCommunityTemplate
    && isServices
    && Array.isArray(rawCardSource)
    && rawCardSource.length === 5
    && !rawCardSource.some((item) => item?.id === 'community-service-6')
  ) {
    return [...rawCardSource, { ...COMMUNITY_SERVICE_FALLBACK }];
  }
  return rawCardSource;
}

export function buildInspectorModel({
  block,
  selection,
  profile,
  brandKit,
  templateKey,
  onChange,
}) {
  const isElementSelection = Boolean(selection?.kind && selection.kind !== 'block');
  const selectedField = selection?.field || '';
  const selectedSource = selection?.source || '';
  const isItemSelection = selection?.kind === 'item';
  const isProfileSelection = selectedSource === 'profile';
  const isHero = block?.type === T.HERO;
  const isCta = block?.type === T.CTA;
  const isLawyerClassic = templateKey === 'lawyer-classic';
  const isLawyerFirstHome = templateKey === 'lawyer-first-home-closing';
  const isLawyerInvestor = templateKey === 'lawyer-investor';
  const isLawyerNewcomer = templateKey === 'lawyer-newcomer';
  const isBrokerClassic = templateKey === 'mortgage_broker-classic';
  const investorCapabilities = isLawyerInvestor
    ? lawyerInvestorCapabilities(block?.type)
    : null;
  const newcomerCapabilities = isLawyerNewcomer
    ? lawyerNewcomerCapabilities(block?.type)
    : null;
  const brokerCapabilities = isBrokerClassic
    ? brokerClassicCapabilities(block?.type)
    : null;
  // Keep the story-warm Newcomer Hero on its established generic control path.
  const isLayeredLawyerTemplate = isLawyerClassic
    || isLawyerFirstHome
    || isLawyerInvestor
    || (isLawyerNewcomer && !isHero);
  const lawyerClassicItemCardTypes = [...LAWYER_CLASSIC_ITEM_CARD_TYPES];
  const isLawyerClassicItemCards = isLayeredLawyerTemplate && lawyerClassicItemCardTypes.includes(block?.type);
  const lawyerClassicUsesCardIcons = isLawyerClassicItemCards
    && block.type !== T.DOCUMENT_CHECKLIST;
  const lawyerClassicLayoutTypes = [
    ...lawyerClassicItemCardTypes,
    ...LAWYER_CLASSIC_LAYOUT_BASE_TYPES,
  ];
  const isLawyerClassicLayout = isLayeredLawyerTemplate && lawyerClassicLayoutTypes.includes(block?.type);
  const lawyerClassicCardLimit = block?.type === T.DOCUMENT_CHECKLIST
    ? 8
    : block?.type === T.CONSULTATION_OPTIONS
      ? 3
      : 6;
  const isThemeDrivenAgentHero = isHero
    && String(templateKey || '').startsWith('agent-')
    && templateKey !== 'agent-investor';
  const heroUsesProfilePhoto = templateKey !== 'agent-classic';
  const allowHeroContentTabForSelection = isHero
    && isProfileSelection
    && ['brandKit.cover_url', 'brandKit.logo_url', ...(heroUsesProfilePhoto ? ['brandKit.profile_photo_url'] : [])].includes(selectedField);

  const { content, layout, style } = block.data;
  const isSellerExpertTemplate = templateKey === 'agent-seller-expert';
  const isCommunityTemplate = templateKey === 'agent-community-expert';
  const selectedItemField = selection?.itemField || '';
  const availableTabs = (isElementSelection && !allowHeroContentTabForSelection)
    ? ['layout', 'style']
    : ['content', 'layout', 'style'];
  const showSectionDesignTabs = !isItemSelection;
  const supportsColumns = isLawyerInvestor || (isLawyerNewcomer && !isHero) || isBrokerClassic
    ? (investorCapabilities || newcomerCapabilities || brokerCapabilities)?.layout?.columns === true
    : [
        ...COLUMN_SUPPORT_BASE_TYPES,
        ...(isCommunityTemplate || isLayeredLawyerTemplate
          ? COLUMN_SUPPORT_LAWYER_OR_COMMUNITY_TYPES
          : [T.EXPERTISE]),
        ...COLUMN_SUPPORT_TAIL_TYPES,
      ].includes(block.type) && !(
        isSellerExpertTemplate
        && block.type === T.ROLE_DETAILS
      ) && (!isLayeredLawyerTemplate || isLawyerClassicItemCards || LAYERED_LAWYER_COLUMN_EXCEPTIONS.includes(block.type));
  const collection = isHero
    || (isSellerExpertTemplate && block.type === T.TESTIMONIALS)
    ? null
    : CONTENT_COLLECTIONS[block.type];
  const name = profile?.professional_name || 'your name';
  const isServices = block.type === T.SERVICES;
  const isBrokerPrograms = isBrokerClassic && (
    block.type === T.MORTGAGE_PROGRAMS
    || block.type === T.MORTGAGE_RATES
    || block.type === T.LENDER_NETWORK
    || block.type === T.ALTERNATIVE_LENDING
    || block.type === T.BROKER_COMPENSATION
  );
  const isSellerCaseStudy = block.type === T.SELLER_CASE_STUDY;
  const isSellerCredentials = block.type === T.SELLER_CREDENTIALS;
  const hasEditableCards = isServices || isSellerCaseStudy || isBrokerPrograms;
  const serviceCardLimit = isBrokerClassic && block.type === T.LENDER_NETWORK
    ? 24
    : isBrokerClassic && (
      block.type === T.MORTGAGE_RATES
      || block.type === T.ALTERNATIVE_LENDING
      || block.type === T.BROKER_COMPENSATION
      || block.type === T.MORTGAGE_PROGRAMS
    )
      ? 12
      : SERVICE_CARD_LIMIT;
  const isFaq = block.type === T.FAQ;
  const isGuidance = block.type === T.GUIDANCE || isFaq;
  const isRoleDetails = block.type === T.ROLE_DETAILS;
  const isCredentials = block.type === T.CREDENTIALS;
  const isTestimonials = block.type === T.TESTIMONIALS;
  const isFooter = block.type === T.FOOTER;
  const lawyerCredentialsVerified = profile?.credentials_verified === true
    || profile?.professional_profile?.credentials_verified === true;
  const isLawyerClassicStatement = isLayeredLawyerTemplate && isRoleDetails;
  const isLawyerClassicGuidance = isLayeredLawyerTemplate && isGuidance;
  const isBrokerClassicGuidance = isBrokerClassic && isGuidance;
  const guidanceStepLimit = isLawyerClassicGuidance || isBrokerClassicGuidance ? 6 : 8;
  const guidanceFaqLimit = isLawyerClassicGuidance || (isBrokerClassic && isFaq) ? 8 : 8;
  const sellerCustomBlock = isSellerExpertTemplate && SELLER_CUSTOM_BLOCK_TYPES.includes(block.type);
  const sellerSupportsCardStyle = !isSellerExpertTemplate || SELLER_CARD_STYLE_TYPES.includes(block.type);
  const sellerSupportsRadiusShadow = !isSellerExpertTemplate || SELLER_RADIUS_SHADOW_TYPES.includes(block.type);
  const isListings = LISTING_BLOCK_TYPES.includes(block.type);
  const sellerSupportsPadding = !isSellerExpertTemplate || isListings
    || block.type === T.TESTIMONIALS;
  const sellerSupportsWidth = !isSellerExpertTemplate;
  const sellerSupportsAlignment = !isSellerExpertTemplate || SELLER_ALIGNMENT_TYPES.includes(block.type);
  const listingThemeCards = listingCardThemeFromTemplate(templateKey || '');
  const templateDefaultBlock = materializeTemplate(templateKey || '', profile, brandKit)
    ?.blocks?.find((item) => item.type === block.type);
  const templateSectionBackground = templateDefaultBlock?.data?.style?.background || '';
  const templateSectionTextColor = templateDefaultBlock?.data?.style?.textColor || '';
  const isProcessCardContext = Boolean(
    isGuidance && !isSellerExpertTemplate && !isLayeredLawyerTemplate
      && (selection?.collection === 'steps' || PROCESS_CARD_FIELDS.has(selectedField)),
  );
  const isFaqCardContext = Boolean(
    isGuidance && !isSellerExpertTemplate && !isLayeredLawyerTemplate
      && (selection?.collection === 'faqs' || FAQ_CARD_FIELDS.has(selectedField)),
  );

  const clearGuidanceCardStyles = (scope) => {
    if (scope === 'process') {
      onChange(block.id, {
        content: {
          process_card_background: '',
          process_card_text_color: '',
          process_badge_background: '',
          process_badge_color: '',
        },
      });
      return;
    }
    onChange(block.id, {
      content: {
        faq_card_background: '',
        faq_card_text_color: '',
      },
    });
  };
  const clearServicesIconStyles = () => {
    onChange(block.id, {
      content: {
        icon_background: '',
        icon_color: '',
      },
    });
  };
  const clearRolePanelStyles = () => {
    onChange(block.id, {
      content: {
        panel_background: '',
        panel_text_color: '',
      },
    });
  };

  const profileServiceCards = withSupplementalService(mapProfileServiceCards(profile), {
    isServices,
    isCommunityTemplate,
    professionalType: profile?.professional_type,
  });
  const rawCardSource = (() => {
    const hasItems = Object.prototype.hasOwnProperty.call(content, 'items')
      && Array.isArray(content.items);
    if (hasItems) return content.items;
    if (isSellerCaseStudy) return [];
    if (isBrokerPrograms) {
      const templateItems = templateDefaultBlock?.data?.content?.items;
      if (Array.isArray(templateItems) && templateItems.length) return templateItems;
      if (block.type === T.BROKER_COMPENSATION) return BROKER_CLASSIC_COMPENSATION_ITEMS;
      if (block.type === T.MORTGAGE_PROGRAMS) return BROKER_CLASSIC_PROGRAM_ITEMS;
      const brokerFallback = brokerClassicCollectionFallback(block.type, 'items');
      if (brokerFallback?.length) return brokerFallback;
      return BROKER_CLASSIC_PROGRAM_ITEMS;
    }
    if (isBrokerClassic && isServices) {
      const templateItems = templateDefaultBlock?.data?.content?.items;
      if (Array.isArray(templateItems) && templateItems.length) return templateItems;
      return BROKER_CLASSIC_SERVICE_ITEMS;
    }
    return profileServiceCards;
  })();
  const cardSource = resolveCardSource(rawCardSource, { isCommunityTemplate, isServices });
  const serviceCards = cardSource.slice(0, serviceCardLimit).map((item, index) => ({
    ...item,
    id: item?.id || `fallback-card-${index}`,
    title: item?.title || '',
    description: item?.description || item?.text || '',
    rate: item?.rate || item?.value || '',
    category: item?.category || item?.group || '',
    domain: item?.domain || item?.website || '',
    website: item?.website || item?.domain || '',
    icon: item?.icon || SERVICE_ICON_DEFAULTS[index % SERVICE_ICON_DEFAULTS.length],
    background: item?.background || '',
    text_color: item?.text_color || '',
    icon_background: item?.icon_background || '',
    icon_color: item?.icon_color || '',
    url: item?.url || item?.href || '',
    link_disabled: item?.link_disabled === true,
  }));
  const testimonialItemCount = isTestimonials
    ? (
        Object.prototype.hasOwnProperty.call(content, 'items') && Array.isArray(content.items)
          ? content.items
          : (Array.isArray(profile?.testimonials) ? profile.testimonials : [])
      ).filter((item) => (
        item
        && String(item.client_name || item.name || '').trim()
        && String(item.text || item.review || '').trim()
      )).slice(0, 8).length
    : 0;
  const commitServiceCards = (next) => {
    const normalized = next.slice(0, serviceCardLimit).map((item) => ({
      ...item,
      id: item?.id || createContentItemId(),
      title: item?.title || '',
      description: item?.description || '',
      rate: item?.rate || '',
      category: item?.category || '',
      domain: item?.domain || item?.website || '',
      website: item?.website || item?.domain || '',
      icon: item?.icon || 'target',
      background: item?.background || '',
      text_color: item?.text_color || '',
      icon_background: item?.icon_background || '',
      icon_color: item?.icon_color || '',
      url: item?.url || item?.href || '',
      link_disabled: item?.link_disabled === true,
      ...(isBrokerClassic && block.type === T.SERVICES ? {
        benefit_0: item?.benefit_0 ?? '',
        benefit_1: item?.benefit_1 ?? '',
        benefit_2: item?.benefit_2 ?? '',
      } : {}),
    }));
    onChange(block.id, { content: { items: normalized } });
  };
  const lawyerClassicCards = isLawyerClassicItemCards
    ? coerceCollectionItems('items', Array.isArray(content.items) ? content.items : []).slice(0, lawyerClassicCardLimit)
    : [];
  const commitLawyerClassicCards = (next) => {
    onChange(block.id, {
      content: {
        items: next.slice(0, lawyerClassicCardLimit).map((item) => ({
          ...item,
          id: item?.id || createContentItemId(),
          title: item?.title || '',
          description: item?.description || item?.text || '',
          cta_label: item?.cta_label || '',
          action: item?.action || 'inquiry',
          icon: item?.icon || '',
          ...(isLawyerFirstHome ? {
            source: item?.source || '',
            source_overridden: item?.source_overridden === true,
          } : {}),
          background: item?.background || '',
          text_color: item?.text_color || '',
        })),
      },
    });
  };
  const guidanceStepsSource = Array.isArray(content.steps)
    && (content.steps.length || isLawyerClassicGuidance)
    ? content.steps.map((item) => (
        item && typeof item === 'object'
          ? { ...item, text: item.text ?? item.description ?? '' }
          : item
      ))
    : getGuidanceCollectionFallback(profile?.professional_type, 'steps');
  const guidanceSteps = coerceCollectionItems('steps', guidanceStepsSource)
    .slice(0, guidanceStepLimit);
  const guidanceFaqs = Object.prototype.hasOwnProperty.call(content, 'faqs')
    && Array.isArray(content.faqs)
    ? coerceCollectionItems('faqs', content.faqs)
    : (isBrokerClassic && isFaq
      ? coerceCollectionItems('faqs', BROKER_CLASSIC_FAQS)
      : getGuidanceCollectionFallback(profile?.professional_type, 'faqs'));
  const commitGuidanceSteps = (next) => {
    onChange(block.id, {
      content: {
        steps: next.slice(0, guidanceStepLimit).map((item) => ({
          ...item,
          id: item?.id || createContentItemId(),
          title: item?.title || '',
          icon: item?.icon || '',
          text: item?.text ?? item?.description ?? '',
        })),
      },
    });
  };
  const commitGuidanceFaqs = (next) => {
    onChange(block.id, {
      content: {
        faqs: next.slice(0, guidanceFaqLimit).map((item) => ({
          ...item,
          id: item?.id || createContentItemId(),
          q: item?.q || '',
          a: item?.a || '',
        })),
      },
    });
  };
  const isLawyerClassicExpertise = isLayeredLawyerTemplate && block.type === T.EXPERTISE;
  const expertiseProcessLimit = isLawyerFirstHome
    ? FIRST_HOME_ROADMAP_LIMIT
    : EXPERTISE_PROCESS_LIMIT;
  const expertiseProcessSteps = isLawyerClassicExpertise
    ? coerceCollectionItems(
      'process_steps',
      Object.prototype.hasOwnProperty.call(content, 'process_steps') && Array.isArray(content.process_steps)
        ? content.process_steps
        : LAWYER_CLASSIC_PROCESS_DEFAULTS,
    ).slice(0, expertiseProcessLimit)
    : [];
  const commitExpertiseProcessSteps = (next) => {
    onChange(block.id, {
      content: {
        process_steps: next.slice(0, expertiseProcessLimit).map((item) => ({
          ...item,
          id: item?.id || createContentItemId(),
          title: item?.title || '',
          text: item?.text ?? item?.description ?? '',
        })),
      },
    });
  };
  const roleDefaults = isRoleDetails
    ? getRoleDetailsDefaults(profile?.professional_type)
    : null;
  const roleHighlights = isRoleDetails
    ? (
      Array.isArray(content.highlights) && (isLawyerFirstHome || content.highlights.length)
        ? coerceCollectionItems('highlights', content.highlights)
        : (isBrokerClassic
          ? coerceCollectionItems('highlights', BROKER_CLASSIC_ROLE_HIGHLIGHTS)
          : getRoleDetailsCollectionFallback(profile?.professional_type, 'highlights'))
    )
    : [];
  const roleProof = isRoleDetails
    ? (
      Array.isArray(content.proof) && content.proof.length
        ? coerceCollectionItems('proof', content.proof)
        : getRoleDetailsCollectionFallback(profile?.professional_type, 'proof')
    )
    : [];
  const commitRoleHighlights = (next) => {
    onChange(block.id, {
      content: {
        highlights: next.slice(0, ROLE_HIGHLIGHT_LIMIT).map((item) => ({
          ...item,
          id: item?.id || createContentItemId(),
          title: item?.title || '',
          text: item?.text || '',
          icon: item?.icon || '',
          background: item?.background || '',
          text_color: item?.text_color || '',
        })),
      },
    });
  };
  const commitRoleProof = (next) => {
    onChange(block.id, {
      content: {
        proof: next.slice(0, ROLE_PROOF_LIMIT).map((item) => ({
          ...item,
          id: item?.id || createContentItemId(),
          text: item?.text || item?.title || '',
          background: item?.background || '',
          text_color: item?.text_color || '',
        })),
      },
    });
  };
  const guidanceDefaults = isGuidance
    ? getGuidanceTextDefaults(profile?.professional_type)
    : null;
  const contentValue = (key) => {
    if (
      selection?.inlineValue !== undefined
      && selectedField === `content.${key}`
    ) {
      return String(selection.inlineValue);
    }
    const nestedValue = readContentPath(content, key);
    if (nestedValue != null) {
      return String(nestedValue);
    }
    if (key === 'heading' && content.title != null) return String(content.title);
    if (key === 'body' && content.description != null) return String(content.description);
    return '';
  };
  const contentPlaceholder = (key, fallback = '') => (
    guidanceDefaults?.[key] || roleDefaults?.[key === 'heading' ? 'title' : key === 'body' ? 'description' : key] || fallback
  );
  const placeholders = {
    heading: isHero
      ? (profile?.headline || `Move smarter with ${name}`)
      : isRoleDetails
        ? (roleDefaults?.title || labelForBlock(block.type))
        : (guidanceDefaults?.heading || labelForBlock(block.type)),
    body: isGuidance
      ? (guidanceDefaults?.body || '')
      : isRoleDetails
        ? (roleDefaults?.description || '')
        : (block.type === 'about' ? (profile?.about || '') : ''),
  };

  return {
    onChange,
    block,
    content,
    layout,
    style,
    isElementSelection,
    selectedField,
    selectedSource,
    isItemSelection,
    isProfileSelection,
    isHero,
    isCta,
    isLawyerClassic,
    isLawyerFirstHome,
    isLawyerInvestor,
    isLawyerNewcomer,
    isBrokerClassic,
    investorCapabilities,
    newcomerCapabilities,
    brokerCapabilities,
    isLayeredLawyerTemplate,
    isLawyerClassicItemCards,
    lawyerClassicUsesCardIcons,
    isLawyerClassicLayout,
    lawyerClassicCardLimit,
    isThemeDrivenAgentHero,
    heroUsesProfilePhoto,
    allowHeroContentTabForSelection,
    isSellerExpertTemplate,
    isCommunityTemplate,
    selectedItemField,
    availableTabs,
    showSectionDesignTabs,
    supportsColumns,
    collection,
    isServices,
    isSellerCaseStudy,
    isSellerCredentials,
    hasEditableCards,
    serviceCardLimit,
    isFaq,
    isGuidance,
    isRoleDetails,
    isCredentials,
    isTestimonials,
    isFooter,
    lawyerCredentialsVerified,
    isLawyerClassicStatement,
    isLawyerClassicGuidance,
    isBrokerClassicGuidance,
    guidanceStepLimit,
    guidanceFaqLimit,
    sellerCustomBlock,
    sellerSupportsCardStyle,
    sellerSupportsRadiusShadow,
    isListings,
    sellerSupportsPadding,
    sellerSupportsWidth,
    sellerSupportsAlignment,
    listingThemeCards,
    templateSectionBackground,
    templateSectionTextColor,
    isProcessCardContext,
    isFaqCardContext,
    servicesCardStyleFields: SERVICES_CARD_STYLE_FIELDS,
    clearGuidanceCardStyles,
    clearServicesIconStyles,
    clearRolePanelStyles,
    serviceCards,
    testimonialItemCount,
    commitServiceCards,
    lawyerClassicCards,
    commitLawyerClassicCards,
    guidanceSteps,
    guidanceFaqs,
    commitGuidanceSteps,
    commitGuidanceFaqs,
    isLawyerClassicExpertise,
    expertiseProcessLimit,
    expertiseProcessSteps,
    commitExpertiseProcessSteps,
    roleDefaults,
    roleHighlights,
    roleProof,
    commitRoleHighlights,
    commitRoleProof,
    contentValue,
    contentPlaceholder,
    placeholders,
  };
}
