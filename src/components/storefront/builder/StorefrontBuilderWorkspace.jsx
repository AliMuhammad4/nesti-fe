'use client';
/* eslint-disable @next/next/no-img-element */
/* nesti-builder-v4: inline-grid layout */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Check,
  Copy,
  GripVertical,
  LayoutTemplate,
  Monitor,
  Plus,
  Redo2,
  Settings2,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import StorefrontBlockRenderer from '../StorefrontBlockRenderer';
import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';
import {
  availableBlocksForRole,
  createBlock,
  labelForBlock,
  normalizeBlocks,
  SECTION_SETTINGS,
  toRendererBlocks,
} from './storefrontBuilderState';
import { listTemplatesForRole } from './storefrontTemplates';

const PANELS = [
  { id: 'layers', label: 'Layers', Icon: LayoutTemplate },
  { id: 'add', label: 'Add', Icon: Plus },
  { id: 'settings', label: 'Design', Icon: Settings2 },
];

const PREVIEW_WIDTHS = { desktop: 1280, tablet: 834, mobile: 390 };

const parseListingLine = (line) => {
  const [title = '', price = '', address = '', bedrooms = '', bathrooms = '', square_footage = '', status = ''] = line.split('|').map((part) => part.trim());
  return {
    title,
    price,
    expected_price: price,
    address,
    location: address,
    bedrooms,
    bathrooms,
    square_footage,
    status,
    image_url: '',
    photos: [],
    images: [],
    property_type: '',
  };
};

const formatListingLine = (item = {}) => [
  item.title || '',
  item.price || item.expected_price || '',
  item.address || item.location || '',
  item.bedrooms || '',
  item.bathrooms || '',
  item.square_footage || '',
  item.status || '',
].filter(Boolean).join(' | ');

