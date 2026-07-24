'use client';

import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { labelForBlock } from './storefrontBuilderState';

function LibraryBlock({ type, onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `library-${type}`, data: { fromLibrary: true, type } });
  return (
    <div
      ref={setNodeRef}
      className={`group flex min-h-10 items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-900 hover:shadow-sm ${isDragging ? 'opacity-40' : ''}`}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        className="grid h-7 w-7 shrink-0 cursor-grab place-items-center rounded-md text-slate-400 hover:bg-white hover:text-emerald-600 active:cursor-grabbing"
        aria-label={`Drag ${labelForBlock(type)} into the page`}
        title="Drag into page"
      >
        <GripVertical size={13} />
      </button>
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 px-1.5 py-1 text-left text-[10px] font-semibold leading-3.5"
      >
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-400 transition group-hover:bg-white group-hover:text-emerald-600">
          <Plus size={11} />
        </span>
        <span className="truncate">{labelForBlock(type)}</span>
      </button>
    </div>
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

export { LibraryBlock, SortableLayer };
