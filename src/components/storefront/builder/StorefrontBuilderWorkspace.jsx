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
import StorefrontBlockRenderer from '../StorefrontBlockRenderer';
import {
  availableBlocksForRole,
  createBlock,
  labelForBlock,
  normalizeBlocks,
  toRendererBlocks,
} from './storefrontBuilderState';
import { LibraryBlock, SortableLayer } from './BuilderLayersPanel';
import PageSettings from './BuilderPageSettings';
import Inspector from './BuilderBlockInspector';

const PANELS = [
  { id: 'layers', label: 'Layers', Icon: LayoutTemplate },
  { id: 'add', label: 'Add', Icon: Plus },
  { id: 'settings', label: 'Design', Icon: Settings2 },
];

const PREVIEW_WIDTHS = { desktop: 1280, tablet: 834, mobile: 390 };

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
  onMediaUpload,
  media,
  saving,
  saveState,
}) {
  const [activePanel, setActivePanel] = useState('layers');
  const [selectedId, setSelectedId] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeDrag, setActiveDrag] = useState(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [canvasScale, setCanvasScale] = useState(1);
  const [frameHeight, setFrameHeight] = useState(720);
  const [viewportWidth, setViewportWidth] = useState(1400);
  const stageRef = useRef(null);
  const frameContentRef = useRef(null);

  const normalized = useMemo(() => normalizeBlocks(blocks), [blocks]);
  const availableBlockTypes = useMemo(() => availableBlocksForRole(role), [role]);
  const addableBlockTypes = useMemo(() => {
    const existingTypes = new Set(normalized.map((block) => block.type));
    return availableBlockTypes.filter((type) => !existingTypes.has(type));
  }, [availableBlockTypes, normalized]);
  const selected = normalized.find((block) => block.id === selectedId) || null;
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
    const updateHeight = () => setFrameHeight(node.scrollHeight || 720);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [normalized, previewMode, brandKit, selectedId]);

  const commit = (next) => {
    setHistory((current) => [...current.slice(-29), normalized]);
    setFuture([]);
    onChange(next);
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

  const removeBlock = (id) => {
    const next = normalized.filter((block) => block.id !== id);
    commit(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id || null);
      if (!next[0]) setInspectorOpen(false);
    }
  };

  const duplicateBlock = (id) => {
    const index = normalized.findIndex((block) => block.id === id);
    if (index < 0) return;
    const original = normalized[index];
    const copy = { ...createBlock(original.type), data: structuredClone(original.data) };
    const next = [...normalized];
    next.splice(index + 1, 0, copy);
    commit(next);
    setSelectedId(copy.id);
    setInspectorOpen(true);
  };

  const addBlock = (type) => {
    const existing = normalized.find((block) => block.type === type);
    if (existing) {
      setSelectedId(existing.id);
      setInspectorOpen(true);
      setActivePanel('layers');
      return;
    }
    const block = createBlock(type);
    const next = [...normalized];
    const footerIndex = next.findIndex((item) => item.type === 'footer');
    next.splice(footerIndex >= 0 ? footerIndex : next.length, 0, block);
    commit(next);
    setSelectedId(block.id);
    setInspectorOpen(true);
    setActivePanel('layers');
  };

  const selectBlock = (id) => {
    setSelectedId(id);
    setInspectorOpen(true);
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((items) => [normalized, ...items].slice(0, 30));
    setHistory((items) => items.slice(0, -1));
    onChange(previous);
  };

  const redo = () => {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [...items, normalized].slice(-30));
    setFuture((items) => items.slice(1));
    onChange(next);
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
      const block = createBlock(type);
      const index = normalized.findIndex((item) => item.id === over.id);
      const next = [...normalized];
      if (index >= 0) next.splice(index, 0, block);
      else {
        const footerIndex = next.findIndex((item) => item.type === 'footer');
        next.splice(footerIndex >= 0 ? footerIndex : next.length, 0, block);
      }
      commit(next);
      setSelectedId(block.id);
      setInspectorOpen(true);
      setActivePanel('layers');
      return;
    }
    if (active.id === over.id) return;
    const oldIndex = normalized.findIndex((block) => block.id === active.id);
    const newIndex = normalized.findIndex((block) => block.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) commit(arrayMove(normalized, oldIndex, newIndex));
  };

  const previewProfile = {
    ...profile,
    storefront_builder_access_token: accessToken,
    storefront_logo_url: brandKit.logo_url || profile?.storefront_logo_url,
    storefront_logo_size: Number(brandKit.logo_size) || profile?.storefront_logo_size || 40,
    cover_photo_url: brandKit.cover_url || profile?.cover_photo_url,
    profile_photo_url: brandKit.profile_photo_url || profile?.profile_photo_url,
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
    storefront_theme: {
      primary: brandKit.primary_color,
      accent: brandKit.accent_color,
      fontFamily: brandKit.font || 'Manrope',
      radius: brandKit.button_shape === 'pill' ? '999px' : brandKit.button_shape === 'square' ? '2px' : '0.75rem',
    },
  };

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
        <nav className="flex flex-col items-center gap-2 border-r border-slate-200 bg-white py-3 shadow-[2px_0_12px_rgba(15,23,42,0.04)]">
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
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-[13px] font-bold text-slate-900">Page structure</h2>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500" data-builder-version="v3-inline-grid">Drag to reorder. Click a layer to edit copy, layout, and style.</p>
                </div>
              </div>
              <div className="mt-5">
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
                        onDelete={() => removeBlock(block.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>
          ) : activePanel === 'add' ? (
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[13px] font-bold text-slate-900">Add sections</h2>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">Click or drag into the page.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                  {addableBlockTypes.length}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-1.5">
                {addableBlockTypes.map((type) => (
                  <LibraryBlock key={type} type={type} onClick={() => addBlock(type)} />
                ))}
                {!addableBlockTypes.length ? (
                  <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-[10px] leading-4 text-slate-500">
                    All available sections are already in Layers.
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <PageSettings
              role={role}
              templateKey={templateKey}
              onTemplateChange={onTemplateChange}
              brandKit={brandKit}
              onChange={onBrandKitChange}
              onMediaUpload={onMediaUpload}
              media={media}
            />
          )}
        </aside>

        <main ref={stageRef} className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-[#e8edf3]/95 px-4 py-2.5 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
                {[{ id: 'desktop', Icon: Monitor, label: 'Desktop' }, { id: 'tablet', Icon: Tablet, label: 'Tablet' }, { id: 'mobile', Icon: Smartphone, label: 'Mobile' }].map(({ id, Icon, label }) => (
                  <button key={id} type="button" title={label} onClick={() => setPreviewMode(id)} className={`grid h-8 w-9 place-items-center rounded-md transition ${previewMode === id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
              <span className="hidden text-[11px] font-medium text-slate-500 sm:inline">{Math.round(canvasScale * 100)}% · {previewMode}</span>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${saving ? 'bg-amber-50 text-amber-700' : saveState === 'saved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {saving ? 'Saving…' : saveState === 'saved' ? 'Draft saved' : 'Unsaved'}
            </span>
          </div>

          <div className="flex justify-center px-4 py-6">
            <div
              ref={setCanvasRef}
              className={`origin-top overflow-hidden bg-white shadow-[0_25px_80px_rgba(15,23,42,0.18)] ring-1 transition-shadow ${canvasIsOver ? 'ring-2 ring-emerald-500' : 'ring-black/5'} ${previewMode === 'mobile' ? 'rounded-[1.75rem]' : 'rounded-xl'}`}
              style={{ width: frameWidth * canvasScale, height: Math.max(frameHeight * canvasScale, 320) }}
            >
              <div
                ref={frameContentRef}
                style={{ width: frameWidth, transform: `scale(${canvasScale})`, transformOrigin: 'top left' }}
              >
                <StorefrontBlockRenderer
                  profile={previewProfile}
                  blocks={toRendererBlocks(normalized)}
                  templateKey={templateKey}
                  theme={previewProfile.storefront_theme}
                  actions={{}}
                  preview
                  selectedBlockId={selected?.id}
                  onBlockSelect={selectBlock}
                />
              </div>
            </div>
          </div>
        </main>

        {showInspectorColumn ? (
          <aside className="min-h-0 overflow-y-auto border-l border-slate-200 bg-white">
            <div className="p-4">
              <Inspector
                block={selected}
                profile={profile}
                onChange={updateBlock}
                onDelete={removeBlock}
                onDuplicate={duplicateBlock}
                media={media}
                onMediaUpload={onMediaUpload}
                brandKit={brandKit}
                onBrandKitChange={onBrandKitChange}
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
                profile={profile}
                onChange={updateBlock}
                onDelete={(id) => { removeBlock(id); setInspectorOpen(false); }}
                onDuplicate={duplicateBlock}
                media={media}
                onMediaUpload={onMediaUpload}
                brandKit={brandKit}
                onBrandKitChange={onBrandKitChange}
              />
            </div>
          </aside>
        ) : null}
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