const CONTENT_COLLECTIONS = {
  [STOREFRONT_BLOCK_TYPES.HERO]: {
    label: 'Trust chips',
    parse: (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean),
    format: (items) => (items || []).map((item) => String(item || '').trim()).filter(Boolean).join('\n'),
    hint: 'One trust chip per line',
  },
  [STOREFRONT_BLOCK_TYPES.SERVICES]: {
    label: 'Service cards',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title = '', description = ''] = line.split('|').map((part) => part.trim());
        return { title, description };
      })
      .filter((item) => item.title),
    format: (items) => (items || [])
      .map((item) => `${item.title || ''}${item.description ? ` | ${item.description}` : ''}`)
      .join('\n'),
    hint: 'One per line: Title | Description',
  },
  [STOREFRONT_BLOCK_TYPES.TESTIMONIALS]: {
    label: 'Client stories',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [client_name = '', text = ''] = line.split('|').map((part) => part.trim());
        return { client_name, text, rating: 5 };
      })
      .filter((item) => item.client_name && item.text),
    format: (items) => (items || [])
      .map((item) => `${item.client_name || ''}${item.text ? ` | ${item.text}` : ''}`)
      .join('\n'),
    hint: 'One per line: Client Name | Testimonial',
  },
  [STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS]: {
    label: 'Mortgage programs',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name = '', description = '', min_credit_score = '', down_payment_min = ''] = line.split('|').map((part) => part.trim());
        return { name, description, min_credit_score, down_payment_min };
      })
      .filter((item) => item.name),
    format: (items) => (items || [])
      .map((item) => [item.name, item.description, item.min_credit_score, item.down_payment_min].filter(Boolean).join(' | '))
      .join('\n'),
    hint: 'One per line: Name | Description | Min Credit | Down Payment',
  },
  [STOREFRONT_BLOCK_TYPES.PROPERTIES]: {
    label: 'Property cards',
    parse: (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean).map(parseListingLine).filter((item) => item.title || item.address || item.price),
    format: (items) => (items || []).map(formatListingLine).join('\n'),
    hint: 'One per line: Title | Price | Address | Beds | Baths | Sqft | Status',
  },
  [STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS]: {
    label: 'Featured listing cards',
    parse: (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean).map(parseListingLine).filter((item) => item.title || item.address || item.price),
    format: (items) => (items || []).map(formatListingLine).join('\n'),
    hint: 'One per line: Title | Price | Address | Beds | Baths | Sqft | Status',
  },
  [STOREFRONT_BLOCK_TYPES.TOP_LISTINGS]: {
    label: 'Top listing cards',
    parse: (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean).map(parseListingLine).filter((item) => item.title || item.address || item.price),
    format: (items) => (items || []).map(formatListingLine).join('\n'),
    hint: 'One per line: Title | Price | Address | Beds | Baths | Sqft | Status',
  },
  [STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS]: {
    label: 'Sold listing cards',
    parse: (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean).map(parseListingLine).filter((item) => item.title || item.address || item.price),
    format: (items) => (items || []).map(formatListingLine).join('\n'),
    hint: 'One per line: Title | Price | Address | Beds | Baths | Sqft | Status',
  },
  [STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS]: {
    label: 'Practice areas',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    format: (items) => (items || [])
      .map((item) => (typeof item === 'string' ? item : item?.title || ''))
      .filter(Boolean)
      .join('\n'),
    hint: 'One area per line',
  },
  [STOREFRONT_BLOCK_TYPES.CREDENTIALS]: {
    label: 'Credentials',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title = '', issuer = '', year = ''] = line.split('|').map((part) => part.trim());
        return { title, issuer, year: Number(year) || year };
      })
      .filter((item) => item.title),
    format: (items) => (items || [])
      .map((item) => [item.title, item.issuer, item.year].filter(Boolean).join(' | '))
      .join('\n'),
    hint: 'One per line: Title | Issuer | Year',
  },
  [STOREFRONT_BLOCK_TYPES.FOOTER]: {
    label: 'Footer navigation',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label = '', target = ''] = line.split('|').map((part) => part.trim());
        return { label, target };
      })
      .filter((item) => item.label),
    format: (items) => (items || [])
      .map((item) => [item.label, item.target].filter(Boolean).join(' | '))
      .join('\n'),
    hint: 'One per line: Label | URL or #section',
  },
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
    const block = createBlock(type);
    commit([...normalized, block]);
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
      const block = createBlock(active.data.current.type);
      const index = normalized.findIndex((item) => item.id === over.id);
      const next = [...normalized];
      if (index >= 0) next.splice(index, 0, block);
      else next.push(block);
      commit(next);
      setSelectedId(block.id);
      setInspectorOpen(true);
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
                  {availableBlocksForRole(role).length}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-1.5">
                {availableBlocksForRole(role).map((type) => (
                  <LibraryBlock key={type} type={type} onClick={() => addBlock(type)} />
                ))}
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
              <Inspector block={selected} profile={profile} onChange={updateBlock} onDelete={removeBlock} onDuplicate={duplicateBlock} />
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

function LibraryBlock({ type, onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `library-${type}`, data: { fromLibrary: true, type } });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      {...listeners}
      {...attributes}
      className={`group flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-[10px] font-semibold leading-3.5 text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-900 hover:shadow-sm ${isDragging ? 'opacity-40' : ''}`}
    >
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-400 transition group-hover:bg-white group-hover:text-emerald-600">
        <Plus size={11} />
      </span>
      <span>{labelForBlock(type)}</span>
    </button>
  );
}

