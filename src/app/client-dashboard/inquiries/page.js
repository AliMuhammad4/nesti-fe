"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  Phone,
  PhoneOff,
  X,
  UserRound,
  Video,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchClientInquiries } from "@/lib/clientInquiriesClient";
import { getSocketOrigin } from "@/lib/api";
import {
  createProChatCallToken,
  fetchProChatThreadMessages,
  uploadProChatThreadAttachment,
} from "@/lib/proChatClient";
import ThreadMessagesList from "@/components/prochat/thread/ThreadMessagesList";
import ThreadComposer from "@/components/prochat/thread/ThreadComposer";
import { safeUuid, validateProChatAttachmentLimits } from "@/components/prochat/thread/proChatThreadUtils";
import { clearUnread } from "@/store/proChatSlice";
import ProChatCallModal from "@/components/prochat/calls/ProChatCallModal";

const FILTER_TABS = [
  { id: "", label: "All" },
  { id: "agent", label: "Agents" },
  { id: "lawyer", label: "Lawyers" },
  { id: "broker", label: "Brokers" },
];

const INQUIRIES_PER_PAGE = 8;

const ROLE_LABELS = {
  agent: "Agent",
  lawyer: "Lawyer",
  mortgage_broker: "Broker",
  broker: "Broker",
  professional: "Professional",
};

const LEGAL_SERVICE_LABELS = {
  full_closing: "Full closing services",
  purchase_closing: "Purchase closing",
  sale_closing: "Sale closing",
  refinance_legal_work: "Refinance legal work",
  agreement_review: "Agreement / contract review",
  title_transfer: "Title transfer",
  document_review: "Document review",
  mortgage_document_review: "Mortgage document review",
  property_dispute_advice: "Property dispute / legal advice",
  other: "Other legal service",
};

