'use client';
/* nesti-builder-v4: inline-grid layout */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutTemplate,
  Monitor,
  Plus,
  Redo2,
  Settings2,
  Smartphone,
  Tablet,
  Undo2,
  X,
} from 'lucide-react';
import StorefrontBlockRenderer from '@/components/storefront/StorefrontBlockRenderer';
import PublicChatBubble from '@/components/public-profile/PublicChatBubble';
import { getGuidanceCollectionFallback } from '@/components/public-profile/PublicGuidanceSection';
import { getRoleDetailsCollectionFallback } from '@/components/public-profile/PublicRoleDetailSection';
import DeleteLeadConfirmModal from '@/components/leads/DeleteLeadConfirmModal';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  availableBlocksForRole,
  coerceCollectionItems,
  createBlock,
  createContentItemId,
  insertBlockAtTemplateRank,
  isProtectedBlockType,
  isSingletonBlockType,
  labelForBlock,
  normalizeBlocks,
  removeContentItem,
  rekeyContentItems,
  resolveContentItem,
  toRendererBlocks,
  updateContentItem,
} from './storefrontBuilderState';
import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';
import { LAWYER_CLASSIC_PROCESS_DEFAULTS } from '../renderers/variants/lawyer/shared/lawyerSectionUtils';
import { ChatBubbleLayer, LibraryBlock, SortableLayer } from './BuilderLayersPanel';
import PageSettings from './BuilderPageSettings';
import Inspector from './BuilderBlockInspector';
import {
  getStorefrontTemplate,
  getTemplateBrandDefaults,
  materializeTemplate,
} from '../templates';

const PANELS = [
  { id: 'layers', label: 'Layers', Icon: LayoutTemplate },
  { id: 'add', label: 'Add', Icon: Plus },
  { id: 'settings', label: 'Design', Icon: Settings2 },
];

