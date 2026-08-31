import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  defaultStorefrontTemplateKey,
  refreshLawyerClassicBlockCopy,
  STOREFRONT_BLOCK_TYPES,
  STOREFRONT_TEMPLATE_PRESETS,
} from '@/components/storefront/storefrontPresets';
import {
  createBlock,
  insertBlockAtTemplateRank,
  isProtectedBlockType,
  isSingletonBlockType,
  LAWYER_CLASSIC_CANONICAL_BLOCK_ORDER,
  normalizeBlocks,
} from '@/components/storefront/builder/storefrontBuilderState';
import {
  getStorefrontTemplate,
  getTemplateBrandDefaults,
  materializeTemplate,
  seedBlockContentFromProfile,
  visualTreatmentForTemplate,
} from '@/components/storefront/templates';
import {
  migrateLawyerNewcomerBlocks,
  migrateLawyerNewcomerBrandKit,
} from '@/components/storefront/templates/lawyer/newcomerMigration';
import { normalizeRole } from './editorConstants';
import {
  blockLayoutStyleSignature,
  buildStorefrontDraft,
  draftSignature,
  normalizeHexForCompare,
} from './storefrontBuilderUtils';

function profileSeedFromData(profileData) {
  const user = profileData?.user || {};
  const professional = profileData?.professional_profile || {};
  return {
    ...profileData?.profile,
    professional_name:
      professional.full_name
      || [user.first_name, user.last_name].filter(Boolean).join(' '),
    professional_profile: professional,
  };
}

function cloneEditorData(data) {
  if (!data) return null;
  if (typeof structuredClone === 'function') return structuredClone(data);
  return JSON.parse(JSON.stringify(data));
}

function mergeStorefrontMedia(primary = {}, fallback = {}) {
  const next = { ...primary };
  const primaryLogo = primary.logo_url || primary.logo_dark_url;
  const primaryCover = primary.cover_url;
  const primaryProfile = primary.profile_photo_url;

  if (!primary.logo_url && fallback.logo_url) next.logo_url = fallback.logo_url;
  if (!primary.logo_dark_url && fallback.logo_dark_url) next.logo_dark_url = fallback.logo_dark_url;
  if (!primaryLogo && (fallback.logo_url || fallback.logo_dark_url)) {
    next.logo_size = fallback.logo_size;
  }
  if (!primaryCover && fallback.cover_url) {
    next.cover_url = fallback.cover_url;
    next.cover_position_x = fallback.cover_position_x;
    next.cover_position_y = fallback.cover_position_y;
    next.cover_zoom = fallback.cover_zoom;
  }
  if (!primaryProfile && fallback.profile_photo_url) {
    next.profile_photo_url = fallback.profile_photo_url;
    next.profile_position_x = fallback.profile_position_x;
    next.profile_position_y = fallback.profile_position_y;
    next.profile_zoom = fallback.profile_zoom;
  }
  return next;
}

function applyStorefrontMedia(target = {}, source = {}) {
  const next = { ...target };
  if (source.logo_url) next.logo_url = source.logo_url;
  if (source.logo_dark_url) next.logo_dark_url = source.logo_dark_url;
  if (source.logo_url || source.logo_dark_url) next.logo_size = source.logo_size;
  if (source.cover_url) {
    next.cover_url = source.cover_url;
    next.cover_position_x = source.cover_position_x;
    next.cover_position_y = source.cover_position_y;
    next.cover_zoom = source.cover_zoom;
  }
  if (source.profile_photo_url) {
    next.profile_photo_url = source.profile_photo_url;
    next.profile_position_x = source.profile_position_x;
    next.profile_position_y = source.profile_position_y;
    next.profile_zoom = source.profile_zoom;
  }
  return next;
}

function migrateClassicBlocks(templateKey, blocks = []) {
  if (templateKey !== 'agent-classic') return blocks;
  return blocks.map((block) => {
    const type = block?.type || block?.data?.type;
    if (type !== 'hero') return block;
    const data = block?.data || {};
    const content = data.content || block?.content || {};
    if (Number(content.classic_cover_layout_version || 0) >= 2) return block;
    return {
      ...block,
      data: {
        ...data,
        content: {
          ...content,
          classic_cover_layout_version: 2,
        },
        layout: {
          ...(data.layout || block?.layout || {}),
          mediaPosition: 'background',
        },
      },
    };
  });
}

function migrateFirstHomeBrandKit(templateKey, input = {}) {
  if (templateKey !== 'agent-first-home') return input;
  const next = { ...input };
  const primary = String(next.primary_color || '').trim().toLowerCase();
  const accent = String(next.accent_color || '').trim().toLowerCase();
  const canvas = String(next.page_background || '').trim().toLowerCase();
  if (['#1d4ed8', '#2b221c', '#173740', '#2f7d78'].includes(primary)) next.primary_color = '#0b3d20';
  if (['#f59e0b', '#fb7185', '#c78960', '#e58b5b', '#ed8b62'].includes(accent)) next.accent_color = '#5bd36d';
  if (['#eff6ff', '#f8f6f2', '#f4efe7', '#f7f3ec'].includes(canvas)) next.page_background = '#ffffff';
  if (next.button_shape === 'pill') next.button_shape = 'square';
  if (next.image_style === 'warm') next.image_style = 'editorial';
  return next;
}

function migrateSellerExpertBrandKit(templateKey, input = {}) {
  if (templateKey !== 'agent-seller-expert') return input;
  const next = { ...input };
  const primary = String(next.primary_color || '').trim().toLowerCase();
  const accent = String(next.accent_color || '').trim().toLowerCase();
  const canvas = String(next.page_background || '').trim().toLowerCase();
  if (['#9f1239', '#be123c', '#881337', '#0f766e'].includes(primary)) next.primary_color = '#0f172a';
  if (['#f59e0b', '#fb7185', '#c9a227', '#22c55e'].includes(accent)) next.accent_color = '#06b6d4';
  if (['#fff1f2', '#fff0f3', '#fff7e7', '#f5fbf8'].includes(canvas)) next.page_background = '#f8fafc';
  return next;
}

function migrateCommunityHubBrandKit(templateKey, input = {}) {
  if (templateKey !== 'agent-community-expert') return input;
  const next = { ...input };
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
  if (usesLegacyPalette) {
    next.primary_color = '#17152b';
  }
  if (usesLegacyPalette || usesIndigoAccent) {
    next.accent_color = '#1f6fbf';
  }
  if ((usesLegacyPalette || usesIndigoAccent) && [
    '#ffffff', '#eaf8ef', '#f7fbf6', '#f6f7f9', '#f8fafc', '#f5f7ff', '#f8f7fc',
  ].includes(canvas)) {
    next.page_background = '#f5f7fa';
  }
  if ((usesLegacyPalette || usesIndigoAccent) && next.image_style === 'warm') next.image_style = 'editorial';
  return next;
}