function formatRole(value) {
  const key = String(value || "").trim().toLowerCase();
  if (ROLE_LABELS[key]) return ROLE_LABELS[key];
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatLegalServiceLabel(value) {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return "";
  if (LEGAL_SERVICE_LABELS[key]) return LEGAL_SERVICE_LABELS[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function formatPropertyType(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.includes(" ")) return raw;
  return raw.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isPropertyInquiryItem(item, property, professional) {
  if (item?.inquiry_type === "professional") return false;
  if (item?.inquiry_type !== "property") return false;
  // Lawyer/broker profile inquiries must never show as property, even if type is stale.
  const role = String(professional?.professional_type || "").trim().toLowerCase();
  if (role === "lawyer" || role === "mortgage_broker" || role === "broker") return false;
  // Real property rows have a listing id or a non-generic title.
  const propertyId = String(property?.id || "").trim();
  const title = String(property?.title || "").trim().toLowerCase();
  if (propertyId) return true;
  if (title && title !== "property inquiry") return true;
  return Boolean(property?.price || property?.location);
}

function inquiryTitle(item, property, professional) {
  if (isPropertyInquiryItem(item, property, professional)) return "Property inquiry";
  // Titles always come from Legal service needed — never Transaction type.
  const legalLabel =
    String(item?.legal_service_label || "").trim() ||
    formatLegalServiceLabel(item?.legal_services_needed);
  if (legalLabel) return legalLabel;
  const mortgageLabel = String(item?.mortgage_service_label || "").trim();
  if (mortgageLabel) return mortgageLabel;
  const role = String(professional?.professional_type || "").trim().toLowerCase();
  const propertyType = formatPropertyType(item?.property_type || property?.property_type);
  if ((role === "agent" || role === "real_estate_agent") && propertyType) return propertyType;
  const agentLabel = String(item?.agent_service_label || "").trim();
  if (agentLabel) return agentLabel;
  const roleLabel = formatRole(professional?.professional_type || "professional");
  return `${roleLabel} inquiry`;
}

function inquirySubject(item, property, professional) {
  if (isPropertyInquiryItem(item, property, professional)) {
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
  const autoJoinHandledRef = useRef(false);
  const callOperationRef = useRef(0);
  const [draft, setDraft] = useState("");
  const [draftAttachments, setDraftAttachments] = useState([]);
  const [uploadingAttachments, setUploadingAttachments] = useState([]);
  const [liveMessages, setLiveMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callSession, setCallSession] = useState({
    open: false,
    token: "",
    serverUrl: "",
    roomName: "",
    callType: "voice",
    connecting: false,
    ringing: false,
  });
  const [mounted, setMounted] = useState(false);
  const callSessionRef = useRef(callSession);

  useEffect(() => {
    callSessionRef.current = callSession;
  }, [callSession]);

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
    callOperationRef.current += 1;
    autoJoinHandledRef.current = false;
    setLiveMessages([]);
    setDraft("");
    setDraftAttachments([]);
    setUploadingAttachments([]);
    setIncomingCall(null);
    setCallSession({
      open: false,
      token: "",
      serverUrl: "",
      roomName: "",
      callType: "voice",
      connecting: false,
    });
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
      socket.emit("prochat:join", { thread_id: threadId }, (ack) => {
        setConnected(Boolean(ack?.success));
        if (!ack?.success) {
          toast.error(ack?.message || "Could not join this inquiry chat.");
        }
      });
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

    const onCallInvite = (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      if (myUserId && String(payload.user_id) === String(myUserId)) return;
      if (callSessionRef.current?.open) return;
      setIncomingCall({
        roomName: String(payload.room_name || `prochat:${threadId}`),
        callType: String(payload.call_type || "voice").toLowerCase() === "video" ? "video" : "voice",
        callerName: String(payload.sender_name || "Participant"),
      });
    };
    socket.on("prochat:call_invite", onCallInvite);

    const onCallDecline = (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      if (myUserId && String(payload.user_id) === String(myUserId)) return;
      const activeRoom = String(callSessionRef.current?.roomName || "");
      if (activeRoom && String(payload.room_name || "") !== activeRoom) return;
      toast.info("Call was declined.");
      callOperationRef.current += 1;
      setIncomingCall(null);
      setCallSession({
        open: false,
        token: "",
        serverUrl: "",
        roomName: "",
        callType: "voice",
        connecting: false,
        ringing: false,
      });
    };
    socket.on("prochat:call_decline", onCallDecline);

    const onCallEnded = (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      if (myUserId && String(payload.user_id) === String(myUserId)) return;
      const activeRoom = String(callSessionRef.current?.roomName || "");
      if (activeRoom && String(payload.room_name || "") !== activeRoom) return;
      setIncomingCall(null);
      callOperationRef.current += 1;
      setCallSession({
        open: false,
        token: "",
        serverUrl: "",
        roomName: "",
        callType: "voice",
        connecting: false,
        ringing: false,
      });
    };
    socket.on("prochat:call_ended", onCallEnded);
    return () => {
      socket.off("prochat:message", onMessage);
      socket.off("prochat:typing", onTyping);
      socket.off("prochat:call_invite", onCallInvite);
      socket.off("prochat:call_decline", onCallDecline);
      socket.off("prochat:call_ended", onCallEnded);
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
    if (!socket || !socket.connected || !connected || !threadId) return;
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
    const attachmentLimit = validateProChatAttachmentLimits(atts);
    if (!attachmentLimit.ok) {
      toast.error(attachmentLimit.message);
      return;
    }
    const socket = socketRef.current;
    if (!socket || !socket.connected || !connected) {
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

  const emitCallSignal = (eventName, payload) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      return Promise.resolve({ success: false, message: "Chat is not connected." });
    }
    return new Promise((resolve) => {
      socket.timeout(5000).emit(eventName, payload, (error, ack) => {
        if (error) {
          resolve({ success: false, message: "Call signaling timed out." });
          return;
        }
        resolve(ack || { success: false, message: "Call signaling failed." });
      });
    });
  };

  const openCallSession = async (callType, roomNameHint = "", { ringing = false } = {}) => {
    if (!token || !threadId) return null;
    const operationId = ++callOperationRef.current;
    const normalizedType = String(callType || "").toLowerCase() === "video" ? "video" : "voice";
    try {
      setCallSession((prev) => ({
        ...prev,
        open: true,
        connecting: true,
        ringing,
        roomName: roomNameHint,
        callType: normalizedType,
      }));
      const response = await createProChatCallToken({
        token,
        id: threadId,
        callType: normalizedType,
        roomName: roomNameHint,
        client: true,
      });
      if (callOperationRef.current !== operationId) return null;
      const roomName = String(response?.room_name || roomNameHint || `prochat:${threadId}`);
      setCallSession({
        open: true,
        token: String(response?.token || ""),
        serverUrl: String(response?.url || ""),
        roomName,
        callType: normalizedType,
        connecting: false,
        ringing,
      });
      return { roomName };
    } catch (error) {
      if (callOperationRef.current !== operationId) return null;
      setCallSession({
        open: false,
        token: "",
        serverUrl: "",
        roomName: "",
        callType: normalizedType,
        connecting: false,
        ringing: false,
      });
      toast.error(error?.message || "Could not start call");
      return null;
    }
  };

  const startCall = async (callType) => {
    if (!socketRef.current?.connected || !connected) {
      toast.error("Chat is not connected yet. Try again.");
      return;
    }
    const roomName = `prochat:${threadId}:${safeUuid()}`;
    const started = await openCallSession(callType, roomName, { ringing: true });
    if (!started) return;
    const ack = await emitCallSignal("prochat:call_invite", {
      thread_id: threadId,
      room_name: started.roomName,
      call_type: callType,
    });
    if (!ack?.success) {
      setCallSession({
        open: false,
        token: "",
        serverUrl: "",
        roomName: "",
        callType: "voice",
        connecting: false,
        ringing: false,
      });
      toast.error(ack?.message || "Could not notify the other participant.");
      return;
    }
    setIncomingCall(null);
  };

  const joinIncomingCall = async () => {
    if (!incomingCall) return;
    const joined = await openCallSession(incomingCall.callType, incomingCall.roomName, { ringing: false });
    if (joined) setIncomingCall(null);
  };

  useEffect(() => {
    if (!token || !threadId || autoJoinHandledRef.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("incoming_call") !== "1") return;
    autoJoinHandledRef.current = true;
    const callType = String(params.get("call_type") || "voice").toLowerCase() === "video" ? "video" : "voice";
    const roomName = String(params.get("room_name") || "").trim();
    void openCallSession(callType, roomName, { ringing: false });
    params.delete("incoming_call");
    params.delete("call_type");
    params.delete("room_name");
    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", next);
    // This is a one-shot deep-link join.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, threadId]);

  const declineIncomingCall = () => {
    if (!incomingCall) return;
    emitCallSignal("prochat:call_decline", {
      thread_id: threadId,
      room_name: incomingCall.roomName,
      call_type: incomingCall.callType,
    });
    setIncomingCall(null);
  };

  const closeCallSession = () => {
    callOperationRef.current += 1;
    emitCallSignal("prochat:call_ended", {
      thread_id: threadId,
      room_name: callSession.roomName || `prochat:${threadId}`,
      call_type: callSession.callType || "voice",
    });
    setCallSession({
      open: false,
      token: "",
      serverUrl: "",
      roomName: "",
      callType: "voice",
      connecting: false,
      ringing: false,
    });
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void startCall("voice")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              aria-label="Start voice call"
              title="Start voice call"
            >
              <Phone size={14} />
            </button>
            <button
              type="button"
              onClick={() => void startCall("video")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              aria-label="Start video call"
              title="Start video call"
            >
              <Video size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {incomingCall ? (
          <div className="border-b border-emerald-200 bg-emerald-50/80 px-4 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-emerald-800">
                {incomingCall.callerName} is calling ({incomingCall.callType}).
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void joinIncomingCall()}
                  className="inline-flex h-7 items-center rounded-md border border-emerald-300 bg-white px-2.5 text-[11px] font-semibold text-emerald-700"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={declineIncomingCall}
                  className="inline-flex h-7 items-center rounded-md border border-red-200 bg-white px-2.5 text-[11px] font-semibold text-red-600"
                >
                  <PhoneOff size={11} className="mr-1" />
                  Decline
                </button>
              </div>
            </div>
          </div>
        ) : null}

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
      <ProChatCallModal
        open={callSession.open}
        token={callSession.token}
        serverUrl={callSession.serverUrl}
        callType={callSession.callType}
        connecting={callSession.connecting}
        ringing={callSession.ringing}
        title={title}
        onClose={closeCallSession}
        onRingTimeout={() => {
          toast.info("No answer.");
          closeCallSession();
        }}
        onAnswered={() => {
          setCallSession((current) => ({ ...current, ringing: false }));
        }}
      />
    </div>,
    document.body,
  );
}

function ClientInquiriesPageContent() {
  const { isAuthenticated } = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const authUser = useAppSelector((state) => state.auth.user);
  const unreadByThread = useAppSelector((state) => state.proChat?.unreadByThread || {});
  const myUserId = String(authUser?.id || authUser?._id || "").trim();
  const [activeFilter, setActiveFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeChatItem, setActiveChatItem] = useState(null);
  const deepLinkThreadId = String(searchParams?.get("thread") || "").trim();

  const query = useQuery({
    queryKey: ["client-inquiries", token, activeFilter, currentPage, deepLinkThreadId],
    enabled: Boolean(token),
    queryFn: () => fetchClientInquiries({
      token,
      type: activeFilter,
      limit: INQUIRIES_PER_PAGE,
      page: currentPage,
      thread_id: deepLinkThreadId,
    }),
    staleTime: 30_000,
  });

  const items = useMemo(
    () => (Array.isArray(query.data?.items) ? query.data.items : []),
    [query.data?.items],
  );
  const pagination = query.data?.pagination || {};
  const totalItems = Number(pagination?.total ?? items.length);
  const totalPages = Math.max(Number(pagination?.total_pages || Math.ceil(totalItems / INQUIRIES_PER_PAGE) || 1), 1);
  const hasPrevPage = Boolean(pagination?.has_prev_page ?? currentPage > 1);
  const hasNextPage = Boolean(pagination?.has_next_page ?? currentPage < totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    if (!query.isLoading && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, query.isLoading, totalPages]);

  useEffect(() => {
    const pageFromApi = Number(pagination?.page || 0);
    if (!query.isLoading && pageFromApi > 0 && pageFromApi !== currentPage) {
      setCurrentPage(pageFromApi);
    }
  }, [currentPage, pagination?.page, query.isLoading]);

  useEffect(() => {
    const threadId = deepLinkThreadId;
    if (!threadId || query.isLoading) return;
    const match = items.find((item) => String(item?.thread_id || "").trim() === threadId);
    if (!match) return;
    setActiveChatItem(match);
    dispatch(clearUnread({ threadId }));
  }, [deepLinkThreadId, dispatch, items, query.isLoading]);

  const counts = useMemo(() => {
    const roleOf = (item) => {
      const professional = item?.professional || {};
      const property = item?.property || null;
      if (isPropertyInquiryItem(item, property, professional)) return "agent";
      const key = String(professional?.professional_type || "").trim().toLowerCase();
      if (key === "lawyer") return "lawyer";
      if (key === "mortgage_broker" || key === "broker") return "broker";
      return "agent";
    };

    // Property inquiries belong to agents. Prefer API counts when available.
    const fromItems = () => {
      let agents = 0;
      let lawyers = 0;
      let brokers = 0;
      for (const item of items) {
        const role = roleOf(item);
        if (role === "lawyer") lawyers += 1;
        else if (role === "broker") brokers += 1;
        else agents += 1;
      }
      return {
        total: query.data?.pagination?.total ?? items.length,
        agents,
        lawyers,
        brokers,
      };
    };

    const apiCounts = query.data?.counts;
    if (apiCounts && typeof apiCounts.total === "number") {
      return {
        total: apiCounts.total,
        agents: apiCounts.agents ?? 0,
        lawyers: apiCounts.lawyers ?? 0,
        brokers: apiCounts.brokers ?? 0,
      };
    }
    return fromItems();
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
                  onOpenChat={() => {
                    if (threadId) dispatch(clearUnread({ threadId }));
                    setActiveChatItem(item);
                    if (threadId) {
                      router.replace(`/client-dashboard/inquiries?thread=${encodeURIComponent(threadId)}`);
                    }
                  }}
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
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={!hasPrevPage || query.isFetching}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-[11px] font-semibold text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={!hasNextPage || query.isFetching}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
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

export default function ClientInquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          <Loader2 size={20} className="mr-2 animate-spin text-primary" />
          Loading inquiries...
        </div>
      }
    >
      <ClientInquiriesPageContent />
    </Suspense>
  );
}
