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
import DeleteLeadConfirmModal from '@/components/leads/DeleteLeadConfirmModal';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  availableBlocksForRole,
  isProtectedBlockType,
  labelForBlock,
  resolveContentItem,
  toRendererBlocks,
} from './storefrontBuilderState';
import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';
import { ChatBubbleLayer, LibraryBlock, SortableLayer } from './BuilderLayersPanel';
import PageSettings from './BuilderPageSettings';
import Inspector from './BuilderBlockInspector';
import { materializeTemplate } from '../templates';
import BuilderConfirmModal from './BuilderConfirmModal';
import { useBuilderPreviewProfile } from './buildBuilderPreviewProfile';
import {
  BUILDER_PANELS,
  BUILDER_PREVIEW_WIDTHS,
} from './builderWorkspaceConstants';
import {
  blockLayoutStyleSignature,
  normalizeHexForCompare,
} from './builderWorkspaceUtils';
import { createCollectionMaterializer } from './materializeBuilderCollectionItems';
import { useBuilderBlockHandlers } from './useBuilderBlockHandlers';
import { useBuilderBrandMigration } from './useBuilderBrandMigration';
import { useBuilderNormalizedBlocks } from './useBuilderNormalizedBlocks';

const PANEL_ICONS = {
  LayoutTemplate,
  Plus,
  Settings2,
};

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

  const normalized = useBuilderNormalizedBlocks({
    blocks,
    templateKey,
    profile,
    brandKit,
    onChange,
  });

  useBuilderBrandMigration({ templateKey, brandKit, onBrandKitChange });

  const { materializeCollectionItems, resolveCollectionForEdit } = useMemo(
    () => createCollectionMaterializer(templateKey, profile),
    [templateKey, profile],
  );

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

    if (blockLayoutStyleSignature(normalized) !== blockLayoutStyleSignature(next.blocks)) {
      return true;
    }

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
      if (items[fallbackIndex]) {
        return { item: { ...items[fallbackIndex], id: selectedElement.itemId }, index: fallbackIndex };
      }
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

  const handlers = useBuilderBlockHandlers({
    normalized,
    templateKey,
    profile,
    brandKit,
    selected,
    selectedElement,
    selectedId,
    history,
    future,
    setHistory,
    setFuture,
    onChange,
    onBrandKitChange,
    onTemplateChange,
    onResetTemplateDefaults,
    setSelectedId,
    setSelectedElement,
    setInspectorOpen,
    setActivePanel,
    setConfirmState,
    setActiveDrag,
    setInlineEditingDraft,
    materializeCollectionItems,
    resolveCollectionForEdit,
  });

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
      const target = BUILDER_PREVIEW_WIDTHS[previewMode] || BUILDER_PREVIEW_WIDTHS.desktop;
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

  const showChatbot = brandKit?.show_chatbot !== false;

  const previewProfile = useBuilderPreviewProfile({
    profile,
    normalized,
    templateKey,
    brandKit,
    embedToken,
    accessToken,
    media,
    selectedElement,
  });

  const rendererBlocks = useMemo(() => toRendererBlocks(normalized), [normalized]);

  const frameWidth = BUILDER_PREVIEW_WIDTHS[previewMode];
  const showInspectorColumn = viewportWidth >= 1200;
  const gridTemplateColumns = showInspectorColumn
    ? '52px 280px minmax(0, 1fr) 300px'
    : '52px 260px minmax(0, 1fr)';

  const inspectorProps = {
    block: selected,
    selection: inspectorSelection,
    profile,
    onChange: handlers.updateBlock,
    onItemChange: handlers.updateSelectedItem,
    onItemDelete: handlers.removeSelectedItem,
    onItemAdd: handlers.addSelectedItem,
    onDuplicate: handlers.duplicateBlock,
    media,
    onMediaUpload,
    brandKit,
    onBrandKitChange,
    templateKey,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveDrag(active)}
      onDragEnd={handlers.handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      <div
        className="relative h-[calc(100dvh-4rem)] min-h-[36rem] overflow-hidden bg-[#e8edf3]"
        style={{ display: 'grid', gridTemplateColumns }}
      >
        <nav className="flex flex-col items-center gap-2 bg-white py-3">
          {BUILDER_PANELS.map(({ id, label, iconName }) => {
            const Icon = PANEL_ICONS[iconName];
            return (
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
            );
          })}
          <div className="mt-auto flex flex-col gap-1.5 pb-1">
            <button type="button" onClick={handlers.undo} disabled={!history.length} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25" title="Undo"><Undo2 size={16} /></button>
            <button type="button" onClick={handlers.redo} disabled={!future.length} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25" title="Redo"><Redo2 size={16} /></button>
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
                        pinned={isProtectedBlockType(block.type)}
                        onSelect={() => handlers.selectBlock(block.id)}
                        onToggle={() => handlers.updateBlock(block.id, { enabled: !block.data.enabled })}
                        onDelete={isProtectedBlockType(block.type) ? null : () => handlers.removeBlock(block.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
                {hasChatbot ? (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Overlays</p>
                    <ChatBubbleLayer
                      enabled={brandKit?.show_chatbot !== false}
                      onToggle={() => handlers.commitBrandKit({ show_chatbot: brandKit?.show_chatbot === false })}
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
                          handlers.selectBlock(entry.existingId);
                          setActivePanel('layers');
                          return;
                        }
                        if (entry.status === 'available') handlers.addBlock(entry.type);
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
              onTemplateChange={handlers.requestTemplateApplyConfirm}
              brandKit={brandKit}
              onChange={handlers.commitBrandKit}
              onResetTemplateColors={() => handlers.pushSnapshotThen(onResetTemplateColors)}
              onResetTemplateDefaults={handlers.requestResetTemplateDefaultsConfirm}
              canResetTemplateDefaults={canResetTemplateDefaults}
              onUndo={handlers.undo}
              onRedo={handlers.redo}
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
                    actions={{
                      onCtaClick: (ctaType = '') => {
                        if (String(ctaType) !== 'calculator') return;
                        const root = frameContentRef.current;
                        const stage = stageRef.current;
                        const target = root?.querySelector('#calculator');
                        if (!target || !stage) return;
                        const top = target.getBoundingClientRect().top
                          - stage.getBoundingClientRect().top
                          + stage.scrollTop
                          - 16;
                        stage.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
                      },
                    }}
                    preview
                    selectedBlockId={selected?.id}
                    onBlockSelect={handlers.selectBlock}
                    selectedElement={selectedElement}
                    onElementSelect={handlers.selectElement}
                    onInlineContentInput={setInlineEditingDraft}
                    onInlineContentChange={handlers.updateInlineContent}
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
                {...inspectorProps}
                onDelete={handlers.removeBlock}
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
                {...inspectorProps}
                onDelete={(id) => { handlers.removeBlock(id); setInspectorOpen(false); }}
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
          onConfirm={() => handlers.confirmPendingAction(confirmState)}
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
