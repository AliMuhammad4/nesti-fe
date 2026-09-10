'use client';
import { useEffect, useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import {
  isProtectedBlockType,
  isSingletonBlockType,
  labelForBlock,
} from './storefrontBuilderState';
import { iconButton } from './builderUiPrimitives';
import { buildInspectorModel } from './inspector/inspectorModel';
import InspectorSelectionPanel from './inspector/InspectorSelectionPanel';
import InspectorContentTab from './inspector/InspectorContentTab';
import InspectorLayoutTab from './inspector/InspectorLayoutTab';
import InspectorStyleTab from './inspector/InspectorStyleTab';

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
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  media,
  onMediaUpload,
  brandKit,
  onBrandKitChange,
  templateKey,
}) {
  const [tab, setTab] = useState('content');
  const [collectionDraft, setCollectionDraft] = useState(null);
  const isElementSelection = Boolean(selection?.kind && selection.kind !== 'block');
  const isItemSelection = selection?.kind === 'item';
  const model = block
    ? buildInspectorModel({
        block,
        selection,
        profile,
        brandKit,
        templateKey,
        onChange,
      })
    : null;

  useEffect(() => {
    setCollectionDraft(null);
  }, [block?.id]);

  const allowContentTabForElementSelection = model?.allowContentTabForElementSelection ?? false;

  useEffect(() => {
    if (isElementSelection && tab === 'content' && !allowContentTabForElementSelection) setTab('layout');
  }, [isElementSelection, tab, allowContentTabForElementSelection]);

  if (!block || !model) {
    return (
      <div className="grid h-48 place-items-center px-4 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-700">No block selected</p>
          <p className="mt-1 text-xs text-slate-400">Click a layer or a section in the preview to edit it.</p>
        </div>
      </div>
    );
  }

  const { availableTabs, showSectionDesignTabs } = model;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Selected</p>
          <h2 className="mt-1 text-sm font-bold text-slate-900">{labelForBlock(block.type)}</h2>
        </div>
        <div className="flex gap-1">
          {!isSingletonBlockType(block.type, templateKey) ? (
            <button type="button" onClick={() => onDuplicate(block.id)} className={iconButton} title="Duplicate"><Copy size={14} /></button>
          ) : null}
          {!isProtectedBlockType(block.type) ? (
            <button type="button" onClick={() => onDelete(block.id)} className={`${iconButton} hover:border-red-200 hover:text-red-600`} title="Delete"><Trash2 size={14} /></button>
          ) : null}
        </div>
      </div>

      <InspectorSelectionPanel
        block={block}
        model={model}
        selection={selection}
        profile={profile}
        media={media}
        brandKit={brandKit}
        onChange={onChange}
        onItemChange={onItemChange}
        onItemAdd={onItemAdd}
        onItemDelete={onItemDelete}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onMediaUpload={onMediaUpload}
        onBrandKitChange={onBrandKitChange}
      />

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
              <InspectorContentTab
                block={block}
                model={model}
                profile={profile}
                templateKey={templateKey}
                media={media}
                brandKit={brandKit}
                collectionDraft={collectionDraft}
                setCollectionDraft={setCollectionDraft}
                onChange={onChange}
                onMediaUpload={onMediaUpload}
                onBrandKitChange={onBrandKitChange}
                onUndo={onUndo}
                onRedo={onRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                  />
                ) : null}
        {tab === 'layout' ? (
              <InspectorLayoutTab block={block} model={model} onChange={onChange} />
                ) : null}
        {tab === 'style' ? (
              <InspectorStyleTab block={block} model={model} onChange={onChange} />
                    ) : null}
                </div>
              </>
      ) : null}
    </>
  );
}
