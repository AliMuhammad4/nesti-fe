"use client";

import { CallDetailEmptyState, CallDetailPreparingState } from "./CallDetailStates";

function SectionHeading({ children }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
        {children}
      </h3>
      <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
    </div>
  );
}

export default function CallNotesTab({
  notes,
  minutes,
  preparingNotes,
  minutesFailedMessage,
  minutesQuery,
}) {
  return (
    <div className="w-full">
      {preparingNotes ? (
        <CallDetailPreparingState
          title={
            notes.label === "Capturing minutes"
              ? "Nesti is listening"
              : "Preparing your minutes of meeting"
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
        <article className="space-y-7">
          <section className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] via-white to-white px-4 py-4 sm:px-5 sm:py-5">
            <SectionHeading>Summary</SectionHeading>
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-800 sm:text-base sm:leading-8">
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
                <SectionHeading>{label}</SectionHeading>
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li
                      key={`${label}-${index}`}
                      className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50/70 px-3.5 py-2.5 text-sm leading-6 text-gray-800"
                    >
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}

          {Array.isArray(minutes.action_items) && minutes.action_items.length ? (
            <section>
              <SectionHeading>Action items</SectionHeading>
              <ol className="space-y-2.5">
                {minutes.action_items.map((item, index) => (
                  <li
                    key={`${item.task}-${index}`}
                    className="flex gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm"
                  >
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary/10 text-[10px] font-bold tabular-nums text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {item.task}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-500">
                        {item.owner || "Unassigned"}
                        {item.due_date ? ` · Due ${item.due_date}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}