function migrateFirstHomeBlocks(templateKey, blocks = []) {
  if (templateKey !== 'agent-first-home') return blocks;
  const legacyBackgrounds = new Set([
    '#2b221c', '#f8f6f2', '#173740', '#f4efe7',
    '#dcecea', '#e6f2f0', '#f7f3ec', '#edf2f7', '#e8f3f1', '#fcefe8',
    '#edf5ff', '#fff4ea', '#eff6ff',
  ]);
  return blocks.map((block, index) => {
    const type = block?.type || block?.data?.type;
    const isListing = [
      'properties',
      'featured-listings',
      'top-listings',
      'sold-listings',
      'seller-sold-results',
    ].includes(type);
    const data = block?.data || {};
    const background = String(data?.style?.background || block?.style?.background || '').trim().toLowerCase();
    const primaryButtonBackground = String(
      data?.content?.primary_button_background || block?.content?.primary_button_background || '',
    ).trim().toLowerCase();
    return {
      ...block,
      data: {
        ...data,
        content: {
          ...(data.content || block?.content || {}),
          ...(['#f59e0b', '#fb7185', '#c78960', '#e58b5b', '#ed8b62'].includes(primaryButtonBackground)
            ? { primary_button_background: '' }
            : {}),
        },
        style: {
          ...(data.style || block?.style || {}),
          ...(legacyBackgrounds.has(background)
            ? { background: visualTreatmentForTemplate(templateKey, type, index).bg }
            : {}),
        },
        layout: {
          ...(data.layout || block?.layout || {}),
          ...(isListing && (data?.layout?.cardStyle || block?.layout?.cardStyle) === 'glass' ? { cardStyle: 'bordered' } : {}),
        },
      },
    };
  });
}

function migrateSellerExpertBlocks(templateKey, blocks = [], profileSeed = {}) {
  if (templateKey !== 'agent-seller-expert') return blocks;
  const legacyBackgrounds = new Set(['#fff1f2', '#fff0f3', '#fff7e7']);
  const sellerRoleSupplemental = [
    {
      id: 'seller-highlight-supp-1',
      title: 'Launch timeline control',
      text: 'Coordinate listing date, showing windows, and offer review milestones around your schedule.',
    },
    {
      id: 'seller-highlight-supp-2',
      title: 'Offer clarity framework',
      text: 'Compare price, conditions, financing strength, and closing certainty before selecting a path.',
    },
  ];
  const sellerServiceSupplemental = [
    {
      id: 'seller-service-fallback-1',
      title: 'Pre-listing prep plan',
      description: 'Repairs, staging, media, and launch sequencing to maximize first-week momentum.',
      icon: 'shield-check',
    },
    {
      id: 'seller-service-fallback-2',
      title: 'Offer decision room',
      description: 'Compare pricing strength, terms, and closing confidence before choosing an offer.',
      icon: 'target',
    },
    {
      id: 'seller-service-fallback-3',
      title: 'Closing confidence',
      description: 'Coordinate conditions, documents, and handoffs so the accepted offer reaches a clean close.',
      icon: 'handshake',
    },
  ];
  const featuredListingBlock = blocks.find((block) => (
    (block?.type || block?.data?.type) === 'featured-listings'
  ));
  const featuredListingColumns = String(
    featuredListingBlock?.data?.layout?.columns
      || featuredListingBlock?.layout?.columns
      || '4',
  );
  const migratedBlocks = blocks.map((block, index) => {
    const type = block?.type || block?.data?.type;
    const data = block?.data || {};
    const background = String(data?.style?.background || block?.style?.background || '').trim().toLowerCase();
    const shouldNormalizeSellerHeroBackground = type === 'hero'
      && (!background || ['#0b1220', '#0f172a', '#020617', '#111827'].includes(background));
    const primaryButtonBackground = String(
      data?.content?.primary_button_background || block?.content?.primary_button_background || '',
    ).trim().toLowerCase();
    const content = data.content || block?.content || {};
    const migratedRoleHighlights = type === 'role-details' && Array.isArray(content.highlights)
      ? (content.highlights.length >= 5
          ? content.highlights
          : [
              ...content.highlights,
              ...sellerRoleSupplemental.filter((supplemental) => (
                !content.highlights.some((item) => (
                  item?.id === supplemental.id
                  || String(item?.title || '').trim().toLowerCase() === supplemental.title.toLowerCase()
                ))
              )),
            ].slice(0, 5))
      : null;
    const migratedServiceItems = type === 'services' && Array.isArray(content.items)
      ? (content.items.length >= 6
          ? content.items
          : [
              ...content.items,
              ...sellerServiceSupplemental.filter((supplemental) => (
                !content.items.some((item) => (
                  item?.id === supplemental.id
                  || String(item?.title || '').trim().toLowerCase() === supplemental.title.toLowerCase()
                ))
              )),
            ].slice(0, 6))
      : null;
    const migratedPerformanceItems = type === 'seller-performance' && Array.isArray(content.items)
      ? content.items.map((item) => (['service_areas', 'available_seller_leads'].includes(item?.source)
        ? {
            ...item,
            label: 'Available options',
            source: 'available_seller_leads',
          }
        : item))
      : null;
    const migratedSellerResultsContent = type === 'seller-sold-results'
      ? {
          sold_card_layout_version: 2,
          ...(['Recently sold results', 'Recently closed seller leads'].includes(content.heading)
            ? { heading: 'Recently sold properties' }
            : {}),
          ...([
            'A live view of completed sales from the connected property inventory.',
            'Recent seller opportunities successfully moved to closed-won.',
          ].includes(content.body)
            ? { body: 'A look at homes recently sold with a successful client outcome.' }
            : {}),
          ...(['Track record', 'Successful seller outcomes'].includes(content.eyebrow)
            ? { eyebrow: 'Recent sales' }
            : {}),
        }
      : null;
    const shouldMigrateSoldLayout = type === 'seller-sold-results'
      && Number(content.sold_card_layout_version || 0) < 2;
    const migratedCaseStudyItems = type === 'seller-case-study' && Array.isArray(content.items)
      ? content.items.map((item, itemIndex) => ({
          ...item,
          description: item?.description || item?.text || '',
          icon: item?.icon || ['target', 'sparkles', 'shield'][itemIndex % 3],
          background: item?.background || '',
          text_color: item?.text_color || '',
          icon_background: item?.icon_background || '',
          icon_color: item?.icon_color || '',
        }))
      : null;
    const migratedCredentialItems = type === 'seller-credentials' && Array.isArray(content.items)
      ? content.items.map((item) => {
          if (
            item?.source === 'total_clients'
            && String(item?.title || '').trim().toLowerCase() === 'total seller clients'
          ) {
            return { ...item, title: 'Clients' };
          }
          if (String(item?.issuer || item?.value || '').trim()) return item;
          const legacyMetricMap = {
            'professional credentials:credentials': {
              title: 'Clients',
              source: 'total_clients',
            },
            'market specialty:specialty': {
              title: 'Active pipeline value',
              source: 'active_pipeline_value',
            },
            'languages:languages': {
              title: 'Sold property value',
              source: 'total_sold_home_value',
            },
          };
          const key = `${String(item?.title || '').trim().toLowerCase()}:${String(item?.source || '').trim().toLowerCase()}`;
          return legacyMetricMap[key] ? { ...item, ...legacyMetricMap[key] } : item;
        })
      : null;
    const shouldMigrateCredentialLayout = type === 'seller-credentials'
      && Number(content.metrics_layout_version || 0) < 2;
    return {
      ...block,
      data: {
        ...data,
        content: {
          ...content,
          ...(migratedRoleHighlights ? { highlights: migratedRoleHighlights } : {}),
          ...(migratedServiceItems ? { items: migratedServiceItems } : {}),
          ...(migratedPerformanceItems ? { items: migratedPerformanceItems } : {}),
          ...(migratedSellerResultsContent || {}),
          ...(migratedCaseStudyItems ? { items: migratedCaseStudyItems } : {}),
          ...(migratedCredentialItems ? { items: migratedCredentialItems } : {}),
          ...(type === 'seller-credentials' ? { metrics_layout_version: 2 } : {}),
          ...(type === 'about' ? { seller_about_layout_version: 2 } : {}),
          ...(['#f59e0b', '#fb7185', '#c9a227'].includes(primaryButtonBackground)
            ? { primary_button_background: '' }
            : {}),
        },
        style: {
          ...(data.style || block?.style || {}),
          ...(legacyBackgrounds.has(background)
            ? { background: visualTreatmentForTemplate(templateKey, type, index).bg }
            : {}),
          ...(shouldNormalizeSellerHeroBackground ? { background: '#f8fafc' } : {}),
        },
        layout: {
          ...(data.layout || block?.layout || {}),
          width: 'full',
          ...(shouldMigrateSoldLayout ? { columns: featuredListingColumns } : {}),
          ...(shouldMigrateCredentialLayout ? { columns: '4' } : {}),
        },
      },
    };
  });
  const supplementalTypes = new Set([
    'seller-performance',
    'seller-sold-results',
    'seller-case-study',
    'seller-credentials',
  ]);
  const supplementalDefaults = (materializeTemplate(templateKey, profileSeed)?.blocks || [])
    .filter((block) => supplementalTypes.has(block.type));
  const anchors = {
    'seller-performance': 'role-details',
    'seller-sold-results': 'featured-listings',
    'seller-case-study': 'services',
    'seller-credentials': 'about',
  };
  const nextBlocks = [...migratedBlocks];
  supplementalDefaults.forEach((defaultBlock) => {
    if (nextBlocks.some((block) => block?.type === defaultBlock.type)) return;
    const anchorIndex = nextBlocks.findIndex((block) => block?.type === anchors[defaultBlock.type]);
    nextBlocks.splice(anchorIndex >= 0 ? anchorIndex + 1 : nextBlocks.length, 0, defaultBlock);
  });
  return nextBlocks;
}

