"use client";

import { FileText, Loader2 } from "lucide-react";

export function CallDetailPreparingState({ title, message }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-primary/20 bg-primary/[0.03] px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
      </div>
      <div className="max-w-sm">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-1.5 text-xs leading-5 text-gray-500">{message}</p>
      </div>
    </div>
  );
}

export function CallDetailEmptyState({ message }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-gray-400 ring-1 ring-gray-200">
        <FileText size={18} aria-hidden="true" />
      </div>
      <p className="max-w-sm text-sm leading-6 text-gray-500">{message}</p>
    </div>
  );
}
