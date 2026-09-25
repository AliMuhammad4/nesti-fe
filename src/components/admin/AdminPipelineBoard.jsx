"use client";

const COLUMNS = [
  { key: "new", label: "To call", hint: "Demo or contact, no plan yet." },
  { key: "calling", label: "In conversation", hint: "Maya has already called." },
  { key: "ready", label: "Ready to join", hint: "Interested in a subscription." },
];

export default function AdminPipelineBoard({ items = [], selectedId = "", onSelect }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {COLUMNS.map((column) => {
        const rows = items.filter((item) => item.stage === column.key);
        return (
          <section key={column.key} className="rounded-2xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">{column.label}</h3>
                <p className="text-[11px] text-slate-500">{column.hint}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{rows.length}</span>
            </header>
            <div className="max-h-64 space-y-2 overflow-y-auto p-2">
              {rows.length ? rows.map((row) => {
                const active = selectedId && selectedId === row.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => onSelect?.(row)}
                    className={`w-full rounded-xl border px-3 py-2 text-left ${active ? "border-slate-900 bg-slate-50" : "border-slate-100 bg-white hover:border-slate-300"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-950">{row.name || "Unnamed"}</p>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                        {row.source}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500">{row.phone || row.email || "No contact yet"}</p>
                    <p className="mt-1 text-[11px] capitalize text-slate-400">{String(row.role || "lead").replaceAll("_", " ")} · no plan{row.voice_outcome ? ` · ${row.voice_outcome.replaceAll("_", " ")}` : ""}</p>
                  </button>
                );
              }) : (
                <p className="px-2 py-6 text-center text-xs text-slate-400">Nobody in this step.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