const PREVIEW_WIDTHS = { desktop: 1280, tablet: 834, mobile: 390 };
const SELLER_SERVICE_SUPPLEMENTAL = [
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
const SELLER_ROLE_SUPPLEMENTAL = [
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
const COMMUNITY_SERVICE_SUPPLEMENTAL = {
  id: 'community-service-6',
  title: 'Neighborhood timing & offer strategy',
  description: 'Know when to move, what to offer, and how local demand shapes your next step.',
  icon: 'shield',
  background: '',
  text_color: '',
  icon_background: '',
  icon_color: '',
};

function appendUniqueItems(items, supplemental, limit) {
  if (items.length >= limit) return items;
  return [
    ...items,
    ...supplemental.filter((candidate) => (
      !items.some((item) => (
        item?.id === candidate.id
        || String(item?.title || '').trim().toLowerCase() === candidate.title.toLowerCase()
      ))
    )),
  ].slice(0, limit);
}

function normalizeHexForCompare(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withHash = raw.startsWith('#') ? raw : `#${raw}`;
  const shortMatch = /^#[0-9a-fA-F]{3}$/.test(withHash);
  if (shortMatch) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash.toLowerCase() : withHash.toLowerCase();
}

function blockLayoutStyleSignature(blocks = []) {
  return JSON.stringify(
    normalizeBlocks(blocks).map((block) => ({
      type: block?.type || '',
      enabled: block?.data?.enabled ?? true,
      layout: block?.data?.layout || {},
      style: block?.data?.style || {},
      content: block?.data?.content || {},
    })),
  );
}

function BuilderConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[120] grid place-items-center bg-slate-900/28 p-5 backdrop-blur-[1px]">
      <div className="w-full max-w-[26.5rem] rounded-[18px] border border-slate-200/90 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.16)]">
        <h3 className="text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-slate-900">{title}</h3>
        <p className="mt-1.5 text-[13px] leading-[1.55] text-slate-600">{description}</p>
        <div className="mt-3.5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-[13px] font-medium text-slate-700 transition-all duration-150 hover:bg-slate-200 active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full border border-emerald-700 bg-emerald-600 px-4 py-1.5 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StorefrontBuilderWorkspace({
  accessToken,
  role,
  profile,
  brandKit,
  templateKey,
  onTemplateChange,
  blocks,
  onChange,
  onBrandKitChange,
  onResetTemplateColors,
  onResetTemplateDefaults,
  onMediaUpload,
  media,
  onInlineEditingChange,
  saving,
  saveState,
  deleteConfirm = null,
}) {
  const [activePanel, setActivePanel] = useState('layers');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [inlineDraft, setInlineDraft] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeDrag, setActiveDrag] = useState(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [canvasScale, setCanvasScale] = useState(1);
  const [frameHeight, setFrameHeight] = useState(720);
  const [viewportWidth, setViewportWidth] = useState(1400);
  const [confirmState, setConfirmState] = useState(null);

  const setInlineEditingDraft = (draft) => {
    setInlineDraft(draft);
    onInlineEditingChange?.(Boolean(draft));
  };

  useEffect(() => {
    setInlineDraft(null);
    onInlineEditingChange?.(false);
  }, [templateKey, onInlineEditingChange]);

  useEffect(() => () => {
    onInlineEditingChange?.(false);
  }, [onInlineEditingChange]);
  const stageRef = useRef(null);
  const frameContentRef = useRef(null);

  const { data: embedData } = useQuery({
    queryKey: ['embed-links'],
    enabled: Boolean(accessToken),
    queryFn: async () => apiClient({
      url: API_ENDPOINTS.embed.list,
      method: 'GET',
      token: accessToken,
    }),
  });
  const embeds = useMemo(() => {
    if (Array.isArray(embedData?.embeds)) return embedData.embeds;
    if (Array.isArray(embedData)) return embedData;
    if (Array.isArray(embedData?.data)) return embedData.data;
    return [];
  }, [embedData]);
  const embedToken = embeds[0]?.token || embeds[0]?.embed_token || '';
  const hasChatbot = Boolean(embedToken);

  const normalized = useMemo(() => {
    let next = normalizeBlocks(blocks);
    if (templateKey !== 'lawyer-classic') return next;

    next = next.filter(
      (block) => block.type !== STOREFRONT_BLOCK_TYPES.CLOSING_COST_ESTIMATOR,
    );
    if (!next.some((block) => block.type === STOREFRONT_BLOCK_TYPES.FAQ)) {
      const templateFaq = materializeTemplate(templateKey, profile, brandKit)?.blocks
        ?.find((block) => block.type === STOREFRONT_BLOCK_TYPES.FAQ);
      if (templateFaq) {
        const guidanceContent = next.find(
          (block) => block.type === STOREFRONT_BLOCK_TYPES.GUIDANCE,
        )?.data?.content || {};
        const templateFaqs = templateFaq.data?.content?.faqs || [];
        const guidanceFaqs = Array.isArray(guidanceContent.faqs)
          ? guidanceContent.faqs
          : [];
        const usesLegacyDefaultFaqs = guidanceFaqs.length === 4
          && templateFaqs.slice(0, 4).every(
            (item, index) => String(guidanceFaqs[index]?.q || '').trim() === item.q,
          );
        const migratedFaqs = usesLegacyDefaultFaqs
          ? [...guidanceFaqs, ...templateFaqs.slice(4)]
          : guidanceFaqs;
        const faqBlock = normalizeBlocks([{
          ...templateFaq,
          id: 'lawyer-classic-faq-restored',
          data: {
            ...(templateFaq.data || {}),
            content: {
              ...(templateFaq.data?.content || {}),
              ...(guidanceContent.faq_label ? { eyebrow: guidanceContent.faq_label } : {}),
              ...(guidanceContent.faq_heading ? { heading: guidanceContent.faq_heading } : {}),
              ...(migratedFaqs.length
                ? { faqs: migratedFaqs }
                : {}),
            },
          },
        }])[0];
        next = insertBlockAtTemplateRank(next, faqBlock, templateKey);
      }
    }
    return next;
  }, [blocks, templateKey, profile, brandKit]);

  useEffect(() => {
    if (templateKey !== 'lawyer-classic') return;
    const essentials = brandKit?.essentials || {};
    if (Number(essentials.lawyer_classic_brand_version || 0) >= 1) return;

    const defaults = getTemplateBrandDefaults(templateKey);
    if (!defaults) return;
    const normalizedColor = (value) => String(value || '').trim().toLowerCase();
    const legacyColors = {
      primary_color: new Set(['', '#0f766e']),
      accent_color: new Set(['', '#f59e0b']),
      page_background: new Set(['', '#ffffff']),
    };
    const updates = {
      essentials: {
        ...essentials,
        lawyer_classic_brand_version: 1,
      },
    };
    Object.entries(legacyColors).forEach(([key, values]) => {
      if (values.has(normalizedColor(brandKit?.[key]))) {
        updates[key] = defaults[key];
      }
    });
    if (!brandKit?.button_shape || brandKit.button_shape === 'rounded') {
      updates.button_shape = defaults.button_shape;
    }
    onBrandKitChange(updates);
  }, [brandKit, onBrandKitChange, templateKey]);

  const availableBlockTypes = useMemo(
    () => availableBlocksForRole(role, templateKey),
    [role, templateKey],
  );
  const libraryEntries = useMemo(() => {
    const existingByType = new Map();
    normalized.forEach((block) => {
      if (!existingByType.has(block.type)) existingByType.set(block.type, block.id);
    });
    const hasFeaturedListings = existingByType.has(STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS);
    const hasProperties = existingByType.has(STOREFRONT_BLOCK_TYPES.PROPERTIES);
    return availableBlockTypes.map((type) => {
      const existingId = existingByType.get(type) || null;
      const blocked = !existingId && (
        (hasFeaturedListings && type === STOREFRONT_BLOCK_TYPES.PROPERTIES)
        || (hasProperties && type === STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS)
      );
      return {
        type,
        existingId,
        status: existingId ? 'added' : blocked ? 'blocked' : 'available',
      };
    });
  }, [availableBlockTypes, normalized]);
  const addableBlockTypes = useMemo(
    () => libraryEntries.filter((entry) => entry.status === 'available').map((entry) => entry.type),
    [libraryEntries],
  );

  const canResetTemplateDefaults = useMemo(() => {
    const next = materializeTemplate(templateKey, profile, brandKit);
    if (!next) return false;

    const expectedBrandKit = {
      ...next.brand_kit,
      business_name: brandKit.business_name || next.brand_kit.business_name,
      logo_url: brandKit.logo_url || '',
      logo_dark_url: brandKit.logo_dark_url || '',
      cover_url: brandKit.cover_url || '',
      profile_photo_url: brandKit.profile_photo_url || '',
      logo_size: brandKit.logo_size,
      cover_position_x: brandKit.cover_position_x,
      cover_position_y: brandKit.cover_position_y,
      cover_zoom: brandKit.cover_zoom,
      profile_position_x: brandKit.profile_position_x,
      profile_position_y: brandKit.profile_position_y,
      profile_zoom: brandKit.profile_zoom,
      essentials: brandKit.essentials,
    };

    const currentBlocksSignature = blockLayoutStyleSignature(normalized);
    const expectedBlocksSignature = blockLayoutStyleSignature(next.blocks);
    if (currentBlocksSignature !== expectedBlocksSignature) return true;

    const brandKeysToCheck = [
      'primary_color',
      'accent_color',
      'page_background',
      'button_shape',
      'font',
      'image_style',
      'business_name',
      'logo_url',
      'logo_dark_url',
      'cover_url',
      'profile_photo_url',
      'logo_size',
      'cover_position_x',
      'cover_position_y',
      'cover_zoom',
      'profile_position_x',
      'profile_position_y',
      'profile_zoom',
      'essentials',
    ];

    return brandKeysToCheck.some((key) => {
      const currentValue = brandKit?.[key];
      const expectedValue = expectedBrandKit?.[key];
      if (key.includes('color') || key === 'page_background') {
        return normalizeHexForCompare(currentValue) !== normalizeHexForCompare(expectedValue);
      }
      if (key === 'essentials') {
        return JSON.stringify(currentValue || {}) !== JSON.stringify(expectedValue || {});
      }
      return (currentValue ?? '') !== (expectedValue ?? '');
    });
  }, [templateKey, profile, brandKit, normalized]);

  const materializeCollectionItems = (collection, content, blockType = '') => {
    // Respect an explicit array (including empty). Only fall back when the key is missing.
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
      return getGuidanceCollectionFallback(profile?.professional_type, collection);
    }

    if (collection === 'process_steps') {
      if (templateKey !== 'lawyer-classic') return [];
      return coerceCollectionItems('process_steps', LAWYER_CLASSIC_PROCESS_DEFAULTS);
    }

    if (collection === 'highlights' || collection === 'proof') {
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
  };

  const resolveCollectionForEdit = (collection, content, itemId, itemIndex, blockType = '') => {
    const items = materializeCollectionItems(collection, content, blockType);
    if (items.some((item) => item?.id === itemId)) return items;

    const indexFromAttr = Number.isInteger(itemIndex) ? itemIndex : Number(itemIndex);
    if (Number.isInteger(indexFromAttr) && items[indexFromAttr]) {
      return items.map((item, index) => (
        index === indexFromAttr ? { ...item, id: itemId || item.id } : item
      ));
    }

    const fallbackMatch = String(itemId || '').match(/^fallback-(step|faq|service|highlight|proof)-(\d+)$/);
    if (fallbackMatch) {
      const index = Number(fallbackMatch[2]);
      if (items[index]) {
        return items.map((item, itemIndexValue) => (
          itemIndexValue === index ? { ...item, id: itemId } : item
        ));
      }
    }

    return items.length ? items : null;
  };

  const selected = normalized.find((block) => block.id === selectedId) || null;
  const selectedItem = (() => {
    const resolved = resolveContentItem(selected?.data?.content, selectedElement);
    if (resolved) return resolved;
    if (selectedElement?.kind !== 'item' || !selectedElement?.collection) {
      return null;
    }
    const content = selected?.data?.content || {};
    const items = materializeCollectionItems(selectedElement.collection, content, selected?.type);
    if (selectedElement.itemId) {
      const index = items.findIndex((item) => item?.id === selectedElement.itemId);
      if (index >= 0) return { item: items[index], index };
    }
    if (selectedElement.itemIndex != null && items[Number(selectedElement.itemIndex)]) {
      const index = Number(selectedElement.itemIndex);
      return { item: items[index], index };
    }
    const fallbackMatch = String(selectedElement.itemId || '').match(/^fallback-(?:step|faq|service)-(\d+)$/);
    if (fallbackMatch) {
      const fallbackIndex = Number(fallbackMatch[1]);
      if (items[fallbackIndex]) return { item: { ...items[fallbackIndex], id: selectedElement.itemId }, index: fallbackIndex };
    }
    return null;
  })();
  const draftMatchesSelection = inlineDraft
    && inlineDraft.blockId === selectedElement?.blockId
    && inlineDraft.field === selectedElement?.field
    && inlineDraft.collection === selectedElement?.collection
    && (inlineDraft.itemId === selectedElement?.itemId
      || inlineDraft.itemIndex === selectedElement?.itemIndex);
  const inspectorSelection = selectedItem
    ? {
        ...selectedElement,
        item: draftMatchesSelection && inlineDraft.itemField
          ? { ...selectedItem.item, [inlineDraft.itemField]: inlineDraft.value }
          : selectedItem.item,
      }
    : {
        ...selectedElement,
        ...(draftMatchesSelection ? { inlineValue: inlineDraft.value } : {}),
      };
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const { setNodeRef: setCanvasRef, isOver: canvasIsOver } = useDroppable({ id: 'canvas-dropzone' });

  useEffect(() => {
    if (!selectedId && normalized[0]) setSelectedId(normalized[0].id);
  }, [normalized, selectedId]);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const updateScale = () => {
      const available = Math.max(stage.clientWidth - 32, 280);
      const target = PREVIEW_WIDTHS[previewMode] || PREVIEW_WIDTHS.desktop;
      setCanvasScale(Math.min(1, available / target));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [previewMode]);

  useLayoutEffect(() => {
    const node = frameContentRef.current;
    if (!node) return undefined;
    const updateHeight = () => {
      const next = node.scrollHeight || 720;
      setFrameHeight((current) => (current === next ? current : next));
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [normalized, previewMode]);

  const commit = (next) => {
    setHistory((current) => [...current.slice(-29), { blocks: normalized, brandKit }]);
    setFuture([]);
    onChange(next);
  };

  const commitBrandKit = (updates) => {
    setHistory((current) => [...current.slice(-29), { blocks: normalized, brandKit }]);
    setFuture([]);
    onBrandKitChange(updates);
  };

  const pushSnapshotThen = (action) => {
    if (!action) return false;
    const snapshot = { blocks: normalized, brandKit };
    const applied = action();
    if (applied === false) return false;
    setHistory((current) => [...current.slice(-29), snapshot]);
    setFuture([]);
    return true;
  };

  const requestTemplateApplyConfirm = (nextTemplateKey) => {
    const template = getStorefrontTemplate(nextTemplateKey);
    if (!template || templateKey === nextTemplateKey) return false;
    setConfirmState({
      kind: 'apply-template',
      templateKey: nextTemplateKey,
      title: `Apply "${template.label}"?`,
      description:
        'This replaces your page structure and section copy, and loads this template colors (primary, accent, page background). Brand media (logo, photos) is kept.',
      confirmLabel: 'Apply template',
    });
    return false;
  };

  const requestResetTemplateDefaultsConfirm = () => {
    const template = getStorefrontTemplate(templateKey);
    if (!template) return false;
    setConfirmState({
      kind: 'reset-template-defaults',
      title: `Reset "${template.label}" to original layout and colors?`,
      description:
        'This restores sections, styles, card colors, and default section copy. Business name and brand media are kept.',
      confirmLabel: 'Reset to defaults',
    });
    return false;
  };

  const confirmPendingAction = () => {
    if (!confirmState) return;
    const pending = confirmState;
    setConfirmState(null);
    if (pending.kind === 'apply-template') {
      pushSnapshotThen(() => onTemplateChange(pending.templateKey));
      return;
    }
    if (pending.kind === 'reset-template-defaults') {
      pushSnapshotThen(onResetTemplateDefaults);
    }
  };

  const restoreSnapshot = (snapshot) => {
    if (!snapshot) return;
    // Legacy history entries were block arrays only.
    if (Array.isArray(snapshot)) {
      onChange(snapshot);
      return;
    }
    if (snapshot.blocks) onChange(snapshot.blocks);
    if (snapshot.brandKit) onBrandKitChange(snapshot.brandKit);
  };

  const updateBlock = (id, patch) => {
    commit(normalized.map((block) => (
      block.id === id
        ? {
            ...block,
            data: {
              ...block.data,
              ...patch,
              content: { ...block.data.content, ...(patch.content || {}) },
              layout: { ...block.data.layout, ...(patch.layout || {}) },
              style: { ...block.data.style, ...(patch.style || {}) },
            },
          }
        : block
    )));
  };

  const updateSelectedItem = (patch) => {
    if (!selectedElement?.collection || !selected || !(selectedElement.itemId || selectedElement.itemIndex != null)) {
      return;
    }
    const collection = selectedElement.collection;
    const content = selected.data?.content || {};
    const existingItems = Array.isArray(content[collection]) ? content[collection] : [];
    const hasTarget = selectedElement.itemId
      && existingItems.some((item) => item?.id === selectedElement.itemId);

    let nextContent = content;
    let nextSelection = selectedElement;
    if (!hasTarget) {
      const resolvedItems = resolveCollectionForEdit(
        collection,
        content,
        selectedElement.itemId,
        selectedElement.itemIndex,
        selected.type,
      );
      if (!resolvedItems?.length) return;

      let targetIndex = resolvedItems.findIndex((item) => item?.id === selectedElement.itemId);
      if (targetIndex < 0 && selectedElement.itemIndex != null) {
        targetIndex = Number(selectedElement.itemIndex);
      }
      if (targetIndex < 0 || !resolvedItems[targetIndex]) return;

      const targetId = resolvedItems[targetIndex].id || selectedElement.itemId || createContentItemId();
      const materialized = resolvedItems.map((item, index) => (
        index === targetIndex ? { ...item, id: targetId } : item
      ));
      nextContent = { ...content, [collection]: materialized };
      nextSelection = { ...selectedElement, itemId: targetId };
      if (nextSelection.itemId !== selectedElement.itemId) {
        setSelectedElement(nextSelection);
      }
    }

    updateBlock(selectedElement.blockId, {
      content: updateContentItem(nextContent, nextSelection, patch),
    });
  };

  const updateInlineContent = ({
    blockId,
    field,
    collection,
    itemId,
    itemIndex,
    itemField,
    instance,
    value,
  }) => {
    const block = normalized.find((candidate) => candidate.id === blockId);
    if (!block || !field?.startsWith('content.')) return;
    const content = block.data?.content || {};

    if (!collection) {
      const contentKey = field.slice('content.'.length);
      const instanceIndex = Number(instance);
      if (
        contentKey === 'body'
        && instance !== undefined
        && Number.isInteger(instanceIndex)
        && instanceIndex >= 0
      ) {
        const paragraphs = String(content.body || '')
          .split('\n')
          .map((paragraph) => paragraph.trim())
          .filter(Boolean);
        if (paragraphs[instanceIndex] !== undefined) {
          paragraphs[instanceIndex] = value;
          updateBlock(blockId, { content: { body: paragraphs.join('\n') } });
          setInlineEditingDraft(null);
          return;
        }
      }
      updateBlock(blockId, { content: { [contentKey]: value } });
      setInlineEditingDraft(null);
      return;
    }

    const resolvedItems = resolveCollectionForEdit(
      collection,
      content,
      itemId,
      itemIndex,
      block.type,
    );
    if (!resolvedItems?.length) return;
    const targetIndex = resolvedItems.findIndex((item) => item?.id === itemId);
    const index = targetIndex >= 0 ? targetIndex : Number(itemIndex);
    if (!Number.isInteger(index) || !resolvedItems[index]) return;
    const resolvedItemId = resolvedItems[index].id || itemId || createContentItemId();
    const materializedItems = resolvedItems.map((item, currentIndex) => (
      currentIndex === index ? { ...item, id: resolvedItemId } : item
    ));
    const nextContent = { ...content, [collection]: materializedItems };
    updateBlock(blockId, {
      content: updateContentItem(nextContent, {
        collection,
        itemId: resolvedItemId,
      }, {
        [itemField || 'text']: value,
      }),
    });
    setInlineEditingDraft(null);
  };

  const removeSelectedItem = () => {
    if (!selectedElement?.collection || !selected || !(selectedElement.itemId || selectedElement.itemIndex != null)) {
      return;
    }
    const collection = selectedElement.collection;
    const content = selected.data?.content || {};
    const existingItems = Array.isArray(content[collection]) ? content[collection] : [];
    const hasTarget = selectedElement.itemId
      && existingItems.some((item) => item?.id === selectedElement.itemId);
    const resolvedItems = hasTarget
      ? existingItems
      : resolveCollectionForEdit(
        collection,
        content,
        selectedElement.itemId,
        selectedElement.itemIndex,
        selected.type,
      );
    if (!resolvedItems?.length) return;
    const nextContent = { ...content, [collection]: resolvedItems };
    const selectionForDelete = selectedElement.itemId
      && resolvedItems.some((item) => item?.id === selectedElement.itemId)
      ? selectedElement
      : {
          ...selectedElement,
          itemId: resolvedItems[Number(selectedElement.itemIndex) || 0]?.id,
        };
    const result = removeContentItem(nextContent, selectionForDelete);
    updateBlock(selectedElement.blockId, { content: result.content });
    setSelectedElement(result.nextItemId
      ? { ...selectedElement, itemId: result.nextItemId }
      : { blockId: selectedElement.blockId, kind: 'block' });
  };

  const addSelectedItem = (item) => {
    if (!selectedElement?.collection || !selectedElement?.blockId) return;
    const collection = selectedElement.collection;
    const nextItem = {
      id: createContentItemId(),
      ...item,
    };
    const content = selected?.data?.content || {};
    const currentItems = Array.isArray(content[collection]) && content[collection].length
      ? (
          collection === 'steps' || collection === 'faqs' || collection === 'highlights' || collection === 'proof'
            ? coerceCollectionItems(collection, content[collection])
            : content[collection]
        )
      : materializeCollectionItems(collection, content, selected?.type);
    const nextItems = [...currentItems, nextItem];
    const fieldLabel = collection === 'faqs'
      ? `FAQ ${nextItems.length}`
      : collection === 'steps'
        ? `Step ${nextItems.length}`
        : collection === 'highlights'
          ? `Highlight ${nextItems.length}`
          : collection === 'proof'
            ? `Proof ${nextItems.length}`
            : selected?.type === STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY
              ? `Story card ${nextItems.length}`
              : `Service ${nextItems.length}`;
    updateBlock(selectedElement.blockId, {
      content: {
        ...content,
        [collection]: nextItems,
      },
    });
    setSelectedElement({
      ...selectedElement,
      kind: 'item',
      itemId: nextItem.id,
      itemIndex: nextItems.length - 1,
      itemField: collection === 'faqs' || collection === 'proof' ? (collection === 'proof' ? 'text' : 'q') : 'title',
      label: fieldLabel,
    });
  };

  const removeBlock = (id) => {
    const target = normalized.find((block) => block.id === id);
    if (!target || isProtectedBlockType(target.type)) return;
    const next = normalized.filter((block) => block.id !== id);
    commit(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id || null);
      setSelectedElement(null);
      if (!next[0]) setInspectorOpen(false);
    }
  };

  const duplicateBlock = (id) => {
    const index = normalized.findIndex((block) => block.id === id);
    if (index < 0) return;
    const original = normalized[index];
    if (isSingletonBlockType(original.type, templateKey)) return;
    const copy = {
      ...createBlock(original.type),
      data: {
        ...structuredClone(original.data),
        content: rekeyContentItems(structuredClone(original.data.content)),
      },
    };
    const next = [...normalized];
    next.splice(index + 1, 0, copy);
    commit(next);
    setSelectedId(copy.id);
    setSelectedElement({ blockId: copy.id, kind: 'block' });
    setInspectorOpen(true);
  };

  const createBlockForTemplate = (type) => {
    const created = createBlock(type);
    const templateBlock = materializeTemplate(templateKey, profile, brandKit)?.blocks
      ?.find((block) => block.type === type);
    if (!templateBlock) return created;
    return {
      ...templateBlock,
      id: created.id,
      data: {
        ...templateBlock.data,
        enabled: true,
      },
    };
  };

  const addBlock = (type) => {
    const existing = normalized.find((block) => block.type === type);
    if (existing) {
      setSelectedId(existing.id);
      setSelectedElement({ blockId: existing.id, kind: 'block' });
      setInspectorOpen(true);
      setActivePanel('layers');
      return;
    }
    const block = createBlockForTemplate(type);
    const next = insertBlockAtTemplateRank(normalized, block, templateKey);
    commit(next);
    setSelectedId(block.id);
    setSelectedElement({ blockId: block.id, kind: 'block' });
    setInspectorOpen(true);
    setActivePanel('layers');
  };

  const selectBlock = (id) => {
    setSelectedId(id);
    setSelectedElement({ blockId: id, kind: 'block' });
    setInspectorOpen(true);
  };

  const selectElement = (selection) => {
    if (!selection?.blockId) return;
    setSelectedId(selection.blockId);
    setInspectorOpen(true);

    if (selection.kind === 'item' && selection.collection) {
      const block = normalized.find((item) => item.id === selection.blockId);
      const content = block?.data?.content || {};
      const rawItems = Array.isArray(content[selection.collection]) ? content[selection.collection] : null;
      const hasStringItems = Array.isArray(rawItems)
        && rawItems.some((item) => typeof item === 'string');

      let nextSelection = {
        ...selection,
        itemIndex: selection.itemIndex != null ? Number(selection.itemIndex) : selection.itemIndex,
      };

      // Only convert legacy pipe-strings → objects. Never refill deleted/empty lists.
      if (hasStringItems) {
        const syncedItems = coerceCollectionItems(selection.collection, rawItems);
        let targetIndex = syncedItems.findIndex((item) => item?.id === selection.itemId);
        if (targetIndex < 0 && nextSelection.itemIndex != null) {
          targetIndex = Number(nextSelection.itemIndex);
        }
        if (targetIndex >= 0 && syncedItems[targetIndex]) {
          nextSelection = {
            ...nextSelection,
            itemId: syncedItems[targetIndex].id,
            itemIndex: targetIndex,
          };
        }
        updateBlock(selection.blockId, {
          content: { [selection.collection]: syncedItems },
        });
      } else if (Array.isArray(rawItems) && rawItems.length) {
        let targetIndex = rawItems.findIndex((item) => item?.id === selection.itemId);
        if (targetIndex < 0 && nextSelection.itemIndex != null) {
          targetIndex = Number(nextSelection.itemIndex);
        }
        if (targetIndex >= 0 && rawItems[targetIndex]?.id) {
          nextSelection = {
            ...nextSelection,
            itemId: rawItems[targetIndex].id,
            itemIndex: targetIndex,
          };
        }
      }

      setSelectedElement(nextSelection);
      return;
    }

    setSelectedElement(selection);
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((items) => [{ blocks: normalized, brandKit }, ...items].slice(0, 30));
    setHistory((items) => items.slice(0, -1));
    restoreSnapshot(previous);
  };

  const redo = () => {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [...items, { blocks: normalized, brandKit }].slice(-30));
    setFuture((items) => items.slice(1));
    restoreSnapshot(next);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveDrag(null);
    if (!over) return;
    if (active.data.current?.fromLibrary) {
      const type = active.data.current.type;
      const existing = normalized.find((block) => block.type === type);
      if (existing) {
        setSelectedId(existing.id);
        setInspectorOpen(true);
        setActivePanel('layers');
        return;
      }
      const block = createBlockForTemplate(type);
      const index = normalized.findIndex((item) => item.id === over.id);
      const next = templateKey === 'lawyer-classic'
        ? insertBlockAtTemplateRank(normalized, block, templateKey)
        : [...normalized];
      if (templateKey !== 'lawyer-classic') {
        if (index >= 0) next.splice(index, 0, block);
        else {
          const footerIndex = next.findIndex((item) => item.type === 'footer');
          next.splice(footerIndex >= 0 ? footerIndex : next.length, 0, block);
        }
      }
      commit(next);
      setSelectedId(block.id);
      setSelectedElement({ blockId: block.id, kind: 'block' });
      setInspectorOpen(true);
      setActivePanel('layers');
      return;
    }
    if (active.id === over.id) return;
    const oldIndex = normalized.findIndex((block) => block.id === active.id);
    const newIndex = normalized.findIndex((block) => block.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) commit(arrayMove(normalized, oldIndex, newIndex));
  };

  const showChatbot = brandKit?.show_chatbot !== false;

  const previewProfile = useMemo(() => ({
    ...profile,
    professional_name: profile?.professional_name,
    storefront_template_key: templateKey,
    embed_token: embedToken || profile?.embed_token,
    storefront_builder_access_token: accessToken,
    storefront_builder_selection: selectedElement,
    storefront_logo_url: brandKit.logo_url || profile?.storefront_logo_url,
    storefront_logo_size: Number(brandKit.logo_size) || profile?.storefront_logo_size || 40,
    cover_photo_url: media?.cover || brandKit.cover_url || profile?.cover_photo_url || profile?.cover_image,
    profile_photo_url: media?.profile || brandKit.profile_photo_url || profile?.profile_photo_url,
    storefront_profile_fallback_url: profile?.profile_photo_url || '',
    storefront_cover_position: {
      x: Number(brandKit.cover_position_x ?? 50),
      y: Number(brandKit.cover_position_y ?? 50),
    },
    storefront_cover_zoom: Math.max(1, Number(brandKit.cover_zoom ?? 1)),
    storefront_profile_position: {
      x: Number(brandKit.profile_position_x ?? 50),
      y: Number(brandKit.profile_position_y ?? 25),
    },
    storefront_profile_zoom: Number(brandKit.profile_zoom ?? 1),
    storefront_essentials: brandKit.essentials || {},
    storefront_brand_kit: brandKit,
    brand_kit: brandKit,
    storefront_theme: {
      primary: brandKit.primary_color,
      accent: brandKit.accent_color,
      canvas: brandKit.page_background || '#ffffff',
      fontFamily: brandKit.font || 'Manrope',
      radius: brandKit.button_shape === 'pill' ? '999px' : brandKit.button_shape === 'square' ? '2px' : '0.75rem',
    },
  }), [
    profile,
    templateKey,
    brandKit,
    embedToken,
    accessToken,
    media?.cover,
    media?.profile,
    selectedElement,
  ]);

  const rendererBlocks = useMemo(() => toRendererBlocks(normalized), [normalized]);

  const frameWidth = PREVIEW_WIDTHS[previewMode];
  const showInspectorColumn = viewportWidth >= 1200;
  const gridTemplateColumns = showInspectorColumn
    ? '52px 280px minmax(0, 1fr) 300px'
    : '52px 260px minmax(0, 1fr)';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveDrag(active)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      <div
        className="relative h-[calc(100dvh-4rem)] min-h-[36rem] overflow-hidden bg-[#e8edf3]"
        style={{ display: 'grid', gridTemplateColumns }}
      >
        <nav className="flex flex-col items-center gap-2 bg-white py-3">
          {PANELS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActivePanel(id)}
              className={`flex w-11 flex-col items-center gap-1 rounded-xl py-2.5 transition ${
                activePanel === id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title={label}
            >
              <Icon size={18} />
              <span className="text-[8px] font-semibold tracking-wide">{label}</span>
            </button>
          ))}
          <div className="mt-auto flex flex-col gap-1.5 pb-1">
            <button type="button" onClick={undo} disabled={!history.length} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25" title="Undo"><Undo2 size={16} /></button>
            <button type="button" onClick={redo} disabled={!future.length} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25" title="Redo"><Redo2 size={16} /></button>
          </div>
        </nav>

        <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white">
          {activePanel === 'layers' ? (
            <div className="px-3 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-[13px] font-bold text-slate-900">Page structure</h2>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500" data-builder-version="v3-inline-grid">Drag to reorder. Click a layer to edit copy, layout, and style.</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Layers</p>
                  <span className="text-[10px] font-medium text-slate-400">{normalized.length}</span>
                </div>
                <SortableContext items={normalized.map((block) => block.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    {normalized.map((block, index) => (
                      <SortableLayer
                        key={block.id}
                        block={block}
                        index={index}
                        selected={block.id === selected?.id}
                        onSelect={() => selectBlock(block.id)}
                        onToggle={() => updateBlock(block.id, { enabled: !block.data.enabled })}
                        onDelete={isProtectedBlockType(block.type) ? null : () => removeBlock(block.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
                {hasChatbot ? (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Overlays</p>
                    <ChatBubbleLayer
                      enabled={brandKit?.show_chatbot !== false}
                      onToggle={() => commitBrandKit({ show_chatbot: brandKit?.show_chatbot === false })}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : activePanel === 'add' ? (
            <div className="flex min-h-full flex-col">
              <div className="flex items-center justify-between gap-3 px-3 py-3">
                <div>
                  <h2 className="text-[13px] font-bold text-slate-900">Add sections</h2>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">Click or drag into the page.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                  {addableBlockTypes.length}
                </span>
              </div>
              {libraryEntries.length ? (
                <div className="border-t border-slate-100">
                  {libraryEntries.map((entry) => (
                    <LibraryBlock
                      key={entry.type}
                      type={entry.type}
                      status={entry.status}
                      onClick={() => {
                        if (entry.status === 'added' && entry.existingId) {
                          selectBlock(entry.existingId);
                          setActivePanel('layers');
                          return;
                        }
                        if (entry.status === 'available') addBlock(entry.type);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 border-t border-slate-100 px-3 py-8 text-center">
                  <p className="text-[11px] leading-4 text-slate-500">No extra sections are available for this template.</p>
                  <button
                    type="button"
                    onClick={() => setActivePanel('layers')}
                    className="text-[10px] font-semibold text-slate-700 underline-offset-2 hover:underline"
                  >
                    View layers
                  </button>
                </div>
              )}
            </div>
          ) : (
            <PageSettings
              role={role}
              templateKey={templateKey}
              onTemplateChange={requestTemplateApplyConfirm}
              brandKit={brandKit}
              onChange={commitBrandKit}
              onResetTemplateColors={() => pushSnapshotThen(onResetTemplateColors)}
              onResetTemplateDefaults={requestResetTemplateDefaultsConfirm}
              canResetTemplateDefaults={canResetTemplateDefaults}
              onUndo={undo}
              onRedo={redo}
              canUndo={history.length > 0}
              canRedo={future.length > 0}
              onMediaUpload={onMediaUpload}
              media={media}
            />
          )}
        </aside>

        <main
          data-storefront-preview-shell
          className="relative flex min-h-0 min-w-0 flex-col overflow-hidden"
        >
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/70 bg-[#e8edf3]/95 px-3 py-1.5 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
                {[{ id: 'desktop', Icon: Monitor, label: 'Desktop' }, { id: 'tablet', Icon: Tablet, label: 'Tablet' }, { id: 'mobile', Icon: Smartphone, label: 'Mobile' }].map(({ id, Icon, label }) => (
                  <button key={id} type="button" title={label} onClick={() => setPreviewMode(id)} className={`grid h-7 w-8 place-items-center rounded-md transition ${previewMode === id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                    <Icon size={13} />
                  </button>
                ))}
              </div>
              <span className="hidden text-[10px] font-medium text-slate-500 sm:inline">{Math.round(canvasScale * 100)}% · {previewMode}</span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${saving ? 'bg-amber-50 text-amber-700' : saveState === 'saved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {saving ? 'Saving…' : saveState === 'saved' ? 'Draft saved' : 'Unsaved'}
            </span>
          </div>

          <div ref={stageRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex justify-center px-4 py-4">
              <div
                ref={setCanvasRef}
                className={`origin-top overflow-hidden shadow-[0_25px_80px_rgba(15,23,42,0.18)] ring-1 transition-shadow ${canvasIsOver ? 'ring-2 ring-emerald-500' : 'ring-black/5'} ${previewMode === 'mobile' ? 'rounded-[1.75rem]' : 'rounded-xl'}`}
                style={{
                  width: frameWidth * canvasScale,
                  height: Math.max(frameHeight * canvasScale, 320),
                  backgroundColor: brandKit.page_background || '#ffffff',
                }}
              >
                <div
                  ref={frameContentRef}
                  className="relative"
                  style={{ width: frameWidth, transform: `scale(${canvasScale})`, transformOrigin: 'top left' }}
                >
                  <StorefrontBlockRenderer
                    profile={previewProfile}
                    blocks={rendererBlocks}
                    templateKey={templateKey}
                    theme={previewProfile.storefront_theme}
                    previewMode={previewMode}
                    scrollRootRef={stageRef}
                    actions={{}}
                    preview
                    selectedBlockId={selected?.id}
                    onBlockSelect={selectBlock}
                    selectedElement={selectedElement}
                    onElementSelect={selectElement}
                    onInlineContentInput={setInlineEditingDraft}
                    onInlineContentChange={updateInlineContent}
                  />
                </div>
              </div>
            </div>
          </div>

          {hasChatbot ? (
            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 top-10 z-20 ${
                showChatbot ? '' : 'invisible'
              }`}
              aria-hidden={!showChatbot}
            >
              <PublicChatBubble
                profile={{ ...previewProfile, storefront_show_chatbot: true }}
                inline
                interactive={false}
              />
            </div>
          ) : null}

          <DeleteLeadConfirmModal
            open={Boolean(deleteConfirm?.open)}
            onCancel={deleteConfirm?.onCancel}
            onConfirm={deleteConfirm?.onConfirm}
            isPending={Boolean(deleteConfirm?.isPending)}
            contained
            title="Delete web page?"
            confirmLabel="Delete web page"
            pendingLabel="Deleting web page..."
            description="This will delete your public webpage and remove related profile analytics history. This action cannot be undone. You can create a new webpage later."
          />
        </main>

        {showInspectorColumn ? (
          <aside className="min-h-0 overflow-y-auto border-l border-slate-200 bg-white">
            <div className="p-4">
              <Inspector
                block={selected}
                selection={inspectorSelection}
                profile={profile}
                onChange={updateBlock}
                onItemChange={updateSelectedItem}
                onItemDelete={removeSelectedItem}
                onItemAdd={addSelectedItem}
                onDelete={removeBlock}
                onDuplicate={duplicateBlock}
                media={media}
                onMediaUpload={onMediaUpload}
                brandKit={brandKit}
                onBrandKitChange={onBrandKitChange}
                templateKey={templateKey}
              />
            </div>
          </aside>
        ) : null}

        {!showInspectorColumn && inspectorOpen ? (
          <aside className="absolute inset-y-0 right-0 z-40 w-[min(22rem,calc(100vw-3.5rem))] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Block editor</p>
              <button type="button" onClick={() => setInspectorOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500" aria-label="Close editor"><X size={15} /></button>
            </div>
            <div className="p-4">
              <Inspector
                block={selected}
                selection={inspectorSelection}
                profile={profile}
                onChange={updateBlock}
                onItemChange={updateSelectedItem}
                onItemDelete={removeSelectedItem}
                onItemAdd={addSelectedItem}
                onDelete={(id) => { removeBlock(id); setInspectorOpen(false); }}
                onDuplicate={duplicateBlock}
                media={media}
                onMediaUpload={onMediaUpload}
                brandKit={brandKit}
                onBrandKitChange={onBrandKitChange}
                templateKey={templateKey}
              />
            </div>
          </aside>
        ) : null}
        <BuilderConfirmModal
          open={Boolean(confirmState)}
          title={confirmState?.title || ''}
          description={confirmState?.description || ''}
          confirmLabel={confirmState?.confirmLabel || 'Confirm'}
          onCancel={() => setConfirmState(null)}
          onConfirm={confirmPendingAction}
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xl">
            {labelForBlock(activeDrag.data.current?.type || normalized.find((block) => block.id === activeDrag.id)?.type)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
