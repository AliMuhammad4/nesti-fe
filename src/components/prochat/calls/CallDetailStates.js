"use client";

import { Loader2 } from "lucide-react";

export function CallDetailPreparingState({ title, message }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100">
        <Loader2 className="h-6 w-6 animate-spin text-slate-700" aria-hidden="true" />
      </div>
      <div className="max-w-sm">
        <p className="text-[15px] font-semibold text-slate-900">{title}</p>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">{message}</p>
      </div>
    </div>
  );
}

export function CallDetailEmptyState({ message }) {
  return (
    <div className="rounded-xl bg-slate-50 px-5 py-8 text-center text-sm leading-6 text-slate-500">
      {message}
    </div>
  );
}
