import { ClipboardList, Loader2 } from "lucide-react";
import InquiryRow from "./InquiryRow";
import { FILTER_TABS, INQUIRIES_PER_PAGE } from "./inquiryUtils";

export default function InquiriesOverview({
  isLoading,
  isError,
  error,
  isFetching,
  items,
  counts,
  unreadByThread,
  activeFilter,
  currentPage,
  totalItems,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onFilterChange,
  onPageChange,
  onOpenChat,
  onBrowseProperties,
  onViewRecommendations,
}) {
  return (
    <div className="min-h-screen w-full px-4 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 ring-1 ring-primary/20">
            <ClipboardList size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">My Inquiries</h1>
            <p className="truncate text-xs text-gray-600">Track property requests and professional inquiries</p>
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id || "all"}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                  active ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {!isLoading && !isError ? (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Total", value: counts.total },
            { label: "Agents", value: counts.agents },
            { label: "Lawyers", value: counts.lawyers },
            { label: "Brokers", value: counts.brokers },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{stat.label}</p>
              <p className="text-sm font-semibold tabular-nums text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gray-200 bg-white py-8 shadow-sm">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="mt-2 text-xs text-gray-500">Loading inquiries...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-red-600 shadow-sm">
          {error?.message || "Failed to load inquiries."}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center shadow-sm">
          <ClipboardList size={32} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-900">No inquiries yet</p>
          <p className="mt-1 text-xs text-gray-500">Inquire on a property or message a professional to get started.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onBrowseProperties}
              className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary-dark"
            >
              Browse properties
            </button>
            <button
              type="button"
              onClick={onViewRecommendations}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:text-primary"
            >
              Recommendations
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid w-full gap-3">
            {items.map((item) => {
              const threadId = String(item?.thread_id || "").trim();
              const unread = threadId ? Number(unreadByThread?.[threadId] || 0) : 0;
              return (
                <InquiryRow
                  key={item.id}
                  item={item}
                  unread={unread}
                  onOpenChat={() => onOpenChat(item, threadId)}
                />
              );
            })}
          </div>
          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-medium text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {(currentPage - 1) * INQUIRIES_PER_PAGE + 1}-{Math.min(currentPage * INQUIRIES_PER_PAGE, totalItems)}
                </span>{" "}
                of <span className="font-semibold text-gray-800">{totalItems}</span> inquiries
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={!hasPrevPage || isFetching}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-[11px] font-semibold text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={!hasNextPage || isFetching}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
