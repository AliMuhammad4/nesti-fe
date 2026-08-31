import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react';
import { Field, inputClass } from '../builderUiPrimitives';

export const CONTENT_ADD_CLASS = 'flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-500 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400';
export const SELECTION_ADD_CLASS = 'flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400';
export const DELETE_ICON_SHRINK = 'grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600';
export const DELETE_ICON = 'grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600';
export const RESET_SURFACE_CLASS = 'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50';

export function bindContent(onChange, blockId) {
  return (key) => (value) => onChange(blockId, { content: { [key]: value } });
}

export function DashedAddButton({ disabled, onClick, children, variant = 'content' }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={variant === 'selection' ? SELECTION_ADD_CLASS : CONTENT_ADD_CLASS}
    >
      <Plus size={13} />
      {children}
    </button>
  );
}

export function DeleteIconButton({ onClick, label, shrink = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={shrink ? DELETE_ICON_SHRINK : DELETE_ICON}
      aria-label={label}
    >
      <Trash2 size={12} />
    </button>
  );
}

function CollectionRowActions({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  deleteLabel,
}) {
  const actions = [
    [ArrowUp, onMoveUp, 'Move item up'],
    [ArrowDown, onMoveDown, 'Move item down'],
    [Copy, onDuplicate, 'Duplicate item'],
  ];
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {actions.map(([Icon, handler, label]) => (
        handler ? (
          <button key={label} type="button" onClick={handler} className={DELETE_ICON} aria-label={label}>
            <Icon size={12} />
          </button>
        ) : null
      ))}
      <DeleteIconButton onClick={onDelete} label={deleteLabel} shrink />
    </div>
  );
}

export function InspectorEyebrow({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{children}</p>;
}

export function InspectorHint({ children }) {
  return <p className="mt-1.5 text-[10px] leading-4 text-slate-400">{children}</p>;
}

export function InspectorNote({ tone = 'slate', children }) {
  const className = tone === 'amber'
    ? 'rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-800'
    : tone === 'plain-amber'
      ? 'rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-800'
      : 'rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500';
  return <p className={className}>{children}</p>;
}

export function ResetSurfaceButton({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className={RESET_SURFACE_CLASS}>
      {children}
    </button>
  );
}

export function InspectorInput({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        placeholder={placeholder}
      />
    </Field>
  );
}

export function InspectorTextarea({ label, value, onChange, placeholder, className = 'min-h-20 resize-y' }) {
  return (
    <Field label={label}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} ${className}`}
        placeholder={placeholder}
      />
    </Field>
  );
}

function IndexBadge({ index, pad = true }) {
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
      {pad ? String(index + 1).padStart(2, '0') : index + 1}
    </span>
  );
}

function RowTitle({ children }) {
  return <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">{children}</span>;
}

export function CompactCollectionRow({
  index,
  title,
  fallback,
  onDelete,
  deleteLabel,
  padIndex = true,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
      <IndexBadge index={index} pad={padIndex} />
      <RowTitle>{title || fallback}</RowTitle>
      <CollectionRowActions {...{ onMoveUp, onMoveDown, onDuplicate, onDelete, deleteLabel }} />
    </div>
  );
}

export function StackedCollectionRow({
  index,
  title,
  fallback,
  onDelete,
  deleteLabel,
  children,
  shrinkDelete = true,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
      <div className="flex items-center gap-2">
        <IndexBadge index={index} />
        <RowTitle>{title || fallback}</RowTitle>
        <CollectionRowActions {...{ onMoveUp, onMoveDown, onDuplicate, onDelete, deleteLabel }} shrink={shrinkDelete} />
      </div>
      {children}
    </div>
  );
}

export function NestedCollectionRow({
  stacked,
  index,
  title,
  fallback,
  onDelete,
  deleteLabel,
  children,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}) {
  return (
    <div
      className={stacked
        ? 'space-y-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2'
        : 'flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5'}
    >
      <div className="flex items-center gap-2">
        <IndexBadge index={index} />
        <RowTitle>{title || fallback}</RowTitle>
        <CollectionRowActions {...{ onMoveUp, onMoveDown, onDuplicate, onDelete, deleteLabel }} />
      </div>
      {children}
    </div>
  );
}