const SHARED_PROOF_TEMPLATE_KEYS = new Set([
  'agent-luxury-advisor',
  'agent-first-home',
  'agent-community-expert',
]);
const SHARED_PROOF_BLOCK_TYPES = new Set([
  'seller-performance',
  'seller-sold-results',
  'seller-case-study',
  'seller-credentials',
]);

const COMMUNITY_LEGACY_SURFACES = new Set([
  '#eaf8ef',
  '#f5fbf7',
  '#f5fbf8',
  '#f7fbf6',
  '#e6f2f0',
  '#d9f4df',
]);

function migrateCommunitySurfaceValue(value) {
  return COMMUNITY_LEGACY_SURFACES.has(String(value || '').trim().toLowerCase()) ? '' : value;
}

function migrateCommunityHubBlocks(templateKey, blocks = [], profileSeed = {}) {
  if (templateKey !== 'agent-community-expert') return blocks;
  const hero = blocks.find((block) => (block?.type || block?.data?.type) === 'hero');
  const needsLayoutMigration = Number(
    hero?.data?.content?.community_hub_layout_version || 0,
  ) < 2;
  const needsSurfaceMigration = Number(
    hero?.data?.content?.community_theme_surface_version || 0,
  ) < 2;
  if (!needsLayoutMigration && !needsSurfaceMigration) return blocks;

  const defaults = materializeTemplate(templateKey, profileSeed)?.blocks || [];
  const next = blocks.map((block) => {
    const type = block?.type || block?.data?.type;
    const content = block?.data?.content || {};
    const style = block?.data?.style || {};
    return {
      ...block,
      data: {
        ...(block.data || {}),
        style: needsSurfaceMigration
          ? {
              ...style,
              background: migrateCommunitySurfaceValue(style.background),
            }
          : style,
        content: {
          ...content,
          ...(needsSurfaceMigration
            ? {
                panel_background: migrateCommunitySurfaceValue(content.panel_background),
                section_background: migrateCommunitySurfaceValue(content.section_background),
              }
            : {}),
          ...(type === 'hero'
            ? {
                community_hub_layout_version: 2,
                community_theme_surface_version: 2,
              }
            : {}),
        },
      },
    };
  });
  if (!needsLayoutMigration) return next;

  const existingTypes = new Set(next.map((block) => block?.type || block?.data?.type));

  defaults.forEach((defaultBlock, defaultIndex) => {
    if (existingTypes.has(defaultBlock.type)) return;
    const followingTypes = new Set(
      defaults.slice(defaultIndex + 1).map((candidate) => candidate.type),
    );
    const insertAt = next.findIndex((candidate) => (
      followingTypes.has(candidate?.type || candidate?.data?.type)
    ));
    next.splice(insertAt >= 0 ? insertAt : next.length, 0, defaultBlock);
    existingTypes.add(defaultBlock.type);
  });

  return next;
}

