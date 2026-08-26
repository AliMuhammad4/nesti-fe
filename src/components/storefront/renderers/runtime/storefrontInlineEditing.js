const INLINE_TEXT_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,span,a,button,label,li,blockquote,strong,small';

export function isInlineTextTarget(node) {
  if (node.matches(INLINE_TEXT_SELECTOR)) return true;
  return Array.from(node.childNodes).some(
    (child) => child.nodeType === 3 && child.textContent.trim(),
  );
}

export function selectEditableText(node) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let current = walker.nextNode();
  while (current) {
    if (current.textContent) textNodes.push(current);
    current = walker.nextNode();
  }
  const selection = window.getSelection();
  selection?.removeAllRanges();
  if (!textNodes.length) return;
  const range = document.createRange();
  range.setStart(textNodes[0], 0);
  range.setEnd(textNodes[textNodes.length - 1], textNodes[textNodes.length - 1].textContent.length);
  selection?.addRange(range);
}

export function buildSelectedElementCss({ preview, selectedElement }) {
  return preview && selectedElement?.blockId && selectedElement?.field
    ? [
      `[data-storefront-block-id="${selectedElement.blockId}"]`,
      `[data-storefront-field="${selectedElement.field}"]`,
      selectedElement.itemId
        ? `[data-storefront-item-id="${selectedElement.itemId}"]`
        : (selectedElement.itemIndex != null && selectedElement.itemIndex !== ''
          ? `[data-storefront-item-index="${selectedElement.itemIndex}"]`
          : ''),
      selectedElement.itemField ? `[data-storefront-item-field="${selectedElement.itemField}"]` : '',
      selectedElement.instance !== undefined ? `[data-storefront-instance="${selectedElement.instance}"]` : '',
      '{outline:2px solid var(--color-primary, #0f766e);outline-offset:3px;border-radius:4px;}',
    ].join('')
    : '';
}

export function createInlineEditingHandlers({
  preview,
  block,
  onBlockSelect,
  onElementSelect,
  onInlineContentInput,
  onInlineContentChange,
}) {
  return {
    onClickCapture: (event) => {
      if (!preview) return;
      const target = event.target.closest?.('[data-storefront-field]');
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      if (target.contentEditable === 'true') return;
      const collection = target.dataset.storefrontCollection;
      const itemId = target.dataset.storefrontItemId;
      const itemIndexRaw = target.dataset.storefrontItemIndex;
      onElementSelect?.({
        blockId: block.id,
        kind: itemId || itemIndexRaw != null ? 'item' : 'field',
        field: target.dataset.storefrontField,
        source: target.dataset.storefrontSource || 'persisted',
        collection: collection || undefined,
        itemId: itemId || undefined,
        itemIndex: itemIndexRaw != null && itemIndexRaw !== '' ? Number(itemIndexRaw) : undefined,
        itemField: target.dataset.storefrontItemField || undefined,
        instance: target.dataset.storefrontInstance || undefined,
        label: target.dataset.storefrontLabel || target.dataset.storefrontField,
      });
      if (
        target.dataset.storefrontSource === 'profile'
        || !isInlineTextTarget(target)
      ) return;
      target.dataset.storefrontOriginalValue = target.textContent || '';
      target.dataset.storefrontOriginalHtml = target.innerHTML;
      target.contentEditable = 'true';
      target.spellcheck = true;
      target.classList.add('storefront-inline-editing');
      target.focus();
      selectEditableText(target);
    },
    onClick: () => {
      if (!preview) return;
      onBlockSelect?.(block.id);
    },
    onKeyDown: (event) => {
      if (!preview || !event.target.matches?.('[data-storefront-field][contenteditable="true"]')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.target.innerHTML = event.target.dataset.storefrontOriginalHtml || '';
        event.target.blur();
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        event.target.blur();
      }
    },
    onInput: (event) => {
      const target = event.target;
      if (!preview || !target.matches?.('[data-storefront-field][contenteditable="true"]')) return;
      onInlineContentInput?.({
        blockId: block.id,
        field: target.dataset.storefrontField,
        collection: target.dataset.storefrontCollection || undefined,
        itemId: target.dataset.storefrontItemId || undefined,
        itemIndex: target.dataset.storefrontItemIndex === undefined
          ? undefined
          : Number(target.dataset.storefrontItemIndex),
        itemField: target.dataset.storefrontItemField || undefined,
        instance: target.dataset.storefrontInstance || undefined,
        value: target.textContent || '',
      });
    },
    onBlur: (event) => {
      const target = event.target;
      if (!preview || !target.matches?.('[data-storefront-field][contenteditable="true"]')) return;
      const value = String(target.textContent || '');
      const originalValue = target.dataset.storefrontOriginalValue || '';
      target.contentEditable = 'false';
      target.spellcheck = false;
      target.classList.remove('storefront-inline-editing');
      delete target.dataset.storefrontOriginalValue;
      delete target.dataset.storefrontOriginalHtml;
      if (!value.trim()) {
        onInlineContentInput?.(null);
        onInlineContentChange?.({
          blockId: block.id,
          field: target.dataset.storefrontField,
          collection: target.dataset.storefrontCollection || undefined,
          itemId: target.dataset.storefrontItemId || undefined,
          itemIndex: target.dataset.storefrontItemIndex === undefined
            ? undefined
            : Number(target.dataset.storefrontItemIndex),
          itemField: target.dataset.storefrontItemField || undefined,
          instance: target.dataset.storefrontInstance || undefined,
          value: '',
        });
        return;
      }
      if (value === originalValue) {
        onInlineContentInput?.(null);
        return;
      }
      onInlineContentChange?.({
        blockId: block.id,
        field: target.dataset.storefrontField,
        collection: target.dataset.storefrontCollection || undefined,
        itemId: target.dataset.storefrontItemId || undefined,
        itemIndex: target.dataset.storefrontItemIndex === undefined
          ? undefined
          : Number(target.dataset.storefrontItemIndex),
        itemField: target.dataset.storefrontItemField || undefined,
        instance: target.dataset.storefrontInstance || undefined,
        value,
      });
    },
  };
}
