import { arrayMove } from '@dnd-kit/sortable';
import { withServiceBenefitPatch } from '@/components/storefront/renderers/variants/broker/classic/brokerClassicServiceBenefits';
import { getStorefrontTemplate } from '../templates';
import { materializeTemplate } from '../templates';
import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';
import { CANONICAL_BLOCK_ORDER_TEMPLATES } from './builderWorkspaceConstants';
import { pinBoundaryBlocks } from './builderWorkspaceUtils';
import { patchContentPath } from './contentPath';
import {
  coerceCollectionItems,
  createBlock,
  createContentItemId,
  insertBlockAtTemplateRank,
  isProtectedBlockType,
  isSingletonBlockType,
  removeContentItem,
  rekeyContentItems,
  resolveContentItem,
  updateContentItem,
} from './storefrontBuilderState';

export function useBuilderBlockHandlers({
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
}) {
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

  const restoreSnapshot = (snapshot) => {
    if (!snapshot) return;
    if (Array.isArray(snapshot)) {
      onChange(snapshot);
      return;
    }
    if (snapshot.blocks) onChange(snapshot.blocks);
    if (snapshot.brandKit) onBrandKitChange(snapshot.brandKit);
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

  const confirmPendingAction = (confirmState) => {
    if (!confirmState) return;
    setConfirmState(null);
    if (confirmState.kind === 'apply-template') {
      pushSnapshotThen(() => onTemplateChange(confirmState.templateKey));
      return;
    }
    if (confirmState.kind === 'reset-template-defaults') {
      pushSnapshotThen(onResetTemplateDefaults);
    }
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
      content: updateContentItem(nextContent, nextSelection, (() => {
        const benefitKey = Object.keys(patch).find((key) => /^benefit_[0-2]$/.test(key));
        if (!benefitKey || selected.type !== STOREFRONT_BLOCK_TYPES.SERVICES || templateKey !== 'mortgage_broker-classic') {
          return patch;
        }
        const resolved = resolveContentItem(nextContent, nextSelection);
        return withServiceBenefitPatch(resolved?.item || {}, benefitKey, patch[benefitKey]);
      })()),
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
      updateBlock(blockId, {
        content: patchContentPath(content, contentKey, value),
      });
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
    const currentItem = materializedItems[index];
    const patch = /^benefit_[0-2]$/.test(itemField || '')
      ? withServiceBenefitPatch(currentItem, itemField, value)
      : { [itemField || 'text']: value };
    updateBlock(blockId, {
      content: updateContentItem(nextContent, {
        collection,
        itemId: resolvedItemId,
      }, patch),
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
    if (
      (templateKey === 'mortgage_broker-first-home' || templateKey === 'mortgage_broker-commercial')
      && selected?.type === STOREFRONT_BLOCK_TYPES.HERO
      && collection === 'slides'
      && resolvedItems.length <= 1
    ) {
      return;
    }
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
    if (
      selected?.type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS
      && collection === 'items'
      && currentItems.length >= 8
    ) return;
    if (
      selected?.type === STOREFRONT_BLOCK_TYPES.LENDER_NETWORK
      && collection === 'items'
      && currentItems.length >= 24
    ) return;
    const nextItems = [...currentItems, nextItem];
    const fieldLabel = collection === 'faqs'
      ? `FAQ ${nextItems.length}`
      : collection === 'steps'
        ? `Step ${nextItems.length}`
        : collection === 'highlights'
          ? `Highlight ${nextItems.length}`
          : collection === 'proof'
            ? `Proof ${nextItems.length}`
            : selected?.type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS
              ? `Client story ${nextItems.length}`
            : selected?.type === STOREFRONT_BLOCK_TYPES.SELLER_CASE_STUDY
              ? `Story card ${nextItems.length}`
              : selected?.type === STOREFRONT_BLOCK_TYPES.LENDER_NETWORK
                ? `Lender ${nextItems.length}`
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
      itemField: selected?.type === STOREFRONT_BLOCK_TYPES.TESTIMONIALS
        ? 'client_name'
        : collection === 'faqs' || collection === 'proof'
          ? (collection === 'proof' ? 'text' : 'q')
          : 'title',
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

  const addBlock = (type) => {
    const existing = normalized.find((block) => block.type === type);
    if (existing && isSingletonBlockType(type, templateKey)) {
      setSelectedId(existing.id);
      setSelectedElement({ blockId: existing.id, kind: 'block' });
      setInspectorOpen(true);
      setActivePanel('layers');
      return;
    }
    const block = createBlockForTemplate(type);
    const next = insertBlockAtTemplateRank(normalized, block, templateKey);
    commit(pinBoundaryBlocks(next, templateKey));
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
      const dropIndex = normalized.findIndex((item) => item.id === over.id);
      const droppedOnCanvas = over.id === 'canvas-dropzone';
      if (dropIndex < 0 && !droppedOnCanvas) return;
      const existing = normalized.find((block) => block.type === type);
      if (existing && isSingletonBlockType(type, templateKey)) {
        setSelectedId(existing.id);
        setInspectorOpen(true);
        setActivePanel('layers');
        return;
      }
      const block = createBlockForTemplate(type);
      const usesCanonicalOrder = CANONICAL_BLOCK_ORDER_TEMPLATES.has(templateKey);
      const next = usesCanonicalOrder
        ? insertBlockAtTemplateRank(normalized, block, templateKey)
        : [...normalized];
      if (!usesCanonicalOrder) {
        if (dropIndex >= 0) next.splice(dropIndex, 0, block);
        else {
          const footerIndex = next.findIndex((item) => item.type === 'footer');
          next.splice(footerIndex >= 0 ? footerIndex : next.length, 0, block);
        }
      }
      commit(pinBoundaryBlocks(next, templateKey));
      setSelectedId(block.id);
      setSelectedElement({ blockId: block.id, kind: 'block' });
      setInspectorOpen(true);
      setActivePanel('layers');
      return;
    }
    if (active.id === over.id) return;
    const oldIndex = normalized.findIndex((block) => block.id === active.id);
    const newIndex = normalized.findIndex((block) => block.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) {
      commit(pinBoundaryBlocks(arrayMove(normalized, oldIndex, newIndex), templateKey));
    }
  };

  return {
    commit,
    commitBrandKit,
    pushSnapshotThen,
    requestTemplateApplyConfirm,
    requestResetTemplateDefaultsConfirm,
    confirmPendingAction,
    updateBlock,
    updateSelectedItem,
    updateInlineContent,
    removeSelectedItem,
    addSelectedItem,
    removeBlock,
    duplicateBlock,
    addBlock,
    selectBlock,
    selectElement,
    undo,
    redo,
    handleDragEnd,
  };
}