function migrateSharedProofBlocks(templateKey, blocks = [], profileSeed = {}) {
  if (!SHARED_PROOF_TEMPLATE_KEYS.has(templateKey)) return blocks;
  const migratedBlocks = blocks.map((block) => {
    const type = block?.type || block?.data?.type;
    const content = block?.data?.content || {};
    const existingItems = Array.isArray(content.items) ? content.items : [];
    if (
      type === 'seller-performance'
      && Number(content.shared_proof_performance_version || 0) < 2
    ) {
      const canonicalItems = [
        { label: 'Homes sold', value: '', source: 'closed_seller_leads' },
        { label: 'Experience', value: '', source: 'years_experience' },
        { label: 'Client rating', value: '', source: 'rating' },
        { label: 'Available options', value: '', source: 'available_seller_leads' },
      ];
      return {
        ...block,
        data: {
          ...(block.data || {}),
          content: {
            ...content,
            shared_proof_performance_version: 2,
            items: canonicalItems.map((item, index) => ({
              ...(existingItems[index] || {}),
              ...item,
            })),
          },
        },
      };
    }
    if (
      type === 'seller-credentials'
      && Number(content.shared_proof_metrics_version || 0) < 2
    ) {
      const canonicalItems = [
            { title: 'Clients', issuer: '', source: 'total_clients' },
            { title: 'Active pipeline value', issuer: '', source: 'active_pipeline_value' },
            { title: 'Sold property value', issuer: '', source: 'total_sold_home_value' },
            {
              title: 'Brokerage',
              issuer: profileSeed?.professional_profile?.company_name || profileSeed?.company_name || '',
              source: 'company',
            },
      ];
      return {
        ...block,
        data: {
          ...(block.data || {}),
          content: {
            ...content,
            shared_proof_metrics_version: 2,
            items: canonicalItems.map((item, index) => ({
              ...(existingItems[index] || {}),
              ...item,
            })),
          },
        },
      };
    }
    if (type === 'seller-case-study' && Number(content.shared_proof_case_study_version || 0) < 2) {
      const titleKey = existingItems.map((item) => item?.title).join('|');
      const templateDefaultTitles = new Set([
        'The private brief|The tailored strategy|The considered result',
        'Build readiness|Search with context|Offer with confidence',
        'Find the right fit|Read the micro-market|Move with confidence',
      ]);
      if (templateDefaultTitles.has(titleKey)) {
        const canonicalItems = [
          { title: 'The challenge', description: 'Bring the property to market with a clear point of difference while protecting the seller’s timeline and net goal.', icon: 'target' },
          { title: 'The strategy', description: 'Prioritize presentation, pricing discipline, and buyer targeting around the strongest local demand signals.', icon: 'sparkles' },
          { title: 'The outcome', description: 'Create a cleaner launch, stronger offer conversations, and a more confident path from listing to close.', icon: 'shield' },
        ];
        return {
          ...block,
          data: {
            ...(block.data || {}),
            content: {
              ...content,
              shared_proof_case_study_version: 2,
              items: canonicalItems.map((item, index) => ({
                ...(existingItems[index] || {}),
                ...item,
              })),
            },
          },
        };
      }
    }
    return block;
  });
  const defaults = materializeTemplate(templateKey, profileSeed)?.blocks || [];
  const proofDefaults = defaults.filter((block) => SHARED_PROOF_BLOCK_TYPES.has(block.type));
  const withLayoutVersion = (block) => ({
    ...block,
    data: {
      ...(block.data || {}),
      content: {
        ...(block.data?.content || block.content || {}),
        shared_proof_layout_version: 1,
      },
    },
  });
  const needsOrderMigration = migratedBlocks.some((block) => (
    SHARED_PROOF_BLOCK_TYPES.has(block?.type || block?.data?.type)
    && Number(block?.data?.content?.shared_proof_layout_version || 0) < 1
  ));
  if (needsOrderMigration) {
    const existingByType = new Map(migratedBlocks
      .filter((block) => SHARED_PROOF_BLOCK_TYPES.has(block?.type || block?.data?.type))
      .map((block) => [block?.type || block?.data?.type, block]));
    const withoutProof = migratedBlocks.filter(
      (block) => !SHARED_PROOF_BLOCK_TYPES.has(block?.type || block?.data?.type),
    );
    const footerIndex = withoutProof.findIndex(
      (block) => (block?.type || block?.data?.type) === 'footer',
    );
    const insertionIndex = footerIndex >= 0 ? footerIndex : withoutProof.length;
    withoutProof.splice(
      insertionIndex,
      0,
      ...proofDefaults.map((defaultBlock) => withLayoutVersion(
        existingByType.get(defaultBlock.type) || defaultBlock,
      )),
    );
    return withoutProof;
  }
  const nextBlocks = [...migratedBlocks];
  const defaultOrder = defaults.map((block) => block.type);

  proofDefaults.forEach((defaultBlock) => {
      if (nextBlocks.some((block) => (block?.type || block?.data?.type) === defaultBlock.type)) return;
      const defaultIndex = defaultOrder.indexOf(defaultBlock.type);
      const previousTypes = defaultOrder.slice(0, defaultIndex).reverse();
      const nextTypes = defaultOrder.slice(defaultIndex + 1);
      const previousIndex = previousTypes
        .map((type) => nextBlocks.findIndex((block) => (block?.type || block?.data?.type) === type))
        .find((index) => index >= 0);
      if (previousIndex >= 0) {
        nextBlocks.splice(previousIndex + 1, 0, withLayoutVersion(defaultBlock));
        return;
      }
      const nextIndex = nextTypes
        .map((type) => nextBlocks.findIndex((block) => (block?.type || block?.data?.type) === type))
        .find((index) => index >= 0);
      nextBlocks.splice(nextIndex >= 0 ? nextIndex : nextBlocks.length, 0, withLayoutVersion(defaultBlock));
    });

  return nextBlocks;
}

function migrateInvestorBlocks(templateKey, blocks = []) {
  if (templateKey !== 'agent-investor') return blocks;
  return (Array.isArray(blocks) ? blocks : []).filter((block) => {
    const type = block?.type || block?.data?.type;
    return type !== 'testimonials';
  });
}

function blockType(block) {
  return block?.type || block?.data?.type || '';
}

function needsLawyerClassicV2Migration(templateKey, blocks = []) {
  if (templateKey !== 'lawyer-classic') return false;
  const hero = (Array.isArray(blocks) ? blocks : []).find(
    (block) => blockType(block) === STOREFRONT_BLOCK_TYPES.HERO,
  );
  const content = hero?.data?.content || hero?.content || {};
  return Number(content.lawyer_classic_design_version || 0) < 2;
}

function migrateLawyerClassicBlocks(templateKey, blocks = [], profileSeed = {}) {
  if (templateKey !== 'lawyer-classic') return blocks;
  const defaults = materializeTemplate(templateKey, profileSeed)?.blocks || [];
  const defaultsByType = new Map(defaults.map((block) => [block.type, block]));
  const mergeWithDefault = (existing, fallback) => {
    if (!fallback) return existing;
    const fallbackData = fallback.data || {};
    const existingData = existing?.data || {};
    const existingContent = existingData.content || existing?.content || {};
    const existingLayout = existingData.layout || existing?.layout || {};
    const existingStyle = existingData.style || existing?.style || {};
    return {
      ...fallback,
      ...existing,
      data: {
        ...fallbackData,
        ...existingData,
        enabled: existingData.enabled ?? existing?.enabled ?? fallbackData.enabled ?? true,
        content: {
          ...(fallbackData.content || {}),
          ...existingContent,
        },
        layout: {
          ...(fallbackData.layout || {}),
          ...existingLayout,
        },
        style: {
          ...(fallbackData.style || {}),
          ...existingStyle,
        },
      },
    };
  };

  if (!needsLawyerClassicV2Migration(templateKey, blocks)) {
    const source = Array.isArray(blocks) ? blocks : [];
    const hasPracticeAreas = source.some(
      (block) => blockType(block) === STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
    );
    let next = source
      .filter((block) => (
        !hasPracticeAreas
        || blockType(block) !== STOREFRONT_BLOCK_TYPES.SERVICES
      ))
      .map((block) => (
        refreshLawyerClassicBlockCopy(
          mergeWithDefault(block, defaultsByType.get(blockType(block))),
        )
      ));
    LAWYER_CLASSIC_CANONICAL_BLOCK_ORDER.forEach((type) => {
      if (next.some((block) => blockType(block) === type)) return;
      const fallback = defaultsByType.get(type);
      if (!fallback) return;
      next = insertBlockAtTemplateRank(next, fallback, templateKey);
    });
    return next;
  }

  const canonicalTypes = new Set(LAWYER_CLASSIC_CANONICAL_BLOCK_ORDER);
  const existingByType = new Map();
  const supplemental = [];

  (Array.isArray(blocks) ? blocks : []).forEach((block) => {
    const type = blockType(block);
    if (type === STOREFRONT_BLOCK_TYPES.SERVICES) {
      return;
    }
    if (canonicalTypes.has(type)) {
      if (!existingByType.has(type)) existingByType.set(type, block);
      return;
    }
    supplemental.push(block);
  });

  const canonical = LAWYER_CLASSIC_CANONICAL_BLOCK_ORDER.map((type) => {
    const existing = existingByType.get(type);
    if (!existing) return defaultsByType.get(type);
    return mergeWithDefault(existing, defaultsByType.get(type));
  }).filter(Boolean).map(refreshLawyerClassicBlockCopy);
  const heroIndex = canonical.findIndex(
    (block) => blockType(block) === STOREFRONT_BLOCK_TYPES.HERO,
  );
  if (heroIndex >= 0) {
    const hero = canonical[heroIndex];
    const heroContent = hero.data?.content || hero.content || {};
    const legacyEyebrow = String(heroContent.eyebrow || '').trim().toLowerCase();
    canonical[heroIndex] = {
      ...hero,
      data: {
        ...(hero.data || {}),
        content: {
          ...heroContent,
          ...(['', 'community expert', 'real estate expert'].includes(legacyEyebrow)
            ? { eyebrow: 'Property law · Closing counsel' }
            : {}),
          lawyer_classic_design_version: 2,
        },
      },
    };
  }

  const footerIndex = canonical.findIndex(
    (block) => blockType(block) === STOREFRONT_BLOCK_TYPES.FOOTER,
  );
  if (footerIndex >= 0) {
    const footer = canonical[footerIndex];
    const footerStyle = footer.data?.style || footer.style || {};
    const legacyFooterBackground = String(footerStyle.background || '').trim().toLowerCase();
    canonical[footerIndex] = {
      ...footer,
      data: {
        ...(footer.data || {}),
        layout: {
          ...(footer.data?.layout || footer.layout || {}),
          width: 'full',
          padding: 'none',
        },
        style: {
          ...footerStyle,
          ...(['', '#ffffff', '#f8fafc'].includes(legacyFooterBackground)
            ? { background: '#202020', textColor: '#ffffff' }
            : {}),
          radius: 'none',
          shadow: 'none',
        },
      },
    };
  }
  if (footerIndex < 0 || supplemental.length === 0) return canonical;
  return [
    ...canonical.slice(0, footerIndex),
    ...supplemental,
    ...canonical.slice(footerIndex),
  ];
}