function SortableLayer({ block, index, selected, onSelect, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id, data: { type: block.type } });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex w-full items-center gap-1.5 rounded-xl border px-1.5 py-1.5 transition ${
        selected
          ? 'border-emerald-200 bg-emerald-50/70 text-slate-900 shadow-sm ring-1 ring-emerald-100'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      {selected ? <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-emerald-500" /> : null}
      <button type="button" {...attributes} {...listeners} className="cursor-grab p-1 text-slate-400 active:cursor-grabbing" aria-label="Drag to reorder">
        <GripVertical size={14} />
      </button>
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 truncate text-left text-[11px] font-semibold">
        <span className={`mr-1.5 inline-block w-4 text-[9px] font-bold ${selected ? 'text-emerald-600' : 'text-slate-300'}`}>{index + 1}</span>
        {labelForBlock(block.type)}
      </button>
      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); onToggle(); }}
        className={`h-4 w-7 rounded-full p-0.5 transition ${block.data.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
        aria-label={block.data.enabled ? 'Hide block' : 'Show block'}
      >
        <span className={`block h-3 w-3 rounded-full bg-white transition ${block.data.enabled ? 'translate-x-3' : ''}`} />
      </button>
      <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(); }} className="rounded p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-600" aria-label="Delete block">
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function PageSettings({ role, templateKey, onTemplateChange, brandKit, onChange, onMediaUpload, media }) {
  const templates = listTemplatesForRole(role);
  return (
    <div className="p-3.5">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Design system</p>
            <h2 className="mt-1 text-sm font-bold tracking-tight text-slate-900">Choose a starting point</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-500 shadow-sm">
            {templates.length} themes
          </span>
        </div>
        <p className="mt-2 text-[10px] leading-4 text-slate-500">
          Each template changes page structure, section styles, copy, and branding.
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {templates.map((template, index) => {
          const active = template.id === templateKey;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onTemplateChange(template.id)}
              aria-pressed={active}
              className={`group relative w-full overflow-hidden rounded-2xl border text-left transition duration-200 ${
                active
                  ? 'border-slate-900 bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] ring-1 ring-slate-900'
                  : 'border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div
                className="relative h-11 overflow-hidden"
                style={{
                  background: `linear-gradient(125deg, ${template.brand.primary_color}, ${template.brand.accent_color})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-white/10" />
                <div className="absolute left-3 top-2.5 flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/55" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
                </div>
                <span className="absolute bottom-2 right-3 text-[8px] font-bold uppercase tracking-[0.18em] text-white/80">
                  Layout {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold leading-4">{template.label}</p>
                    <p className={`mt-1 text-[9px] leading-3.5 ${active ? 'text-white/65' : 'text-slate-500'}`}>
                      {template.tagline}
                    </p>
                  </div>
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                    active
                      ? 'border-white/25 bg-white text-slate-950'
                      : 'border-slate-200 bg-slate-50 text-transparent group-hover:border-slate-300'
                  }`}>
                    <Check size={11} strokeWidth={3} />
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature}
                      className={`rounded-md px-1.5 py-0.5 text-[8px] font-semibold ${
                        active ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className={`mt-2.5 flex items-center justify-between border-t pt-2.5 ${active ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: template.brand.primary_color }} />
                    <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: template.brand.accent_color }} />
                  </div>
                  <span className={`text-[8px] font-semibold ${active ? 'text-white/50' : 'text-slate-400'}`}>
                    Aa · {template.brand.font}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Brand kit</p>
        <Field label="Business name">
          <input value={brandKit.business_name || ''} onChange={(event) => onChange({ business_name: event.target.value })} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-2.5">
          <ColorField label="Primary" value={brandKit.primary_color} onChange={(primary_color) => onChange({ primary_color })} />
          <ColorField label="Accent" value={brandKit.accent_color} onChange={(accent_color) => onChange({ accent_color })} />
        </div>
        <Field label="Button style">
          <select value={brandKit.button_shape || 'rounded'} onChange={(event) => onChange({ button_shape: event.target.value })} className={inputClass}>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="pill">Pill</option>
          </select>
        </Field>
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Brand media</p>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="relative h-20 bg-slate-200">
              {media?.cover ? (
                <img src={media.cover} alt="" className="h-full w-full object-cover object-[center_28%]" />
              ) : (
                <div className="grid h-full place-items-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">Cover preview</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
              <div className="absolute bottom-2 left-2 flex items-end gap-2">
                <span className="relative h-9 w-9 overflow-hidden rounded-xl border-2 border-white bg-white shadow">
                  {media?.profile ? (
                    <img src={media.profile} alt="" className="h-full w-full object-cover object-top" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-[9px] font-bold text-slate-400">Photo</span>
                  )}
                </span>
                {brandKit.logo_url ? (
                  <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-lg border border-white/80 bg-white/95 p-1 shadow">
                    <img src={brandKit.logo_url} alt="" className="max-h-full max-w-full object-contain" />
                  </span>
                ) : null}
              </div>
            </div>
            <div className="space-y-2 p-2.5">
              <MediaPicker label="Cover image" hint="Wide banner · 1600×600 recommended" image={media?.cover} onUpload={(file) => onMediaUpload('cover', file)} tall />
              <MediaPicker label="Profile image" hint="Portrait photo · face near top" image={media?.profile} onUpload={(file) => onMediaUpload('profile', file)} circle />
              <MediaPicker label="Logo" hint="Transparent PNG works best" image={brandKit.logo_url} onUpload={(file) => onMediaUpload('logo', file)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inspector({ block, profile, onChange, onDelete, onDuplicate }) {
  const [tab, setTab] = useState('content');
  const [collectionDraft, setCollectionDraft] = useState('');
  useEffect(() => {
    setCollectionDraft('');
  }, [block?.id]);
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
  const collection = CONTENT_COLLECTIONS[block.type];
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
  const placeholders = {
    heading: block.type === 'hero' ? (profile?.headline || `Move smarter with ${name}`) : labelForBlock(block.type),
    body: block.type === 'hero' ? (profile?.tagline || '') : block.type === 'about' ? (profile?.about || '') : '',
  };

  const toggleHidden = (breakpoint) => {
    const hiddenOn = layout.hiddenOn || [];
    onChange(block.id, {
      layout: {
        hiddenOn: hiddenOn.includes(breakpoint)
          ? hiddenOn.filter((item) => item !== breakpoint)
          : [...hiddenOn, breakpoint],
      },
    });
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

      <div className="mt-4 flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        {['content', 'layout', 'style'].map((nameTab) => (
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
            <Field label="Heading">
              <input
                value={content.heading || ''}
                onChange={(event) => onChange(block.id, { content: { heading: event.target.value } })}
                className={inputClass}
                placeholder={placeholders.heading}
              />
            </Field>
            <Field label="Supporting copy">
              <textarea
                value={content.body || ''}
                onChange={(event) => onChange(block.id, { content: { body: event.target.value } })}
                className={`${inputClass} min-h-28 resize-y`}
                placeholder={placeholders.body || 'Add supporting copy…'}
              />
            </Field>
            <Field label="Button label">
              <input
                value={content.cta_label || ''}
                onChange={(event) => onChange(block.id, { content: { cta_label: event.target.value } })}
                className={inputClass}
                placeholder="Book a consultation"
              />
            </Field>
            <Field label="Button link">
              <input
                value={content.cta_url || ''}
                onChange={(event) => onChange(block.id, { content: { cta_url: event.target.value } })}
                className={inputClass}
                placeholder="https://…"
              />
            </Field>
            {!content.heading && placeholders.heading ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-800">
                Preview is using fallback copy until you save a heading here.
              </p>
            ) : null}
            {collection ? (
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
            {block.type === STOREFRONT_BLOCK_TYPES.EXPERTISE ? (
              <>
                <Field label="Services chips">
                  <textarea
                    key={`${block.id}-expertise-services`}
                    defaultValue={listToText(content.services)}
                    onBlur={(event) => onChange(block.id, { content: { services: textToList(event.target.value) } })}
                    className={`${inputClass} min-h-20 resize-y font-mono text-xs`}
                    placeholder="One per line"
                  />
                </Field>
                <Field label="Expertise chips">
                  <textarea
                    key={`${block.id}-expertise-expertise`}
                    defaultValue={listToText(content.expertise)}
                    onBlur={(event) => onChange(block.id, { content: { expertise: textToList(event.target.value) } })}
                    className={`${inputClass} min-h-20 resize-y font-mono text-xs`}
                    placeholder="One per line"
                  />
                </Field>
                <Field label="Areas chips">
                  <textarea
                    key={`${block.id}-expertise-areas`}
                    defaultValue={listToText(content.areas)}
                    onBlur={(event) => onChange(block.id, { content: { areas: textToList(event.target.value) } })}
                    className={`${inputClass} min-h-20 resize-y font-mono text-xs`}
                    placeholder="One per line"
                  />
                </Field>
              </>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS ? (
              <>
                <Field label="Highlights">
                  <textarea
                    key={`${block.id}-role-highlights`}
                    defaultValue={tupleArrayToText(content.highlights, ['title', 'text'])}
                    onBlur={(event) => onChange(block.id, { content: { highlights: textToTupleArray(event.target.value, ['title', 'text']) } })}
                    className={`${inputClass} min-h-24 resize-y font-mono text-xs`}
                    placeholder="One per line: Title | Description"
                  />
                </Field>
                <Field label="Proof chips">
                  <textarea
                    key={`${block.id}-role-proof`}
                    defaultValue={listToText(content.proof)}
                    onBlur={(event) => onChange(block.id, { content: { proof: textToList(event.target.value) } })}
                    className={`${inputClass} min-h-20 resize-y font-mono text-xs`}
                    placeholder="One per line"
                  />
                </Field>
              </>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.GUIDANCE ? (
              <>
                <Field label="Guide steps">
                  <textarea
                    key={`${block.id}-guide-steps`}
                    defaultValue={tupleArrayToText(content.steps, ['title', 'text'])}
                    onBlur={(event) => onChange(block.id, { content: { steps: textToTupleArray(event.target.value, ['title', 'text']) } })}
                    className={`${inputClass} min-h-24 resize-y font-mono text-xs`}
                    placeholder="One per line: Title | Description"
                  />
                </Field>
                <Field label="FAQs">
                  <textarea
                    key={`${block.id}-guide-faq`}
                    defaultValue={tupleArrayToText(content.faqs, ['q', 'a'])}
                    onBlur={(event) => onChange(block.id, { content: { faqs: textToTupleArray(event.target.value, ['q', 'a']) } })}
                    className={`${inputClass} min-h-24 resize-y font-mono text-xs`}
                    placeholder="One per line: Question | Answer"
                  />
                </Field>
              </>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.CTA ? (
              <Field label="CTA steps">
                <textarea
                  key={`${block.id}-cta-steps`}
                  defaultValue={tupleArrayToText(content.steps, ['label', 'title', 'description'])}
                  onBlur={(event) => onChange(block.id, { content: { steps: textToTupleArray(event.target.value, ['label', 'title', 'description']) } })}
                  className={`${inputClass} min-h-24 resize-y font-mono text-xs`}
                  placeholder="One per line: Label | Title | Description"
                />
              </Field>
            ) : null}
          </>
        ) : null}

        {tab === 'layout' ? (
          <>
            <Field label="Section variant">
              <select value={layout.variant || 'standard'} onChange={(event) => onChange(block.id, { layout: { variant: event.target.value } })} className={inputClass}>
                {SECTION_SETTINGS.variants.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Alignment">
              <select value={layout.alignment} onChange={(event) => onChange(block.id, { layout: { alignment: event.target.value } })} className={inputClass}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </Field>
            <Field label="Section padding">
              <select value={layout.padding} onChange={(event) => onChange(block.id, { layout: { padding: event.target.value } })} className={inputClass}>
                <option value="small">Compact</option>
                <option value="medium">Comfortable</option>
                <option value="large">Spacious</option>
              </select>
            </Field>
            <Field label="Container width">
              <select value={layout.width || 'full'} onChange={(event) => onChange(block.id, { layout: { width: event.target.value } })} className={inputClass}>
                {SECTION_SETTINGS.widths.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Columns">
                <select value={layout.columns || '3'} onChange={(event) => onChange(block.id, { layout: { columns: event.target.value } })} className={inputClass}>
                  {SECTION_SETTINGS.columns.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
              <Field label="Card style">
                <select value={layout.cardStyle || 'bordered'} onChange={(event) => onChange(block.id, { layout: { cardStyle: event.target.value } })} className={inputClass}>
                  {SECTION_SETTINGS.cardStyles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Media treatment">
              <select value={layout.mediaPosition || 'none'} onChange={(event) => onChange(block.id, { layout: { mediaPosition: event.target.value } })} className={inputClass}>
                {SECTION_SETTINGS.mediaPositions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Hide on">
              <div className="flex gap-1.5">
                {['desktop', 'tablet', 'mobile'].map((breakpoint) => (
                  <button
                    key={breakpoint}
                    type="button"
                    onClick={() => toggleHidden(breakpoint)}
                    className={`rounded-md border px-2.5 py-1.5 text-[11px] capitalize ${layout.hiddenOn?.includes(breakpoint) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'}`}
                  >
                    {breakpoint}
                  </button>
                ))}
              </div>
            </Field>
          </>
        ) : null}

        {tab === 'style' ? (
          <>
            <ColorField label="Background" value={style.background || '#ffffff'} onChange={(background) => onChange(block.id, { style: { background } })} />
            <ColorField label="Text color" value={style.textColor || '#0f172a'} onChange={(textColor) => onChange(block.id, { style: { textColor } })} />
            <Field label="Corner radius">
              <select value={style.radius} onChange={(event) => onChange(block.id, { style: { radius: event.target.value } })} className={inputClass}>
                <option value="none">Sharp</option>
                <option value="default">Soft</option>
                <option value="large">Rounded</option>
              </select>
            </Field>
            <Field label="Shadow depth">
              <select value={style.shadow || 'none'} onChange={(event) => onChange(block.id, { style: { shadow: event.target.value } })} className={inputClass}>
                {SECTION_SETTINGS.shadows.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
          </>
        ) : null}
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  const safe = /^#[0-9A-Fa-f]{6}$/.test(value || '') ? value : '#0f766e';
  return (
    <Field label={label}>
      <div className="flex h-10 overflow-hidden rounded-lg border border-slate-200">
        <input type="color" value={safe} onChange={(event) => onChange(event.target.value)} className="w-10 border-0 p-1" />
        <input value={value || ''} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 px-2.5 text-xs outline-none" maxLength={9} />
      </div>
    </Field>
  );
}

function MediaPicker({ label, hint, image, onUpload, tall = false, circle = false }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-slate-300 bg-white p-2.5 transition hover:border-slate-400 hover:bg-slate-50">
      <span className={`grid shrink-0 place-items-center overflow-hidden bg-slate-100 text-[9px] font-bold text-slate-400 ${circle ? 'h-11 w-11 rounded-full' : tall ? 'h-11 w-16 rounded-lg' : 'h-11 w-11 rounded-lg'}`}>
        {image ? <img src={image} alt="" className={`h-full w-full ${circle || !tall ? 'object-cover object-top' : 'object-cover object-[center_30%]'}`} /> : 'IMG'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-slate-700">{label}</span>
        <span className="block text-[10px] text-slate-400">{hint || 'Upload or replace'}</span>
      </span>
      <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => onUpload(event.target.files?.[0])} />
    </label>
  );
}

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5';
const iconButton = 'grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900';
