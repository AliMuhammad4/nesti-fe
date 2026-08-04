'use client';

import { useEffect, useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';
import { coerceCollectionItems, createContentItemId, labelForBlock, SECTION_SETTINGS } from './storefrontBuilderState';
import { CONTENT_COLLECTIONS } from './builderContentCollections';
import { getGuidanceCollectionFallback, getGuidanceTextDefaults } from '@/components/public-profile/PublicGuidanceSection';
import { getRoleDetailsCollectionFallback, getRoleDetailsDefaults } from '@/components/public-profile/PublicRoleDetailSection';
import { listingCardThemeFromTemplate } from '../templates';
import {
  getServiceIconEntry,
  resolveServiceIconKey,
  SERVICE_ICON_DEFAULTS,
  ServiceIconDropdown,
} from './storefrontServiceIcons';
import {
  BuilderSelect,
  ColorField,
  Field,
  ImageAdjustmentControls,
  MediaPicker,
  iconButton,
  inputClass,
} from './builderUiPrimitives';

export default function Inspector({
  block,
  selection,
  profile,
  onChange,
  onItemChange,
  onItemDelete,
  onItemAdd,
  onDelete,
  onDuplicate,
  media,
  onMediaUpload,
  brandKit,
  onBrandKitChange,
  templateKey,
}) {
  const [tab, setTab] = useState('content');
  const [collectionDraft, setCollectionDraft] = useState('');
  const isElementSelection = Boolean(selection?.kind && selection.kind !== 'block');
  const selectedField = selection?.field || '';
  const selectedSource = selection?.source || '';
  const isItemSelection = selection?.kind === 'item';
  const isProfileSelection = selectedSource === 'profile' && !isItemSelection;
  const isHero = block?.type === STOREFRONT_BLOCK_TYPES.HERO;
  const isThemeDrivenAgentHero = isHero
    && String(templateKey || '').startsWith('agent-')
    && templateKey !== 'agent-investor';
  // Realtor Classic uses only the cover image in its Hero.
  const heroUsesProfilePhoto = templateKey !== 'agent-classic';
  const allowHeroContentTabForSelection = isHero
    && isProfileSelection
    && ['brandKit.cover_url', 'brandKit.logo_url', ...(heroUsesProfilePhoto ? ['brandKit.profile_photo_url'] : [])].includes(selectedField);
  useEffect(() => {
    setCollectionDraft('');
  }, [block?.id]);
  useEffect(() => {
    if (isElementSelection && tab === 'content' && !allowHeroContentTabForSelection) setTab('layout');
  }, [isElementSelection, tab, allowHeroContentTabForSelection]);
  if (!block) {
    return (
      <div className="grid h-48 place-items-center px-4 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-700">No block selected</p>
          <p className="mt-1 text-xs text-slate-400">Click a layer or a section in the preview to edit it.</p>
        </div>
      </div>
    );
  }

  const { content, layout, style } = block.data;
  const selectedItemField = selection?.itemField || '';
  const availableTabs = (isElementSelection && !allowHeroContentTabForSelection)
    ? ['layout', 'style']
    : ['content', 'layout', 'style'];
  const showSectionDesignTabs = !isItemSelection;
  const supportsColumns = [
    STOREFRONT_BLOCK_TYPES.SERVICES,
    STOREFRONT_BLOCK_TYPES.TESTIMONIALS,
    STOREFRONT_BLOCK_TYPES.PROPERTIES,
    STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
    STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
    STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS,
    STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS,
    STOREFRONT_BLOCK_TYPES.CREDENTIALS,
    STOREFRONT_BLOCK_TYPES.ROLE_DETAILS,
  ].includes(block.type);
  const collection = isHero ? null : CONTENT_COLLECTIONS[block.type];
  const listToText = (value) => (Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean).join('\n') : '');
  const textToList = (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean);
  const tupleArrayToText = (items = [], keys = []) => (items || [])
    .map((item) => keys.map((key) => (item?.[key] ? String(item[key]).trim() : '')).filter(Boolean).join(' | '))
    .filter(Boolean)
    .join('\n');
  const textToTupleArray = (raw, keys = []) => raw.split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const values = line.split('|').map((part) => part.trim());
      return keys.reduce((acc, key, index) => ({ ...acc, [key]: values[index] || '' }), {});
    })
    .filter((item) => Object.values(item).some(Boolean));
  const name = profile?.professional_name || 'your name';
  const isServices = block.type === STOREFRONT_BLOCK_TYPES.SERVICES;
  const isGuidance = block.type === STOREFRONT_BLOCK_TYPES.GUIDANCE;
  const isRoleDetails = block.type === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS;
  const isListings = [
    STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS,
    STOREFRONT_BLOCK_TYPES.TOP_LISTINGS,
    STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS,
    STOREFRONT_BLOCK_TYPES.PROPERTIES,
  ].includes(block.type);
  const PROCESS_CARD_FIELDS = new Set([
    'content.process_card_background',
    'content.process_card_text_color',
    'content.process_label',
    'content.process_heading',
    'content.proof_chat',
    'content.proof_handoff',
  ]);
  const FAQ_CARD_FIELDS = new Set([
    'content.faq_card_background',
    'content.faq_card_text_color',
    'content.faq_label',
    'content.faq_heading',
    'content.faq_footer_title',
    'content.faq_footer_body',
  ]);
  const SERVICES_CARD_STYLE_FIELDS = new Set([
    'content.icon_background',
    'content.icon_color',
  ]);
  const isProcessCardContext = Boolean(
    isGuidance && (selection?.collection === 'steps' || PROCESS_CARD_FIELDS.has(selectedField)),
  );
  const isFaqCardContext = Boolean(
    isGuidance && (selection?.collection === 'faqs' || FAQ_CARD_FIELDS.has(selectedField)),
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
  const rolePanelControls = (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Panel appearance</p>
        <p className="mt-1 text-[10px] leading-4 text-slate-500">
          Optional override for the Role Details card surface. Leave empty to use template surface colors.
        </p>
      </div>
      <ColorField
        label="Panel background"
        value={content.panel_background || ''}
        onChange={(panel_background) => onChange(block.id, { content: { panel_background } })}
      />
      <ColorField
        label="Panel text"
        value={content.panel_text_color || ''}
        onChange={(panel_text_color) => onChange(block.id, { content: { panel_text_color } })}
      />
      {(content.panel_background || content.panel_text_color) ? (
        <button
          type="button"
          onClick={clearRolePanelStyles}
          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Reset panel to template
        </button>
      ) : null}
    </div>
  );
  const processCardControls = (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Card appearance</p>
        <p className="mt-1 text-[10px] leading-4 text-slate-500">
          Optional override. Leave empty to inherit brand + section colors. Step numbers use your brand primary.
        </p>
      </div>
      <ColorField
        label="Card background"
        value={content.process_card_background || ''}
        onChange={(process_card_background) => onChange(block.id, { content: { process_card_background } })}
      />
      <ColorField
        label="Card text"
        value={content.process_card_text_color || ''}
        onChange={(process_card_text_color) => onChange(block.id, { content: { process_card_text_color } })}
      />
      {(content.process_card_background || content.process_card_text_color || content.process_badge_background || content.process_badge_color) ? (
        <button
          type="button"
          onClick={() => clearGuidanceCardStyles('process')}
          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Reset to brand defaults
        </button>
      ) : null}
    </div>
  );
  const faqCardControls = (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Card appearance</p>
        <p className="mt-1 text-[10px] leading-4 text-slate-500">
          Optional override. Leave empty to inherit brand + section colors.
        </p>
      </div>
      <ColorField
        label="Card background"
        value={content.faq_card_background || ''}
        onChange={(faq_card_background) => onChange(block.id, { content: { faq_card_background } })}
      />
      <ColorField
        label="Card text"
        value={content.faq_card_text_color || ''}
        onChange={(faq_card_text_color) => onChange(block.id, { content: { faq_card_text_color } })}
      />
      {(content.faq_card_background || content.faq_card_text_color) ? (
        <button
          type="button"
          onClick={() => clearGuidanceCardStyles('faq')}
          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Reset to brand defaults
        </button>
      ) : null}
    </div>
  );
  const servicesIconControls = (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Icon appearance</p>
        <p className="mt-1 text-[10px] leading-4 text-slate-500">
          Shared default icon colors for service cards. Card-level icon colors can override these.
        </p>
      </div>
      <ColorField
        label="Icon background"
        value={content.icon_background || ''}
        onChange={(icon_background) => onChange(block.id, { content: { icon_background } })}
      />
      <ColorField
        label="Icon color"
        value={content.icon_color || ''}
        onChange={(icon_color) => onChange(block.id, { content: { icon_color } })}
      />
      {(content.icon_background || content.icon_color) ? (
        <button
          type="button"
          onClick={clearServicesIconStyles}
          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Reset icon colors
        </button>
      ) : null}
    </div>
  );
  const supplementalService = {
    agent: {
      title: 'Portfolio Growth Strategy',
      description: 'Build a practical acquisition and diversification plan around your long-term property goals.',
    },
    mortgage_broker: {
      title: 'Financing Strategy Review',
      description: 'Review borrowing options and structure a financing path aligned with your next property goal.',
    },
    lawyer: {
      title: 'Property Advisory',
      description: 'Get clear legal guidance for complex property decisions before moving forward.',
    },
  };
  const profileServiceCards = (profile?.services || [])
    .map((item, index) => ({
      id: item?.id || `fallback-service-${index}`,
      title: item?.title || item?.name || '',
      description: item?.description || item?.text || '',
      icon: item?.icon || SERVICE_ICON_DEFAULTS[index % SERVICE_ICON_DEFAULTS.length],
      background: item?.background || '',
      text_color: item?.text_color || '',
      icon_background: item?.icon_background || '',
      icon_color: item?.icon_color || '',
    }))
    .filter((item) => item.title)
    .slice(0, 6);
  if (isServices && profileServiceCards.length === 5) {
    profileServiceCards.push({
      ...(supplementalService[profile?.professional_type] || supplementalService.agent),
      id: 'fallback-service-5',
      icon: 'shield',
      background: '',
      text_color: '',
    });
  }
  const serviceCards = Array.isArray(content.items) && content.items.length
    ? content.items
    : profileServiceCards;
  const commitServiceCards = (next) => {
    const normalized = next.slice(0, 6).map((item) => ({
      id: item?.id || createContentItemId(),
      title: item?.title || '',
      description: item?.description || '',
      icon: item?.icon || 'target',
      background: item?.background || '',
      text_color: item?.text_color || '',
      icon_background: item?.icon_background || '',
      icon_color: item?.icon_color || '',
    }));
    onChange(block.id, { content: { items: normalized } });
  };
  const guidanceSteps = Array.isArray(content.steps) && content.steps.length
    ? coerceCollectionItems('steps', content.steps)
    : getGuidanceCollectionFallback(profile?.professional_type, 'steps');
  const guidanceFaqs = Array.isArray(content.faqs) && content.faqs.length
    ? coerceCollectionItems('faqs', content.faqs)
    : getGuidanceCollectionFallback(profile?.professional_type, 'faqs');
  const commitGuidanceSteps = (next) => {
    onChange(block.id, {
      content: {
        steps: next.slice(0, 8).map((item) => ({
          id: item?.id || createContentItemId(),
          title: item?.title || '',
          text: item?.text || '',
        })),
      },
    });
  };
  const commitGuidanceFaqs = (next) => {
    onChange(block.id, {
      content: {
        faqs: next.slice(0, 8).map((item) => ({
          id: item?.id || createContentItemId(),
          q: item?.q || '',
          a: item?.a || '',
        })),
      },
    });
  };
  const roleDefaults = isRoleDetails
    ? getRoleDetailsDefaults(profile?.professional_type)
    : null;
  const roleHighlights = isRoleDetails
    ? (
      Array.isArray(content.highlights) && content.highlights.length
        ? coerceCollectionItems('highlights', content.highlights)
        : getRoleDetailsCollectionFallback(profile?.professional_type, 'highlights')
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
        highlights: next.slice(0, 6).map((item) => ({
          id: item?.id || createContentItemId(),
          title: item?.title || '',
          text: item?.text || '',
          background: item?.background || '',
          text_color: item?.text_color || '',
        })),
      },
    });
  };
  const commitRoleProof = (next) => {
    onChange(block.id, {
      content: {
        proof: next.slice(0, 8).map((item) => ({
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
    if (Object.prototype.hasOwnProperty.call(content, key) && content[key] != null) {
      return String(content[key]);
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

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Selected</p>
          <h2 className="mt-1 text-sm font-bold text-slate-900">{labelForBlock(block.type)}</h2>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => onDuplicate(block.id)} className={iconButton} title="Duplicate"><Copy size={14} /></button>
          <button type="button" onClick={() => onDelete(block.id)} className={`${iconButton} hover:border-red-200 hover:text-red-600`} title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>

      {selection?.kind && selection.kind !== 'block' ? (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Selected element</p>
          <p className="mt-1 text-xs font-semibold text-slate-900">
            {isProcessCardContext || isFaqCardContext
              ? `${isProcessCardContext ? 'Process card' : 'FAQ card'} · ${selection.label || selectedField}`
              : (selection.label || selectedField)}
          </p>
          {isProfileSelection ? (
            <div className="mt-2 space-y-2 text-[11px] leading-4 text-slate-600">
              <p>This comes from your professional profile and is protected from deletion.</p>
              {selectedField === 'brandKit.cover_url' ? (
                <>
                  <MediaPicker
                    label="Page cover"
                    image={media?.cover || brandKit?.cover_url}
                    onUpload={(file) => onMediaUpload?.('cover', file)}
                    tall
                  />
                  {(media?.cover || brandKit?.cover_url) ? (
                    <ImageAdjustmentControls
                      image={media?.cover || brandKit?.cover_url}
                      kind="cover"
                      values={brandKit}
                      onChange={onBrandKitChange}
                    />
                  ) : null}
                </>
              ) : selectedField === 'brandKit.profile_photo_url' ? (
                <MediaPicker
                  label="Page profile"
                  image={media?.profile || brandKit?.profile_photo_url}
                  onUpload={(file) => onMediaUpload?.('profile', file)}
                  circle
                />
              ) : selectedField === 'brandKit.logo_url' ? (
                <MediaPicker
                  label="Navbar logo"
                  image={brandKit?.logo_url || profile?.storefront_logo_url}
                  onUpload={(file) => onMediaUpload?.('logo', file)}
                />
              ) : (
                <p>Update this value from your profile or business settings. It will update every matching page element.</p>
              )}
            </div>
          ) : isItemSelection ? (
            <div className="mt-2 space-y-2">
              {isGuidance && selection?.collection === 'steps' ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Process card · Step</p>
                  <Field label="Step title">
                    <input
                      value={selection.item?.title || ''}
                      onChange={(event) => onItemChange?.({ title: event.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Step description">
                    <textarea
                      value={selection.item?.text || ''}
                      onChange={(event) => onItemChange?.({ text: event.target.value })}
                      className={`${inputClass} min-h-20 resize-y`}
                    />
                  </Field>
                  {processCardControls}
                  <button
                    type="button"
                    disabled={guidanceSteps.length >= 8}
                    onClick={() => onItemAdd?.({
                      title: 'New step',
                      text: 'Describe this step for your clients.',
                    })}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <Plus size={13} />
                    {guidanceSteps.length >= 8 ? 'Max 8 steps reached' : 'Add step'}
                  </button>
                </>
              ) : isGuidance && selection?.collection === 'faqs' ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">FAQ card · Question</p>
                  <Field label="Question">
                    <input
                      value={selection.item?.q || ''}
                      onChange={(event) => onItemChange?.({ q: event.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Answer">
                    <textarea
                      value={selection.item?.a || ''}
                      onChange={(event) => onItemChange?.({ a: event.target.value })}
                      className={`${inputClass} min-h-24 resize-y`}
                    />
                  </Field>
                  {faqCardControls}
                  <button
                    type="button"
                    disabled={guidanceFaqs.length >= 8}
                    onClick={() => onItemAdd?.({
                      q: 'New question',
                      a: 'Add a clear answer clients can skim quickly.',
                    })}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <Plus size={13} />
                    {guidanceFaqs.length >= 8 ? 'Max 8 FAQs reached' : 'Add FAQ'}
                  </button>
                </>
              ) : isServices ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Service card</p>
                  <Field label="Title">
                    <input
                      value={selection.item?.title || ''}
                      onChange={(event) => onItemChange?.({ title: event.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={selection.item?.description || ''}
                      onChange={(event) => onItemChange?.({ description: event.target.value })}
                      className={`${inputClass} min-h-24 resize-y`}
                    />
                  </Field>
                  <Field label="Card icon">
                    <ServiceIconDropdown
                      value={selection.item?.icon || 'target'}
                      onChange={(icon) => onItemChange?.({ icon })}
                    />
                  </Field>
                  <ColorField
                    label="Icon background"
                    value={selection.item?.icon_background || ''}
                    onChange={(icon_background) => onItemChange?.({ icon_background })}
                  />
                  <ColorField
                    label="Icon color"
                    value={selection.item?.icon_color || ''}
                    onChange={(icon_color) => onItemChange?.({ icon_color })}
                  />
                  <ColorField
                    label="Card background"
                    value={selection.item?.background || ''}
                    onChange={(background) => onItemChange?.({ background })}
                  />
                  <ColorField
                    label="Card text"
                    value={selection.item?.text_color || ''}
                    onChange={(text_color) => onItemChange?.({ text_color })}
                  />
                  {(selection.item?.background || selection.item?.text_color || selection.item?.icon_background || selection.item?.icon_color) ? (
                    <button
                      type="button"
                      onClick={() => onItemChange?.({
                        background: '',
                        text_color: '',
                        icon_background: '',
                        icon_color: '',
                      })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Clear this card styles
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={serviceCards.length >= 6}
                    onClick={() => onItemAdd?.({
                      title: 'New service',
                      description: 'Add a clear one-line summary of this service for better client understanding.',
                      icon: SERVICE_ICON_DEFAULTS[serviceCards.length % SERVICE_ICON_DEFAULTS.length],
                      background: '',
                      text_color: '',
                      icon_background: '',
                      icon_color: '',
                    })}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <Plus size={13} />
                    {serviceCards.length >= 6 ? 'Max 6 cards reached' : 'Add service card'}
                  </button>
                </>
              ) : isRoleDetails && selection?.collection === 'highlights' ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Highlight card</p>
                  <Field label="Title">
                    <input
                      value={selection.item?.title || ''}
                      onChange={(event) => onItemChange?.({ title: event.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={selection.item?.text || ''}
                      onChange={(event) => onItemChange?.({ text: event.target.value })}
                      className={`${inputClass} min-h-24 resize-y`}
                    />
                  </Field>
                  <ColorField
                    label="Card background"
                    value={selection.item?.background || ''}
                    onChange={(background) => onItemChange?.({ background })}
                  />
                  <ColorField
                    label="Card text"
                    value={selection.item?.text_color || ''}
                    onChange={(text_color) => onItemChange?.({ text_color })}
                  />
                  {(selection.item?.background || selection.item?.text_color) ? (
                    <button
                      type="button"
                      onClick={() => onItemChange?.({ background: '', text_color: '' })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Clear this card’s colors
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={roleHighlights.length >= 6}
                    onClick={() => onItemAdd?.({
                      title: 'New highlight',
                      text: 'Describe this highlight for visitors.',
                      background: '',
                      text_color: '',
                    })}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <Plus size={13} />
                    {roleHighlights.length >= 6 ? 'Max 6 highlights reached' : 'Add highlight'}
                  </button>
                </>
              ) : isRoleDetails && selection?.collection === 'proof' ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Proof chip</p>
                  <Field label="Label">
                    <input
                      value={selection.item?.text || ''}
                      onChange={(event) => onItemChange?.({ text: event.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <ColorField
                    label="Chip background"
                    value={selection.item?.background || ''}
                    onChange={(background) => onItemChange?.({ background })}
                  />
                  <ColorField
                    label="Chip text"
                    value={selection.item?.text_color || ''}
                    onChange={(text_color) => onItemChange?.({ text_color })}
                  />
                  {(selection.item?.background || selection.item?.text_color) ? (
                    <button
                      type="button"
                      onClick={() => onItemChange?.({ background: '', text_color: '' })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Clear this chip’s colors
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={roleProof.length >= 8}
                    onClick={() => onItemAdd?.({
                      text: 'New proof point',
                      background: '',
                      text_color: '',
                    })}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <Plus size={13} />
                    {roleProof.length >= 8 ? 'Max 8 proof chips reached' : 'Add proof chip'}
                  </button>
                </>
              ) : (
                <Field label={selectedItemField === 'description' || selectedItemField === 'text' || selectedItemField === 'a' ? 'Description' : selectedItemField === 'q' ? 'Question' : 'Text'}>
                  <textarea
                    value={selection.item?.[selectedItemField] || ''}
                    onChange={(event) => onItemChange?.({ [selectedItemField]: event.target.value })}
                    className={`${inputClass} min-h-20 resize-y`}
                  />
                </Field>
              )}
              <button
                type="button"
                onClick={onItemDelete}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-50"
              >
                {isServices
                  ? 'Delete this service card'
                  : isRoleDetails && selection?.collection === 'highlights'
                    ? 'Delete this highlight'
                    : isRoleDetails && selection?.collection === 'proof'
                      ? 'Delete this proof chip'
                      : 'Delete this item'}
              </button>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {isProcessCardContext || isFaqCardContext ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {isProcessCardContext ? 'Process card' : 'FAQ card'}
                </p>
              ) : null}
              {selectedField === 'content.panel_background'
                || selectedField === 'content.panel_text_color'
                || selectedField === 'content.proof_panel'
                ? rolePanelControls
                : null}
              {selectedField === 'content.process_card_background'
                || selectedField === 'content.faq_card_background'
                || selectedField === 'content.process_card_text_color'
                || selectedField === 'content.faq_card_text_color'
                || selectedField === 'content.icon_background'
                || selectedField === 'content.icon_color'
                || selectedField === 'content.panel_background'
                || selectedField === 'content.panel_text_color'
                || selectedField === 'content.proof_panel'
                ? null
                : (
                  <Field label={selectedField === 'content.body' ? 'Description' : 'Text'}>
                    {selectedField === 'content.body' ? (
                      <textarea
                        value={contentValue('body')}
                        onChange={(event) => onChange(block.id, { content: { body: event.target.value } })}
                        className={`${inputClass} min-h-40 resize-y leading-6`}
                        placeholder={contentPlaceholder('body', 'Add supporting copy…')}
                      />
                    ) : (
                      <input
                        value={contentValue(selectedField.replace('content.', ''))}
                        onChange={(event) => onChange(block.id, {
                          content: { [selectedField.replace('content.', '')]: event.target.value },
                        })}
                        className={inputClass}
                        placeholder={contentPlaceholder(selectedField.replace('content.', ''), 'Add text…')}
                      />
                    )}
                  </Field>
                )}
              {isProcessCardContext ? processCardControls : null}
              {isFaqCardContext ? faqCardControls : null}
              {isServices && SERVICES_CARD_STYLE_FIELDS.has(selectedField) ? servicesIconControls : null}
            </div>
          )}
        </div>
      ) : null}

      {showSectionDesignTabs ? (
        <>
        {isElementSelection ? (
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary/65">Section design</p>
        ) : null}
          <div className="mt-4 flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {availableTabs.map((nameTab) => (
              <button
                key={nameTab}
                type="button"
                onClick={() => setTab(nameTab)}
                className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold capitalize transition ${tab === nameTab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                {nameTab}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3.5">
        {tab === 'content' ? (
          <>
            {isHero ? (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Hero media</p>
                <MediaPicker
                  label="Page cover"
                  hint="Shown behind the hero band"
                  image={media?.cover || brandKit?.cover_url}
                  onUpload={(file) => onMediaUpload?.('cover', file)}
                  tall
                />
                {(media?.cover || brandKit?.cover_url) ? (
                  <ImageAdjustmentControls
                    image={media?.cover || brandKit?.cover_url}
                    kind="cover"
                    values={brandKit}
                    onChange={onBrandKitChange}
                  />
                ) : null}
                {heroUsesProfilePhoto ? (
                  <>
                    <MediaPicker
                      label="Page profile"
                      hint="Displayed inside the hero card"
                      image={media?.profile || brandKit?.profile_photo_url}
                      onUpload={(file) => onMediaUpload?.('profile', file)}
                      circle
                    />
                    {(media?.profile || brandKit?.profile_photo_url) ? (
                      <ImageAdjustmentControls
                        image={media?.profile || brandKit?.profile_photo_url}
                        kind="profile"
                        values={brandKit}
                        onChange={onBrandKitChange}
                      />
                    ) : null}
                  </>
                ) : null}
                <MediaPicker
                  label="Navbar logo"
                  hint="Fits automatically into the top navigation"
                  image={brandKit?.logo_url || profile?.storefront_logo_url}
                  onUpload={(file) => onMediaUpload?.('logo', file)}
                />
              </div>
            ) : null}
            {!isHero && !isElementSelection ? (
              <Field label="Heading">
                <input
                  value={contentValue('heading')}
                  onChange={(event) => onChange(block.id, { content: { heading: event.target.value } })}
                  className={inputClass}
                  placeholder={placeholders.heading}
                />
              </Field>
            ) : null}
            {isGuidance && !isElementSelection ? (
              <Field label="Eyebrow">
                <input
                  value={contentValue('eyebrow')}
                  onChange={(event) => onChange(block.id, { content: { eyebrow: event.target.value } })}
                  className={inputClass}
                  placeholder={contentPlaceholder('eyebrow', 'Client Guide')}
                />
              </Field>
            ) : null}
            {(block.type === STOREFRONT_BLOCK_TYPES.ABOUT || block.type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS || isListings || isServices || isRoleDetails || block.type === STOREFRONT_BLOCK_TYPES.EXPERTISE) && !isElementSelection ? (
              <Field label="Eyebrow">
                <input
                  value={contentValue('eyebrow')}
                  onChange={(event) => onChange(block.id, { content: { eyebrow: event.target.value } })}
                  className={inputClass}
                  placeholder={
                    isServices
                      ? 'Capabilities'
                      : isRoleDetails
                        ? (roleDefaults?.eyebrow || 'Role-Based Support')
                        : block.type === STOREFRONT_BLOCK_TYPES.EXPERTISE
                          ? 'Professional Snapshot'
                          : isListings
                            ? (placeholders.eyebrow || 'Available properties')
                            : 'About'
                  }
                />
              </Field>
            ) : null}
            {!isHero && !isElementSelection ? (
              <Field label="Supporting copy">
                <textarea
                  value={contentValue('body')}
                  onChange={(event) => onChange(block.id, { content: { body: event.target.value } })}
                  className={`${inputClass} min-h-28 resize-y`}
                  placeholder={placeholders.body || 'Add supporting copy…'}
                />
              </Field>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.ABOUT && !isElementSelection ? (
              <Field label="Practice badge">
                <input
                  value={contentValue('about_badge')}
                  onChange={(event) => onChange(block.id, { content: { about_badge: event.target.value } })}
                  className={inputClass}
                  placeholder="A relationship-first real estate practice"
                />
              </Field>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.CTA && !isElementSelection ? (
              <>
                <Field label="Appointment button">
                  <input
                    value={contentValue('cta_label')}
                    onChange={(event) => onChange(block.id, { content: { cta_label: event.target.value } })}
                    className={inputClass}
                    placeholder="Ask about availability"
                  />
                </Field>
                <Field label="Inquiry button">
                  <input
                    value={contentValue('secondary_cta_label')}
                    onChange={(event) => onChange(block.id, { content: { secondary_cta_label: event.target.value } })}
                    className={inputClass}
                    placeholder="Send detailed inquiry"
                  />
                </Field>
                <Field label="Helper text under buttons">
                  <textarea
                    value={contentValue('helper_text')}
                    onChange={(event) => onChange(block.id, { content: { helper_text: event.target.value } })}
                    className={`${inputClass} min-h-20 resize-y`}
                    placeholder="Submit an inquiry and the professional will confirm an available time with you."
                  />
                </Field>
              </>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.HERO && !isElementSelection ? (
              <>
                <Field label="Hero eyebrow">
                  <input
                    value={contentValue('eyebrow')}
                    onChange={(event) => onChange(block.id, { content: { eyebrow: event.target.value } })}
                    className={inputClass}
                    placeholder="Full-service real estate"
                  />
                </Field>
                {!isThemeDrivenAgentHero ? (
                  <>
                    <Field label="Hero card name">
                      <input
                        value={contentValue('hero_name')}
                        onChange={(event) => onChange(block.id, { content: { hero_name: event.target.value } })}
                        className={inputClass}
                        placeholder={profile?.professional_name || 'Professional'}
                      />
                    </Field>
                    <Field label="Hero card subtitle">
                      <input
                        value={contentValue('hero_subtitle')}
                        onChange={(event) => onChange(block.id, { content: { hero_subtitle: event.target.value } })}
                        className={inputClass}
                        placeholder={profile?.headline || 'Your trusted real estate partner'}
                      />
                    </Field>
                  </>
                ) : null}
                <Field label="Company badge text">
                  <input
                    value={contentValue('hero_company_badge')}
                    onChange={(event) => onChange(block.id, { content: { hero_company_badge: event.target.value } })}
                    className={inputClass}
                    placeholder={profile?.professional_profile?.company_name || 'Company name'}
                  />
                </Field>
                <Field label="Primary button label">
                  <input
                    value={contentValue('primary_cta_label')}
                    onChange={(event) => onChange(block.id, { content: { primary_cta_label: event.target.value } })}
                    className={inputClass}
                    placeholder="Submit inquiry"
                  />
                </Field>
                <Field label="Secondary button label">
                  <input
                    value={contentValue('cta_label')}
                    onChange={(event) => onChange(block.id, { content: { cta_label: event.target.value } })}
                    className={inputClass}
                    placeholder="Book a Free Consultation"
                  />
                </Field>
              </>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.HERO && !isElementSelection ? (
              <>
                <Field label="Header navigation links">
                  <BuilderSelect
                    value={content.show_header_links === false ? 'hidden' : 'visible'}
                    options={[
                      { value: 'visible', label: 'Show links' },
                      { value: 'hidden', label: 'Hide links' },
                    ]}
                    onChange={(value) => onChange(block.id, {
                      content: { show_header_links: value !== 'hidden' },
                    })}
                    ariaLabel="Header navigation links"
                  />
                </Field>
                <Field label="Right profile badge in header">
                  <BuilderSelect
                    value={content.show_header_profile ? 'visible' : 'hidden'}
                    options={[
                      { value: 'hidden', label: 'Hide profile badge' },
                      { value: 'visible', label: 'Show profile badge' },
                    ]}
                    onChange={(value) => onChange(block.id, {
                      content: { show_header_profile: value === 'visible' },
                    })}
                    ariaLabel="Header right profile badge"
                  />
                </Field>
              </>
            ) : null}
            {!isHero && !content.heading && placeholders.heading ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-800">
                Preview is using fallback copy until you save a heading here.
              </p>
            ) : null}
            {isServices ? (
              <Field label={`Service cards (${serviceCards.length}/6)`}>
                <div className="space-y-2">
                  {serviceCards.map((item, index) => {
                    const iconKey = resolveServiceIconKey(item?.icon, index);
                    const CardIcon = getServiceIconEntry(iconKey).Icon;
                    return (
                      <div
                        key={item?.id || `${block.id}-service-${index}`}
                        className="space-y-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                            <CardIcon size={14} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                            {item?.title || 'Untitled service'}
                          </span>
                          <button
                            type="button"
                            onClick={() => commitServiceCards(serviceCards.filter((_, itemIndex) => itemIndex !== index))}
                            className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete service card ${index + 1}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <ServiceIconDropdown
                          value={iconKey}
                          onChange={(icon) => {
                            const next = serviceCards.map((card, cardIndex) => (
                              cardIndex === index
                                ? {
                                    id: card?.id || createContentItemId(),
                                    title: card?.title || '',
                                    description: card?.description || '',
                                    icon,
                                    background: card?.background || '',
                                    text_color: card?.text_color || '',
                                    icon_background: card?.icon_background || '',
                                    icon_color: card?.icon_color || '',
                                  }
                                : {
                                    id: card?.id || createContentItemId(),
                                    title: card?.title || '',
                                    description: card?.description || '',
                                    icon: resolveServiceIconKey(card?.icon, cardIndex),
                                    background: card?.background || '',
                                    text_color: card?.text_color || '',
                                    icon_background: card?.icon_background || '',
                                    icon_color: card?.icon_color || '',
                                  }
                            ));
                            commitServiceCards(next);
                          }}
                        />
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    disabled={serviceCards.length >= 6}
                    onClick={() => commitServiceCards([...serviceCards, {
                      id: createContentItemId(),
                      title: 'New service',
                      description: 'Add a clear one-line summary of this service for better client understanding.',
                      icon: SERVICE_ICON_DEFAULTS[serviceCards.length % SERVICE_ICON_DEFAULTS.length],
                    }])}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-500 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <Plus size={13} />
                    {serviceCards.length >= 6 ? 'Max 6 cards reached' : 'Add service card'}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                  Choose an icon here, or click a card in the preview to edit title, description, and card-level colors.
                </p>
              </Field>
            ) : null}
            {isListings && !isElementSelection ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
                Listing cards pull from your connected property inventory. Edit heading and supporting copy here; style the cards in the Style tab.
              </p>
            ) : null}
            {collection && !isServices ? (
              <Field label={collection.label}>
                <textarea
                  value={collectionDraft || collection.format(content.items)}
                  onChange={(event) => setCollectionDraft(event.target.value)}
                  onBlur={() => {
                    const parsed = collection.parse(collectionDraft || collection.format(content.items));
                    onChange(block.id, { content: { items: parsed } });
                    setCollectionDraft('');
                  }}
                  className={`${inputClass} min-h-32 resize-y font-mono text-xs`}
                  placeholder={collection.hint}
                />
                <p className="mt-1.5 text-[10px] text-slate-400">{collection.hint}</p>
              </Field>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.EXPERTISE && !isElementSelection ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
                Service, expertise, and area chips come from your professional profile and can’t be edited here.
              </p>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS ? (
              <>
                <Field label={`Highlight cards (${roleHighlights.length}/6)`}>
                  <div className="space-y-1.5">
                    {roleHighlights.map((item, index) => (
                      <div
                        key={item?.id || `${block.id}-highlight-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                          {item?.title || 'Untitled highlight'}
                        </span>
                        <button
                          type="button"
                          onClick={() => commitRoleHighlights(roleHighlights.filter((_, itemIndex) => itemIndex !== index))}
                          className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete highlight ${index + 1}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={roleHighlights.length >= 6}
                      onClick={() => commitRoleHighlights([...roleHighlights, {
                        id: createContentItemId(),
                        title: 'New highlight',
                        text: 'Describe this highlight for visitors.',
                        background: '',
                        text_color: '',
                      }])}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-500 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <Plus size={13} />
                      {roleHighlights.length >= 6 ? 'Max 6 highlights reached' : 'Add highlight'}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                    Click any highlight card in the preview to edit title, description, and card colors.
                  </p>
                </Field>
                <Field label={`Proof chips (${roleProof.length}/8)`}>
                  <div className="space-y-1.5">
                    {roleProof.map((item, index) => (
                      <div
                        key={item?.id || `${block.id}-proof-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                          {item?.text || 'Untitled proof'}
                        </span>
                        <button
                          type="button"
                          onClick={() => commitRoleProof(roleProof.filter((_, itemIndex) => itemIndex !== index))}
                          className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete proof chip ${index + 1}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={roleProof.length >= 8}
                      onClick={() => commitRoleProof([...roleProof, {
                        id: createContentItemId(),
                        text: 'New proof point',
                        background: '',
                        text_color: '',
                      }])}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-500 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <Plus size={13} />
                      {roleProof.length >= 8 ? 'Max 8 proof chips reached' : 'Add proof chip'}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                    Click any proof chip in the preview to edit its label and colors.
                  </p>
                </Field>
              </>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.GUIDANCE ? (
              <>
                {!isElementSelection ? (
                  <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Process card</p>
                    <Field label="Process label">
                      <input
                        value={contentValue('process_label')}
                        onChange={(event) => onChange(block.id, { content: { process_label: event.target.value } })}
                        className={inputClass}
                        placeholder={contentPlaceholder('process_label', 'Guided process')}
                      />
                    </Field>
                    <Field label="Process heading">
                      <input
                        value={contentValue('process_heading')}
                        onChange={(event) => onChange(block.id, { content: { process_heading: event.target.value } })}
                        className={inputClass}
                        placeholder={contentPlaceholder('process_heading', 'Three clear steps forward')}
                      />
                    </Field>
                    <Field label="Proof chip: chat">
                      <input
                        value={contentValue('proof_chat')}
                        onChange={(event) => onChange(block.id, { content: { proof_chat: event.target.value } })}
                        className={inputClass}
                        placeholder={contentPlaceholder('proof_chat', 'Guided chat support')}
                      />
                    </Field>
                    <Field label="Proof chip: handoff">
                      <input
                        value={contentValue('proof_handoff')}
                        onChange={(event) => onChange(block.id, { content: { proof_handoff: event.target.value } })}
                        className={inputClass}
                        placeholder={contentPlaceholder('proof_handoff', 'Organized professional handoff')}
                      />
                    </Field>
                  </div>
                ) : null}
                {!isElementSelection ? (
                  <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">FAQ card</p>
                    <Field label="FAQ label">
                      <input
                        value={contentValue('faq_label')}
                        onChange={(event) => onChange(block.id, { content: { faq_label: event.target.value } })}
                        className={inputClass}
                        placeholder={contentPlaceholder('faq_label', 'Helpful questions')}
                      />
                    </Field>
                    <Field label="FAQ heading">
                      <input
                        value={contentValue('faq_heading')}
                        onChange={(event) => onChange(block.id, { content: { faq_heading: event.target.value } })}
                        className={inputClass}
                        placeholder={contentPlaceholder('faq_heading', 'What clients often ask')}
                      />
                    </Field>
                    <Field label="FAQ footer title">
                      <input
                        value={contentValue('faq_footer_title')}
                        onChange={(event) => onChange(block.id, { content: { faq_footer_title: event.target.value } })}
                        className={inputClass}
                        placeholder={contentPlaceholder('faq_footer_title', 'Need a more specific answer?')}
                      />
                    </Field>
                    <Field label="FAQ footer body">
                      <textarea
                        value={contentValue('faq_footer_body')}
                        onChange={(event) => onChange(block.id, { content: { faq_footer_body: event.target.value } })}
                        className={`${inputClass} min-h-16 resize-y`}
                        placeholder={contentPlaceholder('faq_footer_body', 'Use the chat bubble to share your goals…')}
                      />
                    </Field>
                  </div>
                ) : null}
                <Field label={`Guide steps (${guidanceSteps.length}/8)`}>
                  <div className="space-y-1.5">
                    {guidanceSteps.map((item, index) => (
                      <div
                        key={item?.id || `${block.id}-step-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                          {item?.title || 'Untitled step'}
                        </span>
                        <button
                          type="button"
                          onClick={() => commitGuidanceSteps(guidanceSteps.filter((_, itemIndex) => itemIndex !== index))}
                          className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete step ${index + 1}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={guidanceSteps.length >= 8}
                      onClick={() => commitGuidanceSteps([...guidanceSteps, {
                        id: createContentItemId(),
                        title: 'New step',
                        text: 'Describe this step for your clients.',
                      }])}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-500 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <Plus size={13} />
                      {guidanceSteps.length >= 8 ? 'Max 8 steps reached' : 'Add step'}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                    Click any step in the preview to edit its title and description.
                  </p>
                </Field>
                <Field label={`FAQs (${guidanceFaqs.length}/8)`}>
                  <div className="space-y-1.5">
                    {guidanceFaqs.map((item, index) => (
                      <div
                        key={item?.id || `${block.id}-faq-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                          {item?.q || 'Untitled question'}
                        </span>
                        <button
                          type="button"
                          onClick={() => commitGuidanceFaqs(guidanceFaqs.filter((_, itemIndex) => itemIndex !== index))}
                          className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete FAQ ${index + 1}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={guidanceFaqs.length >= 8}
                      onClick={() => commitGuidanceFaqs([...guidanceFaqs, {
                        id: createContentItemId(),
                        q: 'New question',
                        a: 'Add a clear answer clients can skim quickly.',
                      }])}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-500 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <Plus size={13} />
                      {guidanceFaqs.length >= 8 ? 'Max 8 FAQs reached' : 'Add FAQ'}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                    Click any question in the preview to edit the question and answer.
                  </p>
                </Field>
              </>
            ) : null}
          </>
        ) : null}

        {tab === 'layout' ? (
          <>
            {!isHero ? (
              <>
                <Field label="Section variant">
                  <BuilderSelect value={layout.variant || 'standard'} options={SECTION_SETTINGS.variants} onChange={(variant) => onChange(block.id, { layout: { variant } })} ariaLabel="Section variant" />
                </Field>
                <Field label="Alignment">
                  <BuilderSelect value={layout.alignment} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} onChange={(alignment) => onChange(block.id, { layout: { alignment } })} ariaLabel="Alignment" />
                </Field>
                <Field label="Section padding">
                  <BuilderSelect value={layout.padding} options={[{ value: 'small', label: 'Compact' }, { value: 'medium', label: 'Comfortable' }, { value: 'large', label: 'Spacious' }]} onChange={(padding) => onChange(block.id, { layout: { padding } })} ariaLabel="Section padding" />
                </Field>
                <Field label="Container width">
                  <BuilderSelect value={layout.width || 'full'} options={SECTION_SETTINGS.widths} onChange={(width) => onChange(block.id, { layout: { width } })} ariaLabel="Container width" />
                </Field>
              </>
            ) : null}
            {isHero ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
                Hero uses a fixed structure. Only media treatment applies here.
              </p>
            ) : (
              <>
                {supportsColumns ? (
                  <Field label="Columns">
                    <BuilderSelect
                      value={layout.columns || (isListings ? '4' : '3')}
                      options={SECTION_SETTINGS.columns}
                      onChange={(columns) => onChange(block.id, { layout: { columns } })}
                      ariaLabel="Columns"
                    />
                  </Field>
                ) : null}
                <Field label="Card style">
                  <BuilderSelect value={layout.cardStyle || 'bordered'} options={SECTION_SETTINGS.cardStyles} onChange={(cardStyle) => onChange(block.id, { layout: { cardStyle } })} ariaLabel="Card style" />
                </Field>
              </>
            )}
            {isHero ? (
              <Field label="Media treatment">
                <BuilderSelect
                  value={layout.mediaPosition || 'background'}
                  options={[
                    { value: 'background', label: 'Show cover' },
                    { value: 'none', label: 'Hide cover' },
                  ]}
                  onChange={(mediaPosition) => onChange(block.id, { layout: { mediaPosition } })}
                  ariaLabel="Media treatment"
                />
              </Field>
            ) : null}
            {isHero && (layout.mediaPosition || 'background') === 'none' ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
                Cover image is hidden. Choose <span className="font-semibold text-slate-700">Show cover</span> to display the uploaded cover in the hero band.
              </p>
            ) : null}
            <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Section animation</p>
              <Field label="Animation">
                <BuilderSelect
                  value={layout.animationType || 'none'}
                  options={SECTION_SETTINGS.animations}
                  onChange={(animationType) => onChange(block.id, { layout: { animationType } })}
                  ariaLabel="Animation type"
                />
              </Field>
              {(layout.animationType || 'none') !== 'none' ? (
                <>
                  <Field label="Trigger">
                    <BuilderSelect
                      value={layout.animationTrigger || 'load'}
                      options={SECTION_SETTINGS.animationTriggers}
                      onChange={(animationTrigger) => onChange(block.id, { layout: { animationTrigger } })}
                      ariaLabel="Animation trigger"
                    />
                  </Field>
                  <Field label="Duration">
                    <BuilderSelect
                      value={layout.animationDuration || 'medium'}
                      options={SECTION_SETTINGS.animationDurations}
                      onChange={(animationDuration) => onChange(block.id, { layout: { animationDuration } })}
                      ariaLabel="Animation duration"
                    />
                  </Field>
                  <Field label="Delay">
                    <BuilderSelect
                      value={String(layout.animationDelay ?? '0')}
                      options={SECTION_SETTINGS.animationDelays}
                      onChange={(animationDelay) => onChange(block.id, { layout: { animationDelay } })}
                      ariaLabel="Animation delay"
                    />
                  </Field>
                  <Field label="Intensity">
                    <BuilderSelect
                      value={layout.animationIntensity || 'medium'}
                      options={SECTION_SETTINGS.animationIntensities}
                      onChange={(animationIntensity) => onChange(block.id, { layout: { animationIntensity } })}
                      ariaLabel="Animation intensity"
                    />
                  </Field>
                </>
              ) : null}
            </div>
          </>
        ) : null}

        {tab === 'style' ? (
          <>
            {isHero ? (
              <>
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
                  Design colors are used by default. Set colors here only when this Hero needs its own background, text, or button overrides.
                </p>
                <ColorField
                  label="Hero background"
                  value={style.background || ''}
                  onChange={(background) => onChange(block.id, { style: { background } })}
                />
                {style.background ? (
                  <button
                    type="button"
                    onClick={() => onChange(block.id, { style: { background: '' } })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Reset hero background
                  </button>
                ) : (
                  <p className="text-[10px] leading-4 text-slate-400">
                    Currently using the template hero background.
                  </p>
                )}
                {!isThemeDrivenAgentHero ? (
                  <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Legacy strip</p>
                    <p className="text-[10px] leading-4 text-slate-500">
                      Used by older hero layouts.
                    </p>
                    <ColorField
                      label="Strip background"
                      value={content.hero_strip_background || ''}
                      onChange={(hero_strip_background) => onChange(block.id, { content: { hero_strip_background } })}
                    />
                    {content.hero_strip_background ? (
                      <button
                        type="button"
                        onClick={() => onChange(block.id, { content: { hero_strip_background: '' } })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Reset strip color
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Hero text + buttons</p>
                  {!isThemeDrivenAgentHero ? (
                    <ColorField
                      label="Hero surface"
                      value={content.hero_card_background || ''}
                      onChange={(hero_card_background) => onChange(block.id, { content: { hero_card_background } })}
                    />
                  ) : null}
                  <ColorField
                    label="Hero text color"
                    value={content.hero_card_text_color || ''}
                    onChange={(hero_card_text_color) => onChange(block.id, { content: { hero_card_text_color } })}
                  />
                  <ColorField
                    label="Primary button background"
                    value={content.primary_button_background || ''}
                    onChange={(primary_button_background) => onChange(block.id, { content: { primary_button_background } })}
                  />
                  <ColorField
                    label="Primary button text"
                    value={content.primary_button_text_color || ''}
                    onChange={(primary_button_text_color) => onChange(block.id, { content: { primary_button_text_color } })}
                  />
                  <ColorField
                    label="Secondary button background"
                    value={content.secondary_button_background || ''}
                    onChange={(secondary_button_background) => onChange(block.id, { content: { secondary_button_background } })}
                  />
                  <ColorField
                    label="Secondary button text"
                    value={content.secondary_button_text_color || ''}
                    onChange={(secondary_button_text_color) => onChange(block.id, { content: { secondary_button_text_color } })}
                  />
                  {((!isThemeDrivenAgentHero && content.hero_card_background)
                    || content.hero_card_text_color
                    || content.primary_button_background
                    || content.primary_button_text_color
                    || content.secondary_button_background
                    || content.secondary_button_text_color) ? (
                      <button
                        type="button"
                        onClick={() => onChange(block.id, {
                          content: {
                            hero_card_background: '',
                            hero_card_text_color: '',
                            primary_button_background: '',
                            primary_button_text_color: '',
                            secondary_button_background: '',
                            secondary_button_text_color: '',
                          },
                        })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Reset text/button colors
                      </button>
                    ) : null}
                </div>
              </>
            ) : (
              <>
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
                  Brand colors live in <span className="font-semibold text-slate-700">Design</span>.
                  Here you only override this section’s background and text when needed.
                </p>
                <ColorField
                  label="Section background"
                  value={style.background || ''}
                  onChange={(background) => onChange(block.id, { style: { background } })}
                />
                <ColorField
                  label="Section text color"
                  value={style.textColor || ''}
                  onChange={(textColor) => onChange(block.id, { style: { textColor } })}
                />
                {isGuidance ? (
                  <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-500">
                    Click the Process or FAQ card for optional card-level colors. Steps and FAQs inherit those styles—no per-item colors.
                  </p>
                ) : null}
                {isServices ? (
                  <div className="space-y-3">
                    {servicesIconControls}
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-500">
                      One section background (Style above). Click each service card to set its own background, text, title, description, and icon.
                    </p>
                  </div>
                ) : null}
                {isRoleDetails ? (
                  <div className="space-y-3">
                    {rolePanelControls}
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-500">
                      Brand colors come from Design. Click highlight cards or proof chips to set per-item colors. Layout controls columns and card style.
                    </p>
                  </div>
                ) : null}
                {block.type === STOREFRONT_BLOCK_TYPES.ABOUT ? (
                  <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-500">
                    About uses brand colors plus this section override. Photo and name come from your profile / Design media.
                  </p>
                ) : null}
                {isListings ? (
                  <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Property cards</p>
                      <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        Themes set card style automatically. Override colors here.
                        Prices use Accent; status badges use Primary.
                      </p>
                    </div>
                    <ColorField
                      label="Card background"
                      value={content.card_background || ''}
                      onChange={(card_background) => onChange(block.id, { content: { card_background } })}
                    />
                    <ColorField
                      label="Card text"
                      value={content.card_text_color || ''}
                      onChange={(card_text_color) => onChange(block.id, { content: { card_text_color } })}
                    />
                    <Field label="Card style">
                      <BuilderSelect
                        value={layout.cardStyle || 'bordered'}
                        options={SECTION_SETTINGS.cardStyles}
                        onChange={(cardStyle) => onChange(block.id, { layout: { cardStyle } })}
                        ariaLabel="Property card style"
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => {
                        const themeCards = listingCardThemeFromTemplate(templateKey || '');
                        onChange(block.id, {
                          content: {
                            card_background: themeCards.card_background || '',
                            card_text_color: themeCards.card_text_color || '',
                          },
                          layout: { cardStyle: themeCards.cardStyle || 'bordered' },
                        });
                      }}
                      className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      Apply current theme card style
                    </button>
                    {(content.card_background || content.card_text_color) ? (
                      <button
                        type="button"
                        onClick={() => onChange(block.id, {
                          content: { card_background: '', card_text_color: '' },
                        })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Clear card color overrides
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <Field label="Corner radius">
                  <BuilderSelect value={style.radius || 'default'} options={[{ value: 'none', label: 'Sharp' }, { value: 'default', label: 'Soft' }, { value: 'large', label: 'Rounded' }]} onChange={(radius) => onChange(block.id, { style: { radius } })} ariaLabel="Corner radius" />
                </Field>
                <Field label="Shadow depth">
                  <BuilderSelect value={style.shadow || 'none'} options={SECTION_SETTINGS.shadows} onChange={(shadow) => onChange(block.id, { style: { shadow } })} ariaLabel="Shadow depth" />
                </Field>
              </>
            )}
          </>
        ) : null}
          </div>
      </>
      ) : null}
    </>
  );
}
