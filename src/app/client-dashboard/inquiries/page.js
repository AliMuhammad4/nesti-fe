"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import {
  Building2,
  ClipboardList,
  Loader2,
  MessageSquare,
  X,
  UserRound,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchClientInquiries } from "@/lib/clientInquiriesClient";
import { getSocketOrigin } from "@/lib/api";
import { fetchProChatThreadMessages, uploadProChatThreadAttachment } from "@/lib/proChatClient";
import ThreadMessagesList from "@/components/prochat/thread/ThreadMessagesList";
import ThreadComposer from "@/components/prochat/thread/ThreadComposer";
import { safeUuid } from "@/components/prochat/thread/proChatThreadUtils";
import { clearUnread } from "@/store/proChatSlice";

const FILTER_TABS = [
  { id: "", label: "All" },
  { id: "property", label: "Properties" },
  { id: "professional", label: "Professionals" },
];

function formatRole(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatPrice(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const numeric = Number(raw.replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numeric);
  }
  return raw;
}

function formatStatus(value) {
  const normalized = String(value || "new").trim().replace(/_/g, " ");
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function inquiryTitle(item, property, professional) {
  if (item.inquiry_type === "property") return "Property inquiry";
  const role = formatRole(professional?.professional_type || "professional");
  return `${role} inquiry`;
}

function inquirySubject(item, property, professional) {
  if (item.inquiry_type === "property") {
    return [property?.title, property?.price ? formatPrice(property.price) : ""].filter(Boolean).join(" · ");
  }
  return [professional?.full_name, professional?.company_name].filter(Boolean).join(" · ") || "Professional profile";
}

function trimPreview(value, max = 72) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function InquiryRow({ item, onOpenChat, unread = 0 }) {
  const professional = item.professional || {};
  const property = item.property || null;
  const isProperty = item.inquiry_type === "property";
  const subject = inquirySubject(item, property, professional);
  const title = inquiryTitle(item, property, professional);
  const messagePreview = trimPreview(item.message);
  const hasMessage = Boolean(messagePreview);
  const unreadCount = Math.max(0, Number(unread) || 0);

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
              className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
            />
          ) : (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isProperty ? <Building2 size={16} /> : <UserRound size={16} />}
            </span>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                {formatStatus(item.status)}
              </span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {unreadCount > 99 ? "99+" : unreadCount} new
                </span>
              ) : null}
            </div>
            {subject ? <p className="mt-0.5 truncate text-sm font-semibold text-gray-700">{subject}</p> : null}
          </div>
        </div>

        <div className="min-w-0 text-xs text-gray-500">
          <p className="truncate">
            {professional.full_name ? (
              <>
                <span className="font-semibold text-gray-700">{professional.full_name}</span>
                {professional.professional_type ? ` · ${formatRole(professional.professional_type)}` : ""}
                {professional.company_name ? ` · ${professional.company_name}` : ""}
              </>
            ) : (
              "Inquiry submitted"
            )}
          </p>
          {professional.location ? <p className="mt-0.5 truncate text-gray-400">{professional.location}</p> : null}
        </div>

        <div className="min-w-0 sm:w-[18rem] sm:justify-self-start">
          {hasMessage ? (
            <p className="rounded-lg bg-gray-50/70 px-2.5 py-1.5 text-xs text-gray-500">
              <span className="font-semibold text-gray-400">Inquiry: </span>
              {messagePreview}
            </p>
          ) : (
            <p className="rounded-lg bg-gray-50/70 px-2.5 py-1.5 text-xs text-gray-400">No message added</p>
          )}
        </div>

        <div className="grid shrink-0 grid-cols-[4.5rem_2rem] items-center gap-2 sm:w-[7rem] sm:justify-self-end">
          <span className="text-right text-[11px] font-medium text-gray-400">{formatDate(item.updated_at || item.created_at)}</span>
          <div className="flex min-w-0 items-center justify-end">
            {item.thread_id ? (
              <button
                type="button"
                onClick={() => onOpenChat(item.thread_id)}
                className={`relative grid h-8 w-8 place-items-center rounded-lg border text-primary transition hover:bg-primary hover:text-white ${
                  unreadCount > 0 ? "border-emerald-300 bg-emerald-50" : "border-primary/15 bg-primary/10"
                }`}
                aria-label={unreadCount > 0 ? `Open conversation, ${unreadCount} unread` : "Open conversation"}
                title={unreadCount > 0 ? `${unreadCount} new message${unreadCount === 1 ? "" : "s"}` : "Open conversation"}
              >
                <MessageSquare size={14} />
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

function InquiryChatDrawer({ item, token, myUserId, onClose }) {
  const dispatch = useAppDispatch();
  const threadId = String(item?.thread_id || "").trim();
  const professional = item?.professional || {};
  const title = item ? inquiryTitle(item, item.property || null, professional) : "Inquiry";
  const subject = item ? inquirySubject(item, item.property || null, professional) : "";
  const scrollRef = useRef(null);
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentAt = useRef(0);
  const socketRef = useRef(null);
  const [draft, setDraft] = useState("");
  const [draftAttachments, setDraftAttachments] = useState([]);
  const [uploadingAttachments, setUploadingAttachments] = useState([]);
  const [liveMessages, setLiveMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messagesQuery = useQuery({
    queryKey: ["inquiry-thread-messages", token, threadId],
    enabled: Boolean(token && threadId),
    queryFn: () => fetchProChatThreadMessages({ token, id: threadId, page: 1, limit: 100, client: true }),
    staleTime: 10_000,
  });

  const messages = useMemo(() => {
    const fromApi = Array.isArray(messagesQuery.data?.items) ? messagesQuery.data.items : [];
    const merged = [...fromApi];
    const seen = new Set(merged.map((message) => String(message?.id || "")));
    for (const message of liveMessages) {
      const id = String(message?.id || "");
      if (!id || seen.has(id)) continue;
      seen.add(id);
      merged.push(message);
    }
    merged.sort((a, b) => new Date(a?.created_at || 0).getTime() - new Date(b?.created_at || 0).getTime());
    return merged;
  }, [messagesQuery.data?.items, liveMessages]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (threadId) dispatch(clearUnread({ threadId }));
  }, [dispatch, threadId, messages.length]);

  useEffect(() => {
    if (!item || typeof document === "undefined") return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [item]);

  useEffect(() => {
    setLiveMessages([]);
    setDraft("");
    setDraftAttachments([]);
    setUploadingAttachments([]);
  }, [threadId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, messagesQuery.isLoading]);

  useEffect(() => {
    if (!token || !threadId) return undefined;
    const origin = getSocketOrigin();
    if (!origin) return undefined;
    const sessionToken = String(token).trim().replace(/^Bearer\s+/i, "");
    const socket = io(origin, {
      path: "/socket.io",
      auth: { token: sessionToken },
      transports: ["polling", "websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("prochat:join", { thread_id: threadId });
    });
    socket.on("disconnect", () => setConnected(false));
    const onMessage = (message) => {
      if (!message || String(message.thread_id) !== String(threadId)) return;
      setLiveMessages((prev) => {
        if (prev.some((item) => String(item?.id) === String(message.id))) return prev;
        return [...prev, message];
      });
    };
    socket.on("prochat:message", onMessage);
    const onTyping = (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      if (myUserId && String(payload.user_id) === String(myUserId)) return;
      setOtherTyping(Boolean(payload.is_typing));
    };
    socket.on("prochat:typing", onTyping);
    return () => {
      socket.off("prochat:message", onMessage);
      socket.off("prochat:typing", onTyping);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, threadId, myUserId]);

  const autosizeComposer = () => {
    const el = composerRef.current;
    if (!el) return;
    try {
      el.style.height = "0px";
      const next = Math.min(el.scrollHeight || 0, 180);
      el.style.height = `${Math.max(next, 44)}px`;
      el.style.overflowY = (el.scrollHeight || 0) > 180 ? "auto" : "hidden";
    } catch {
      // ignore
    }
  };

  const emitTyping = (isTyping) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected || !threadId) return;
    socket.emit("prochat:typing", { thread_id: threadId, is_typing: Boolean(isTyping) });
  };

  const sendMessage = async () => {
    const text = String(draft || "").trim();
    const atts = Array.isArray(draftAttachments) ? draftAttachments : [];
    if (!text && atts.length < 1) return;
    if (uploadingAttachments.length > 0) {
      toast.info("Please wait for attachments to finish uploading.");
      return;
    }
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      toast.error("Chat not connected yet. Try again.");
      return;
    }
    const client_id = `inquiry:${String(item?.id || threadId)}:${safeUuid()}`;
    const prevAttachments = atts;
    setDraft("");
    setDraftAttachments([]);
    requestAnimationFrame(() => autosizeComposer());
    socket.emit(
      "prochat:send",
      { thread_id: threadId, body: text, client_id, attachments: prevAttachments },
      (ack) => {
        if (!ack?.success) {
          toast.error(ack?.message || "Could not send message");
          setDraft(text);
          setDraftAttachments(prevAttachments);
          return;
        }
        const message = ack?.message;
        if (message) {
          setLiveMessages((prev) => {
            if (prev.some((item) => String(item?.id) === String(message.id))) return prev;
            return [...prev, message];
          });
        }
      },
    );
  };

  if (!item || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483000] flex w-screen justify-end overflow-hidden bg-black/25"
      role="dialog"
      aria-modal="true"
      style={{ height: "100dvh" }}
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close inquiry chat" onClick={onClose} />
      <aside className="relative flex w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl" style={{ height: "100dvh" }}>
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Inquiry conversation</p>
            <h2 className="truncate text-base font-bold text-gray-900">{title}</h2>
            {subject ? <p className="mt-0.5 truncate text-xs text-gray-500">{subject}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-gray-50/40 p-4">
          {messagesQuery.isLoading ? (
            <div className="flex h-full min-h-[220px] items-center justify-center text-gray-400">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : messages.length ? (
            <ThreadMessagesList
              messages={messages}
              myUserId={myUserId}
              isGroup={false}
              membersById={new Map()}
              otherUser={professional}
            />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center text-center">
              <div>
                <MessageSquare size={24} className="mx-auto text-gray-300" />
                <p className="mt-2 text-sm font-semibold text-gray-800">No messages yet</p>
                <p className="mt-1 text-xs text-gray-500">Start the conversation about this inquiry.</p>
              </div>
            </div>
          )}
        </div>
        {otherTyping ? <p className="border-t border-gray-100 px-4 py-1 text-[11px] text-gray-400">Professional is typing...</p> : null}
        <div className="border-t border-gray-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] text-gray-400">
            <span>Reply on this inquiry</span>
            <span className={connected ? "text-primary" : "text-amber-600"}>{connected ? "Connected" : "Connecting..."}</span>
          </div>
          <ThreadComposer
            token={token}
            threadId={threadId}
            draft={draft}
            setDraft={setDraft}
            composerRef={composerRef}
            fileInputRef={fileInputRef}
            draftAttachments={draftAttachments}
            setDraftAttachments={setDraftAttachments}
            uploadingAttachments={uploadingAttachments}
            setUploadingAttachments={setUploadingAttachments}
            onUploadAttachment={(args) => uploadProChatThreadAttachment({ ...args, client: true })}
            onSendMessage={sendMessage}
            onEmitTyping={emitTyping}
            typingTimeoutRef={typingTimeoutRef}
            lastTypingSentAt={lastTypingSentAt}
            autosizeComposer={autosizeComposer}
            toast={toast}
            disabled={!threadId}
          />
        </div>
      </aside>
    </div>,
    document.body,
  );
}

export default function ClientInquiriesPage() {
  const { isAuthenticated } = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const authUser = useAppSelector((state) => state.auth.user);
  const unreadByThread = useAppSelector((state) => state.proChat?.unreadByThread || {});
  const myUserId = String(authUser?.id || authUser?._id || "").trim();
  const [activeFilter, setActiveFilter] = useState("");
  const [activeChatItem, setActiveChatItem] = useState(null);

  const query = useQuery({
    queryKey: ["client-inquiries", token, activeFilter],
    enabled: Boolean(token),
    queryFn: () => fetchClientInquiries({ token, type: activeFilter, limit: 50 }),
    staleTime: 30_000,
  });

  const items = useMemo(
    () => (Array.isArray(query.data?.items) ? query.data.items : []),
    [query.data?.items],
  );

  useEffect(() => {
    const threadId = String(searchParams?.get("thread") || "").trim();
    if (!threadId || query.isLoading) return;
    const match = items.find((item) => String(item?.thread_id || "").trim() === threadId);
    if (!match) return;
    setActiveChatItem(match);
    dispatch(clearUnread({ threadId }));
  }, [dispatch, items, query.isLoading, searchParams]);

  const counts = useMemo(() => {
    const apiCounts = query.data?.counts;
    if (apiCounts && typeof apiCounts.total === "number") {
      return {
        total: apiCounts.total,
        property: apiCounts.property ?? 0,
        professional: apiCounts.professional ?? 0,
      };
    }
    return {
      total: query.data?.pagination?.total ?? items.length,
      property: items.filter((item) => item.inquiry_type === "property").length,
      professional: items.filter((item) => item.inquiry_type === "professional").length,
    };
  }, [items, query.data?.counts, query.data?.pagination?.total]);

  if (!isAuthenticated) return null;

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
                onClick={() => setActiveFilter(tab.id)}
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

      {!query.isLoading && !query.isError ? (
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: counts.total },
            { label: "Property", value: counts.property },
            { label: "Professional", value: counts.professional },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{stat.label}</p>
              <p className="text-lg font-bold tabular-nums text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {query.isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gray-200 bg-white py-8 shadow-sm">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="mt-2 text-xs text-gray-500">Loading inquiries...</p>
          </div>
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-red-600 shadow-sm">
          {query.error?.message || "Failed to load inquiries."}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center shadow-sm">
          <ClipboardList size={32} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-900">No inquiries yet</p>
          <p className="mt-1 text-xs text-gray-500">Inquire on a property or message a professional to get started.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/client-dashboard/properties")}
              className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary-dark"
            >
              Browse properties
            </button>
            <button
              type="button"
              onClick={() => router.push("/professionals?recommended=1")}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:text-primary"
            >
              Recommendations
            </button>
          </div>
        </div>
      ) : (
        <div className="grid w-full gap-3">
          {items.map((item) => {
            const threadId = String(item?.thread_id || "").trim();
            const unread = threadId ? Number(unreadByThread?.[threadId] || 0) : 0;
            return (
              <InquiryRow
                key={item.id}
                item={item}
                unread={unread}
                onOpenChat={() => {
                  if (threadId) dispatch(clearUnread({ threadId }));
                  setActiveChatItem(item);
                }}
              />
            );
          })}
        </div>
      )}
      <InquiryChatDrawer
        item={activeChatItem}
        token={token}
        myUserId={myUserId}
        onClose={() => {
          setActiveChatItem(null);
          if (String(searchParams?.get("thread") || "").trim()) {
            router.replace("/client-dashboard/inquiries");
          }
        }}
      />
    </div>
  );
}