function migrateNewcomerBlocks(templateKey, blocks = [], profileSeed = {}) {
  if (templateKey !== 'lawyer-newcomer') return blocks;
  const defaults = materializeTemplate(templateKey, profileSeed)?.blocks || [];
  return migrateLawyerNewcomerBlocks(blocks, defaults);
}

function needsLawyerNewcomerMigration(templateKey, blocks = [], profileSeed = {}) {
  if (templateKey !== 'lawyer-newcomer') return false;
  const source = normalizeBlocks(blocks);
  const migrated = normalizeBlocks(migrateNewcomerBlocks(templateKey, blocks, profileSeed));
  return JSON.stringify(source) !== JSON.stringify(migrated);
}

function applyTemplateBrandKitMigrations(templateKey, input = {}) {
  return migrateLawyerNewcomerBrandKit(
    templateKey,
    migrateCommunityHubBrandKit(
      templateKey,
      migrateSellerExpertBrandKit(templateKey, migrateFirstHomeBrandKit(templateKey, input)),
    ),
  );
}

function applyTemplateBlocksMigrations(templateKey, blocks = [], profileSeed = {}) {
  const migrated = migrateSharedProofBlocks(
    templateKey,
    migrateCommunityHubBlocks(
      templateKey,
      migrateSellerExpertBlocks(
        templateKey,
        migrateFirstHomeBlocks(
          templateKey,
          migrateClassicBlocks(templateKey, migrateInvestorBlocks(templateKey, blocks)),
        ),
        profileSeed,
      ),
      profileSeed,
    ),
    profileSeed,
  );
  return migrateNewcomerBlocks(
    templateKey,
    migrateLawyerClassicBlocks(templateKey, migrated, profileSeed),
    profileSeed,
  );
}

function hydrateTemplateBlocks(templateKey, blocks = [], profileSeed = {}, migrationApplied = false) {
  const migrated = applyTemplateBlocksMigrations(templateKey, blocks, profileSeed);
  if (templateKey === 'lawyer-classic' && !migrationApplied) {
    return normalizeBlocks(migrated);
  }
  return seedBlockContentFromProfile(migrated, profileSeed, templateKey);
}

function editorDataFromDraft(
  draft,
  profileSeed,
  professional,
  fallbackTemplateKey,
  sharedMediaBrandKit = {},
) {
  const templateKey = draft?.template?.id || fallbackTemplateKey;
  const migratedDraftBrandKit = applyTemplateBrandKitMigrations(
    templateKey,
    draft?.brandKit || {},
  );
  const brandMigrationApplied = JSON.stringify(draft?.brandKit || {})
    !== JSON.stringify(migratedDraftBrandKit);
  const savedBrandKit = mergeStorefrontMedia(
    migratedDraftBrandKit,
    sharedMediaBrandKit,
  );
  if (Array.isArray(draft?.blocks) && draft.blocks.length) {
    const migrationApplied = brandMigrationApplied
      || needsLawyerClassicV2Migration(templateKey, draft.blocks)
      || needsLawyerNewcomerMigration(templateKey, draft.blocks, profileSeed);
    return {
      migrationApplied,
      editorData: {
        template_key: templateKey,
        brand_kit: {
          business_name: savedBrandKit.business_name || professional.company_name || '',
          logo_url: savedBrandKit.logo_url || '',
          logo_dark_url: savedBrandKit.logo_dark_url || '',
          cover_url: savedBrandKit.cover_url || '',
          profile_photo_url: savedBrandKit.profile_photo_url || '',
          logo_size: Number(savedBrandKit.logo_size) || 40,
          cover_position_x: Number(savedBrandKit.cover_position_x ?? 50),
          cover_position_y: Number(savedBrandKit.cover_position_y ?? 50),
          cover_zoom: Math.max(1, Number(savedBrandKit.cover_zoom ?? 1)),
          profile_position_x: Number(savedBrandKit.profile_position_x ?? 50),
          profile_position_y: Number(savedBrandKit.profile_position_y ?? 25),
          profile_zoom: Number(savedBrandKit.profile_zoom ?? 1),
          primary_color: savedBrandKit.primary_color || '#0f766e',
          accent_color: savedBrandKit.accent_color || '#f59e0b',
          page_background: savedBrandKit.page_background || '#ffffff',
          font: savedBrandKit.font_family || savedBrandKit.font || 'Manrope',
          button_shape: savedBrandKit.button_shape || 'rounded',
          image_style: savedBrandKit.image_style || 'editorial',
          show_chatbot: savedBrandKit.show_chatbot !== false,
          essentials: savedBrandKit.essentials || {},
        },
        blocks: hydrateTemplateBlocks(
          templateKey,
          draft.blocks,
          profileSeed,
          migrationApplied,
        ),
      },
    };
  }

  const materialized = materializeTemplate(templateKey, profileSeed, {
    business_name: professional.company_name || '',
    ...sharedMediaBrandKit,
  });
  return {
    migrationApplied: false,
    editorData: {
      template_key: templateKey,
      brand_kit: {
        business_name: professional.company_name || '',
        logo_url: '',
        logo_dark_url: '',
        cover_url: '',
        profile_photo_url: '',
        logo_size: 40,
        cover_position_x: 50,
        cover_position_y: 50,
        cover_zoom: 1,
        profile_position_x: 50,
        profile_position_y: 25,
        profile_zoom: 1,
        primary_color: '#0f766e',
        accent_color: '#f59e0b',
        page_background: '#ffffff',
        font: 'Manrope',
        button_shape: 'rounded',
        image_style: 'editorial',
        show_chatbot: true,
        essentials: {},
        ...(materialized?.brand_kit || {}),
      },
      blocks: materialized?.blocks || normalizeBlocks(STOREFRONT_TEMPLATE_PRESETS[professional.professional_type] || []),
    },
  };
}

