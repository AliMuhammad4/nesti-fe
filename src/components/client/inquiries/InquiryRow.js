import { Building2, MessageSquare, UserRound } from "lucide-react";
import {
  formatDate,
  formatRole,
  formatStatus,
  inquirySubject,
  inquiryTitle,
  isPropertyInquiryItem,
  trimPreview,
} from "./inquiryUtils";

export default function InquiryRow({ item, onOpenChat, unread = 0 }) {
  const professional = item.professional || {};
  const property = item.property || null;
  const isProperty = isPropertyInquiryItem(item, property, professional);
  const subject = inquirySubject(item, property, professional);
  const title = inquiryTitle(item, property, professional);
  const messagePreview = trimPreview(item.message);
  const hasMessage = Boolean(messagePreview);
  const messageLabel = item.last_message_text ? "Recent" : "Inquiry";
  const unreadCount = Math.max(0, Number(unread) || 0);
  const roleLabel = formatRole(professional.professional_type);

  return (
    <article
      className={`rounded-xl border px-3.5 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-primary/20 hover:bg-white ${
        unreadCount > 0 ? "border-primary/30 bg-primary/5" : "border-gray-200/70 bg-white/80"
      }`}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(14rem,1.1fr)_minmax(16rem,1fr)_minmax(18rem,18rem)_10rem] sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          {professional.profile_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={professional.profile_image}
              alt={professional.full_name || "Professional"}
              className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
            />
          ) : (
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isProperty ? <Building2 size={14} /> : <UserRound size={14} />}
            </span>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-xs font-semibold text-gray-900">{title}</p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {formatStatus(item.status)}
              </span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {unreadCount > 99 ? "99+" : unreadCount} new
                </span>
              ) : null}
            </div>
            {subject ? <p className="mt-0.5 truncate text-[11px] font-medium text-gray-600">{subject}</p> : null}
          </div>
        </div>

        <div className="min-w-0 text-[11px] text-gray-500">
          <p className="truncate">
            {professional.full_name ? (
              <>
                <span className="font-medium text-gray-700">{professional.full_name}</span>
                {roleLabel ? ` · ${roleLabel}` : ""}
                {professional.company_name ? ` · ${professional.company_name}` : ""}
              </>
            ) : (
              "Inquiry submitted"
            )}
          </p>
          {professional.location ? <p className="mt-0.5 truncate text-[10px] text-gray-400">{professional.location}</p> : null}
        </div>

        <div className="min-w-0 sm:w-[18rem] sm:justify-self-start">
          {hasMessage ? (
            <p className="rounded-lg bg-gray-50/70 px-2.5 py-1.5 text-[11px] text-gray-500">
              <span className="font-medium text-gray-400">{messageLabel}: </span>
              {messagePreview}
            </p>
          ) : (
            <p className="rounded-lg bg-gray-50/70 px-2.5 py-1.5 text-[11px] text-gray-400">No message added</p>
          )}
        </div>

        <div className="grid shrink-0 grid-cols-[4.5rem_2rem] items-center gap-2 sm:w-[7rem] sm:justify-self-end">
          <span className="text-right text-[10px] font-medium text-gray-400">{formatDate(item.updated_at || item.created_at)}</span>
          <div className="flex min-w-0 items-center justify-end">
            {item.thread_id ? (
              <button
                type="button"
                onClick={() => onOpenChat(item.thread_id)}
                className={`relative grid h-7 w-7 place-items-center rounded-lg border text-primary transition hover:bg-primary hover:text-white ${
                  unreadCount > 0 ? "border-emerald-300 bg-emerald-50" : "border-primary/15 bg-primary/10"
                }`}
                aria-label={unreadCount > 0 ? `Open conversation, ${unreadCount} unread` : "Open conversation"}
                title={unreadCount > 0 ? `${unreadCount} new message${unreadCount === 1 ? "" : "s"}` : "Open conversation"}
              >
                <MessageSquare size={13} />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                ) : null}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
