"use client";

import { CallDetailEmptyState, CallDetailPreparingState } from "./CallDetailStates";

export default function CallNotesTab({
  notes,
  minutes,
  preparingNotes,
  minutesFailedMessage,
  minutesQuery,
}) {
  return (
    <div>
      {preparingNotes ? (
        <CallDetailPreparingState
          title={
            notes.label === "Taking notes"
              ? "Nesti Notetaker is listening"
              : "Preparing your notes"
          }
          message={notes.emptyMinutes || notes.detail}
        />
      ) : null}
      {!preparingNotes && !minutes ? (
        <CallDetailEmptyState
          message={
            minutesQuery.data?.processing?.status === "failed"
              ? minutesFailedMessage
              : notes.emptyMinutes
          }
        />
      ) : null}
      {minutes ? (
        <div className="space-y-7">
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Summary
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-slate-800">
              {minutes.summary || "No summary."}
            </p>
          </section>
          {[
            ["Topics", minutes.topics],
            ["Decisions", minutes.decisions],
            ["Follow-ups", minutes.follow_ups],
          ].map(([label, items]) =>
            Array.isArray(items) && items.length ? (
              <section key={label}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {label}
                </h3>
                <ul className="mt-2 space-y-2 text-[15px] leading-7 text-slate-800">
                  {items.map((item, index) => (
                    <li key={`${label}-${index}`} className="flex gap-2.5">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}
          {Array.isArray(minutes.action_items) && minutes.action_items.length ? (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Action items
              </h3>
              <div className="mt-3 space-y-2">
                {minutes.action_items.map((item, index) => (
                  <div
                    key={`${item.task}-${index}`}
                    className="rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-slate-900">{item.task}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.owner || "Unassigned"}
                      {item.due_date ? ` · Due ${item.due_date}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