export default function useStorefrontEditorState({
  profileData,
  storefrontDraftData,
  storefrontDraftError,
  storefrontDraftFetching,
  saveStorefrontMutation,
  uploadMedia,
  queryClient,
}) {
  const [editorData, setEditorData] = useState(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [autosaveRetryNonce, setAutosaveRetryNonce] = useState(0);
  const editorHydrated = useRef(false);
  const lastSavedDraftSignatureRef = useRef('');
  const lastFailedDraftSignatureRef = useRef('');
  const lastPublishedDraftSignatureRef = useRef('');
  const templateDraftsRef = useRef({});
  const latestEditorDataRef = useRef(null);
  const queuedDraftRef = useRef(null);
  const revisionConflictRef = useRef(false);

  useEffect(() => {
    if (!profileData || editorHydrated.current) return;
    if (storefrontDraftData === undefined && !storefrontDraftError) return;

    try {
      const savedProfile = profileData.profile || {};
      const professional = profileData.professional_profile || {};
      const legacyDraft = storefrontDraftData?.draft || null;
      const savedDrafts = Array.isArray(storefrontDraftData?.drafts) && storefrontDraftData.drafts.length
        ? storefrontDraftData.drafts
        : (legacyDraft ? [legacyDraft] : []);
      const hasPersistedStorefront = Boolean(savedProfile?._id) || savedDrafts.some((draft) => draft?.blocks?.length);
      if (!hasPersistedStorefront) {
        setEditorData(null);
        editorHydrated.current = true;
        return;
      }
      const role = normalizeRole(
        professional.professional_type || profileData.professional_type || savedProfile.professional_type,
      );
      const profileSeed = {
        ...profileSeedFromData(profileData),
        headline: savedProfile.headline,
        tagline: savedProfile.tagline,
        about: savedProfile.about,
      };
      const profileMediaBrandKit = {
        logo_url: savedProfile.storefront_logo_url || '',
        cover_url: savedProfile.cover_photo_url || profileData?.user?.cover_image || '',
        profile_photo_url: savedProfile.profile_photo_url || profileData?.user?.profile_image || '',
      };
      const sharedMediaBrandKit = savedDrafts.reduce(
        (current, draft) => mergeStorefrontMedia(draft?.brandKit || {}, current),
        profileMediaBrandKit,
      );

      const fallbackTemplateKey = defaultStorefrontTemplateKey(role);
      const hydratedDraftResults = savedDrafts.map((draft) => editorDataFromDraft(
        draft,
        profileSeed,
        professional,
        fallbackTemplateKey,
        sharedMediaBrandKit,
      ));
      const hydratedDrafts = hydratedDraftResults.map((result) => result.editorData);
      hydratedDrafts.forEach((draft) => {
        templateDraftsRef.current[draft.template_key] = cloneEditorData(draft);
      });
      const activeTemplateKey = storefrontDraftData?.active_template_id
        || legacyDraft?.template?.id
        || hydratedDrafts[0]?.template_key
        || fallbackTemplateKey;
      const activeHydratedResult = hydratedDraftResults.find(
        (result) => result.editorData.template_key === activeTemplateKey,
      );
      const fallbackActiveResult = activeHydratedResult
        ? null
        : editorDataFromDraft(
          null,
          profileSeed,
          professional,
          activeTemplateKey,
          sharedMediaBrandKit,
        );
      const activeDraft = activeHydratedResult?.editorData
        || fallbackActiveResult.editorData;
      const activeMigrationApplied = Boolean(activeHydratedResult?.migrationApplied);
      const backupKey = `nesti-storefront-backup:${savedProfile?.slug || profileData?.suggested_slug || 'new'}`;
      let recoveredDraft = null;
      let recoveredMigrationApplied = false;
      try {
        const backup = JSON.parse(window.localStorage.getItem(backupKey) || 'null');
        if (
          backup?.editorData?.template_key
          && Array.isArray(backup.editorData.blocks)
        ) {
          recoveredDraft = cloneEditorData(backup.editorData);
          recoveredMigrationApplied = needsLawyerClassicV2Migration(
            recoveredDraft.template_key,
            recoveredDraft.blocks,
          ) || needsLawyerNewcomerMigration(
            recoveredDraft.template_key,
            recoveredDraft.blocks,
            profileSeed,
          );
          recoveredDraft.blocks = hydrateTemplateBlocks(
            recoveredDraft.template_key,
            recoveredDraft.blocks,
            profileSeed,
            recoveredMigrationApplied,
          );
        }
      } catch {
        window.localStorage.removeItem(backupKey);
      }
      const initialDraft = recoveredDraft || activeDraft;
      templateDraftsRef.current[initialDraft.template_key] = cloneEditorData(initialDraft);
      setEditorData(initialDraft);
      const initialSignature = draftSignature(buildStorefrontDraft(initialDraft));
      const initialMigrationApplied = recoveredDraft
        ? recoveredMigrationApplied
        : activeMigrationApplied;
      lastSavedDraftSignatureRef.current = recoveredDraft || initialMigrationApplied ? '' : initialSignature;
      const activeRawDraft = savedDrafts.find(
        (draft) => (draft?.template?.id || '') === initialDraft.template_key,
      ) || legacyDraft;
      const draftUpdatedAt = activeRawDraft?.updated_at || storefrontDraftData?.draft?.updated_at;
      const publishedAt = storefrontDraftData?.published_at;
      const draftAheadOfLive = Boolean(
        publishedAt
        && draftUpdatedAt
        && new Date(draftUpdatedAt).getTime() > new Date(publishedAt).getTime()
      );
      setEditorDirty(Boolean(recoveredDraft) || initialMigrationApplied);
      setHasUnpublishedChanges(Boolean(recoveredDraft) || initialMigrationApplied || draftAheadOfLive);
      if (!draftAheadOfLive && !recoveredDraft && !initialMigrationApplied) {
        lastPublishedDraftSignatureRef.current = initialSignature;
      }
      if (recoveredDraft) toast.info('Recovered unsaved storefront changes');
      editorHydrated.current = true;
    } catch (error) {
      console.error('Failed to hydrate storefront editor', error);
      const role = normalizeRole(profileData.professional_profile?.professional_type || profileData.professional_type);
      const fallbackTemplateKey = defaultStorefrontTemplateKey(role);
      const defaults = getTemplateBrandDefaults(fallbackTemplateKey) || {};
      setEditorData({
        template_key: fallbackTemplateKey,
        brand_kit: {
          business_name: profileData.professional_profile?.company_name || '',
          logo_url: '',
          primary_color: defaults.primary_color || '#172554',
          accent_color: defaults.accent_color || '#22c55e',
          page_background: defaults.page_background || '#f8fafc',
          font: defaults.font || 'Manrope',
          button_shape: defaults.button_shape || 'rounded',
          image_style: defaults.image_style || 'minimal',
          essentials: {},
        },
        blocks: normalizeBlocks(STOREFRONT_TEMPLATE_PRESETS[role] || []),
      });
      setHasUnpublishedChanges(false);
      editorHydrated.current = true;
    }
  }, [profileData, storefrontDraftData, storefrontDraftError]);

  useEffect(() => {
    if (!editorData?.template_key) return;
    latestEditorDataRef.current = editorData;
    templateDraftsRef.current[editorData.template_key] = cloneEditorData(editorData);
  }, [editorData]);

  useEffect(() => {
    if (!editorData || !editorDirty) return undefined;
    if (storefrontDraftFetching) return undefined;
    if (revisionConflictRef.current) return undefined;
    const draft = buildStorefrontDraft(editorData);
    const signature = draftSignature(draft);
    if (saveStorefrontMutation.isPending) {
      queuedDraftRef.current = { draft, signature };
      return undefined;
    }
    if (signature === lastSavedDraftSignatureRef.current) {
      setEditorDirty(false);
      return undefined;
    }
    const backupKey = `nesti-storefront-backup:${profileData?.profile?.slug || profileData?.suggested_slug || 'new'}`;
    try {
      window.localStorage.setItem(backupKey, JSON.stringify({ savedAt: Date.now(), editorData }));
    } catch {
      // Autosave remains authoritative when browser storage is unavailable.
    }
    const retryDelay = signature === lastFailedDraftSignatureRef.current ? 5000 : 1200;
    const timer = window.setTimeout(() => {
      saveStorefrontMutation.mutate(draft, {
        onSuccess: () => {
          revisionConflictRef.current = false;
          lastSavedDraftSignatureRef.current = signature;
          lastFailedDraftSignatureRef.current = '';
          setAutosaveRetryNonce(0);
          window.localStorage.removeItem(backupKey);
          const latestSignature = latestEditorDataRef.current
            ? draftSignature(buildStorefrontDraft(latestEditorDataRef.current))
            : signature;
          if (latestSignature === signature) setEditorDirty(false);
          // Draft saved != live updated. Keep Update live enabled until publish.
          setHasUnpublishedChanges(signature !== lastPublishedDraftSignatureRef.current);
        },
        onError: (error) => {
          lastFailedDraftSignatureRef.current = signature;
          if (error?.status === 409) {
            revisionConflictRef.current = true;
            queuedDraftRef.current = null;
            return;
          }
          setAutosaveRetryNonce((current) => current + 1);
        },
      });
    }, retryDelay);
    return () => window.clearTimeout(timer);
  }, [
    autosaveRetryNonce,
    editorData,
    editorDirty,
    profileData,
    saveStorefrontMutation,
    storefrontDraftFetching,
  ]);

  useEffect(() => {
    if (storefrontDraftFetching) return;
    if (saveStorefrontMutation.isPending || !queuedDraftRef.current) return;
    const queued = queuedDraftRef.current;
    queuedDraftRef.current = null;
    if (queued.signature === lastSavedDraftSignatureRef.current) return;
    saveStorefrontMutation.mutate(queued.draft, {
      onSuccess: () => {
        revisionConflictRef.current = false;
        lastSavedDraftSignatureRef.current = queued.signature;
        lastFailedDraftSignatureRef.current = '';
        setAutosaveRetryNonce(0);
        const latestSignature = latestEditorDataRef.current
          ? draftSignature(buildStorefrontDraft(latestEditorDataRef.current))
          : queued.signature;
        if (latestSignature === queued.signature) setEditorDirty(false);
        setHasUnpublishedChanges(queued.signature !== lastPublishedDraftSignatureRef.current);
      },
      onError: (error) => {
        lastFailedDraftSignatureRef.current = queued.signature;
        setEditorDirty(true);
        if (error?.status === 409) {
          revisionConflictRef.current = true;
          queuedDraftRef.current = null;
          return;
        }
        setAutosaveRetryNonce((current) => current + 1);
      },
    });
  }, [
    editorData,
    editorDirty,
    saveStorefrontMutation.isPending,
    saveStorefrontMutation,
    storefrontDraftFetching,
  ]);

  const updateEditor = (updates) => {
    setEditorData((current) => ({ ...current, ...updates }));
    setEditorDirty(true);
    setHasUnpublishedChanges(true);
  };

  const selectTemplate = async (templateKey) => {
    if (editorData?.template_key === templateKey) return false;
    const template = getStorefrontTemplate(templateKey);
    if (!template) return false;
    revisionConflictRef.current = false;

    if (editorData?.template_key) {
      templateDraftsRef.current[editorData.template_key] = cloneEditorData(editorData);
    }
    const cachedTemplateDraft = templateDraftsRef.current[templateKey];
    if (cachedTemplateDraft) {
      const restored = cloneEditorData(cachedTemplateDraft);
      setEditorData({
        ...restored,
        blocks: applyTemplateBlocksMigrations(templateKey, restored.blocks, profileSeedFromData(profileData)),
        brand_kit: applyStorefrontMedia(
          restored.brand_kit,
          editorData?.brand_kit,
        ),
      });
      setEditorDirty(true);
      setHasUnpublishedChanges(true);
      toast.success(`${template.label} restored`);
      return true;
    }

    const next = materializeTemplate(templateKey, profileSeedFromData(profileData), editorData.brand_kit);
    if (!next) return false;
    setEditorData({
      template_key: next.template_key,
      brand_kit: next.brand_kit,
      blocks: next.blocks,
    });
    setEditorDirty(true);
    setHasUnpublishedChanges(true);
    toast.success(`${template.label} applied`);
    return true;
  };

  const updateBrandKit = (updates) => {
    setEditorData((current) => ({
      ...current,
      brand_kit: { ...current.brand_kit, ...updates },
    }));
    setEditorDirty(true);
    setHasUnpublishedChanges(true);
  };

  const resetTemplateColors = () => {
    const defaults = getTemplateBrandDefaults(editorData?.template_key);
    if (!defaults) return false;
    const alreadyDefault = (
      normalizeHexForCompare(editorData?.brand_kit?.primary_color) === normalizeHexForCompare(defaults.primary_color)
      && normalizeHexForCompare(editorData?.brand_kit?.accent_color) === normalizeHexForCompare(defaults.accent_color)
      && normalizeHexForCompare(editorData?.brand_kit?.page_background) === normalizeHexForCompare(defaults.page_background)
      && String(editorData?.brand_kit?.button_shape || 'rounded') === String(defaults.button_shape || 'rounded')
      && String(editorData?.brand_kit?.font || '') === String(defaults.font || '')
      && String(editorData?.brand_kit?.image_style || '') === String(defaults.image_style || '')
    );
    if (alreadyDefault) return false;
    updateBrandKit({
      primary_color: defaults.primary_color,
      accent_color: defaults.accent_color,
      page_background: defaults.page_background,
      button_shape: defaults.button_shape,
      font: defaults.font,
      image_style: defaults.image_style,
    });
    toast.success('Template colors restored');
    return true;
  };

  const resetTemplateDefaults = () => {
    const templateKey = editorData?.template_key;
    const template = getStorefrontTemplate(templateKey);
    if (!template) return false;

    const next = materializeTemplate(templateKey, profileSeedFromData(profileData), editorData.brand_kit);
    if (!next) return false;
    const currentBlocks = normalizeBlocks(editorData.blocks || []);
    const templateBlocks = normalizeBlocks(next.blocks || []);
    const nextBrandKit = {
      ...next.brand_kit,
      business_name: editorData.brand_kit.business_name || next.brand_kit.business_name,
      logo_url: editorData.brand_kit.logo_url || '',
      logo_dark_url: editorData.brand_kit.logo_dark_url || '',
      cover_url: editorData.brand_kit.cover_url || '',
      profile_photo_url: editorData.brand_kit.profile_photo_url || '',
      logo_size: editorData.brand_kit.logo_size,
      cover_position_x: editorData.brand_kit.cover_position_x,
      cover_position_y: editorData.brand_kit.cover_position_y,
      cover_zoom: editorData.brand_kit.cover_zoom,
      profile_position_x: editorData.brand_kit.profile_position_x,
      profile_position_y: editorData.brand_kit.profile_position_y,
      profile_zoom: editorData.brand_kit.profile_zoom,
      essentials: editorData.brand_kit.essentials,
      show_chatbot: editorData.brand_kit.show_chatbot !== false,
    };
    const isNoopReset = blockLayoutStyleSignature(currentBlocks) === blockLayoutStyleSignature(templateBlocks)
      && JSON.stringify(editorData.brand_kit || {}) === JSON.stringify(nextBrandKit || {});
    if (isNoopReset) return false;
    setEditorData({
      template_key: next.template_key,
      brand_kit: nextBrandKit,
      blocks: templateBlocks,
    });
    setEditorDirty(true);
    setHasUnpublishedChanges(true);
    toast.success(`${template.label} restored to defaults`);
    return true;
  };

  const updateEssential = (key, value) => {
    setEditorData((current) => ({
      ...current,
      brand_kit: {
        ...current.brand_kit,
        essentials: { ...current.brand_kit.essentials, [key]: value },
      },
    }));
    setEditorDirty(true);
    setHasUnpublishedChanges(true);
  };

  const uploadStorefrontMedia = async (kind, file) => {
    if (!file) return;
    try {
      const response = await uploadMedia.mutateAsync({ kind, file, scope: 'storefront' });
      const url = response?.url || '';
      if (!url) throw new Error('Upload did not return an image URL');
      if (kind === 'logo') updateBrandKit({ logo_url: url });
      if (kind === 'cover') updateBrandKit({ cover_url: url });
      if (kind === 'profile') updateBrandKit({ profile_photo_url: url });
      toast.success(
        `${kind === 'profile' ? 'Page profile photo' : kind === 'cover' ? 'Page cover photo' : 'Logo'} updated for this storefront only`,
      );
    } catch (error) {
      toast.error(error?.message || 'Image upload failed');
    }
  };

  const updateBlock = (id, updates) => {
    updateEditor({
      blocks: editorData.blocks.map((block) => (block.id === id ? { ...block, ...updates } : block)),
    });
  };

  const moveBlock = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= editorData.blocks.length) return;
    const blocks = [...editorData.blocks];
    [blocks[index], blocks[nextIndex]] = [blocks[nextIndex], blocks[index]];
    updateEditor({ blocks });
  };

  const moveBlockTo = (sourceId, targetId) => {
    if (!sourceId || sourceId === targetId) return;
    updateEditor({
      blocks: (() => {
        const blocks = [...editorData.blocks];
        const from = blocks.findIndex((block) => block.id === sourceId);
        const to = blocks.findIndex((block) => block.id === targetId);
        if (from < 0 || to < 0) return blocks;
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);
        return blocks;
      })(),
    });
  };

  const addBlock = (type) => {
    if (!type || !editorData) return;
    if (
      editorData.template_key === 'lawyer-classic'
      && !LAWYER_CLASSIC_CANONICAL_BLOCK_ORDER.includes(type)
    ) {
      return;
    }
    if (
      isSingletonBlockType(type, editorData.template_key)
      && editorData.blocks.some((block) => blockType(block) === type)
    ) {
      return;
    }
    const templateBlock = materializeTemplate(
      editorData.template_key,
      profileSeedFromData(profileData),
      editorData.brand_kit,
    )?.blocks?.find((block) => block.type === type);
    const created = templateBlock
      ? {
          ...templateBlock,
          id: `${type}-${crypto.randomUUID?.() || Date.now()}`,
          data: { ...templateBlock.data, enabled: true },
        }
      : createBlock(type);
    updateEditor({
      blocks: insertBlockAtTemplateRank(
        editorData.blocks,
        created,
        editorData.template_key,
      ),
    });
  };

  const removeBlock = (id) => {
    const target = editorData?.blocks?.find((block) => block.id === id);
    if (!target || isProtectedBlockType(blockType(target))) return;
    updateEditor({ blocks: editorData.blocks.filter((block) => block.id !== id) });
  };

  const resetAfterDelete = () => {
    setEditorData(null);
    setEditorDirty(false);
    setHasUnpublishedChanges(false);
    templateDraftsRef.current = {};
    latestEditorDataRef.current = null;
    queuedDraftRef.current = null;
    revisionConflictRef.current = false;
    lastSavedDraftSignatureRef.current = '';
    lastFailedDraftSignatureRef.current = '';
    lastPublishedDraftSignatureRef.current = '';
    setAutosaveRetryNonce(0);
    editorHydrated.current = false;
  };

  const markHydrated = () => {
    editorHydrated.current = true;
  };

  const markDraftSaved = (draft) => {
    lastSavedDraftSignatureRef.current = draftSignature(draft);
    setEditorDirty(false);
  };

  const markLiveSynced = (draft = null) => {
    if (draft) {
      const signature = draftSignature(draft);
      lastPublishedDraftSignatureRef.current = signature;
      lastSavedDraftSignatureRef.current = signature;
      setEditorDirty(false);
    }
    setHasUnpublishedChanges(false);
  };

  return {
    editorData,
    setEditorData,
    editorDirty,
    setEditorDirty,
    previewMode,
    setPreviewMode,
    draggedBlockId,
    setDraggedBlockId,
    updateEditor,
    selectTemplate,
    updateBrandKit,
    resetTemplateColors,
    resetTemplateDefaults,
    updateEssential,
    uploadStorefrontMedia,
    updateBlock,
    moveBlock,
    moveBlockTo,
    addBlock,
    removeBlock,
    resetAfterDelete,
    markHydrated,
    markDraftSaved,
    markLiveSynced,
    uploadMediaPending: uploadMedia.isPending,
    hasUnpublishedChanges,
  };
}
