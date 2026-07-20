"use client";

/**
 * Structured workspace notification toast (socket → react-toastify).
 * Uses icon: false on the toast so layout is not split by the default info glyph.
 */
export default function WorkspaceRichToast({
  title,
  preview = "",
  actionLabel = "",
  onAction,
}) {
  const hasAction = typeof onAction === "function" && Boolean(actionLabel);

  if (!hasAction) {
    return (
      <div className="min-w-0 space-y-1 text-left">
        <p className="text-[13px] font-semibold leading-snug text-slate-900">{title}</p>
        {preview ? (
          <p className="text-[12px] font-normal leading-relaxed text-slate-600">{preview}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 text-left">
      <div className="min-w-0 space-y-1 pr-1">
        <p className="text-[13px] font-semibold leading-snug text-slate-900">{title}</p>
        {preview ? (
          <p className="text-[12px] font-normal leading-relaxed text-slate-600">{preview}</p>
        ) : null}
      </div>
      <div className="flex items-center justify-end">
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
