'use client';

export default function BuilderConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[120] grid place-items-center bg-slate-900/28 p-5 backdrop-blur-[1px]">
      <div className="w-full max-w-[26.5rem] rounded-[18px] border border-slate-200/90 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.16)]">
        <h3 className="text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-slate-900">{title}</h3>
        <p className="mt-1.5 text-[13px] leading-[1.55] text-slate-600">{description}</p>
        <div className="mt-3.5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-[13px] font-medium text-slate-700 transition-all duration-150 hover:bg-slate-200 active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full border border-emerald-700 bg-emerald-600 px-4 py-1.5 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
