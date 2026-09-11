import { Check, Globe2, Monitor, Smartphone, Sparkles, Tablet } from 'lucide-react';

export default function PublicProfileEmptyState() {
  return (
    <div className="border-t border-slate-100 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 shadow-sm sm:p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
            <Sparkles size={13} />
            Start your website
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
            Build a polished public page in minutes
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            No page draft exists yet. Generate your first draft to instantly get a complete, branded layout tailored to your professional role.
          </p>
          <p className="mt-4 text-xs font-medium text-slate-500">
            Use the <span className="font-semibold text-slate-700">Generate draft</span> button in the top-right to start.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/70 bg-white/80 p-3">
              <div className="mb-1 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Check size={14} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Step 1</p>
              <p className="mt-1 text-xs font-semibold text-slate-800">Generate AI draft</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-500">Create a complete website structure with role-based content.</p>
            </div>
            <div className="rounded-xl border border-white/70 bg-white/80 p-3">
              <div className="mb-1 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
                <Smartphone size={14} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Step 2</p>
              <p className="mt-1 text-xs font-semibold text-slate-800">Customize sections</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-500">Adjust text, colors, media, and layout for your brand.</p>
            </div>
            <div className="rounded-xl border border-white/70 bg-white/80 p-3">
              <div className="mb-1 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Globe2 size={14} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Step 3</p>
              <p className="mt-1 text-xs font-semibold text-slate-800">Publish live</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-500">Share your URL and start receiving leads from visitors.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Preview layout</p>
              <p className="text-[11px] text-slate-500">Your generated draft will appear like this</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
              <span className="grid h-6 w-6 place-items-center rounded bg-white text-primary shadow-sm"><Monitor size={12} /></span>
              <span className="grid h-6 w-6 place-items-center text-slate-400"><Tablet size={12} /></span>
              <span className="grid h-6 w-6 place-items-center text-slate-400"><Smartphone size={12} /></span>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
              <div className="h-2.5 w-28 rounded-full bg-slate-200" />
              <div className="flex gap-1.5">
                <div className="h-2 w-8 rounded-full bg-slate-100" />
                <div className="h-2 w-8 rounded-full bg-slate-100" />
                <div className="h-2 w-8 rounded-full bg-slate-100" />
              </div>
            </div>
            <div className="h-24 bg-gradient-to-r from-primary/90 via-primary/80 to-slate-800/90 p-3">
              <div className="h-2 w-14 rounded-full bg-white/35" />
              <div className="mt-3 h-3 w-3/4 rounded-full bg-white/65" />
              <div className="mt-1.5 h-3 w-2/3 rounded-full bg-white/45" />
              <div className="mt-3 h-6 w-24 rounded-md bg-white/85" />
            </div>
            <div className="space-y-2 bg-white p-3">
              <div className="rounded-lg border border-slate-100 p-2.5">
                <div className="h-2.5 w-24 rounded-full bg-slate-200" />
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100" />
                <div className="mt-1 h-2 w-4/5 rounded-full bg-slate-100" />
              </div>
              <div className="rounded-lg border border-slate-100 p-2.5">
                <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100" />
                <div className="mt-1 h-2 w-3/4 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
