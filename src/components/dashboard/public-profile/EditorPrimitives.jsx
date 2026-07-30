import { ArrowDown, ArrowUp, GripVertical, Trash2 } from 'lucide-react';
import { blockLabel, editorInputClass } from './editorConstants';

export function EditorCard({ title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-0.5 text-[11px] leading-4 text-text-muted">{description}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function EditorField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">{label}</span>
      {children}
    </label>
  );
}

export function ColorInput({ value, onChange }) {
  return (
    <div className="flex h-9 overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
      <input aria-label="Choose color" type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-full w-10 border-0 bg-transparent p-1" />
      <input value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 border-0 px-2 text-xs text-slate-700 outline-none" maxLength={9} />
    </div>
  );
}

export function MediaUploadControl({ label, imageUrl, onUpload, busy, circle = false }) {
  return (
    <label className="group flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-2 transition hover:border-primary/60 hover:bg-primary/[0.03]">
      <div className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden bg-slate-100 text-[10px] font-bold text-slate-400 ${circle ? 'rounded-full' : 'rounded-lg'}`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : 'IMG'}
      </div>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-semibold text-slate-700">{label}</span>
        <span className="block text-[10px] text-slate-400">{busy ? 'Uploading…' : 'Upload image'}</span>
      </span>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} className="sr-only" onChange={(event) => onUpload(event.target.files?.[0])} />
    </label>
  );
}

export function BlockEditor({ block, isFirst, isLast, onMove, onUpdate, onRemove, isDragging, onDragStart, onDragEnd, onDrop }) {
  const content = block.content || {};

  return (
    <details
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', block.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className={`group rounded-lg border bg-white transition ${isDragging ? 'border-primary/50 opacity-60 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2.5">
        <GripVertical size={15} className="cursor-grab text-slate-300 active:cursor-grabbing" />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{blockLabel(block.type)}</span>
        <span onClick={(event) => event.stopPropagation()} className="flex items-center gap-1">
          <button type="button" aria-label={`Move ${blockLabel(block.type)} up`} disabled={isFirst} onClick={() => onMove(-1)} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={14} /></button>
          <button type="button" aria-label={`Move ${blockLabel(block.type)} down`} disabled={isLast} onClick={() => onMove(1)} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={14} /></button>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={block.enabled} onChange={(e) => onUpdate(block.id, { enabled: e.target.checked })} className="peer sr-only" />
            <span className="h-5 w-9 rounded-full bg-slate-200 transition peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
          </label>
        </span>
      </summary>
      <div className="border-t border-slate-100 px-3 py-2.5">
        <div className="grid gap-2 sm:grid-cols-2">
          <EditorField label="Section heading">
            <input value={content.heading || ''} onChange={(e) => onUpdate(block.id, { content: { ...content, heading: e.target.value } })} className={editorInputClass} placeholder={blockLabel(block.type)} />
          </EditorField>
          <EditorField label="Button label">
            <input value={content.cta_label || ''} onChange={(e) => onUpdate(block.id, { content: { ...content, cta_label: e.target.value } })} className={editorInputClass} placeholder="Get in touch" />
          </EditorField>
        </div>
        <EditorField label="Supporting copy">
          <textarea value={content.body || ''} onChange={(e) => onUpdate(block.id, { content: { ...content, body: e.target.value } })} className="mt-1 min-h-[54px] w-full resize-y rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10" placeholder="Optional short description for this section" maxLength={500} />
        </EditorField>
        <button type="button" onClick={() => onRemove(block.id)} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700">
          <Trash2 size={13} /> Remove block
        </button>
      </div>
    </details>
  );
}
