"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { Info, Phone, Video } from "lucide-react";
import MessageBubble from "@/components/leads/MessageBubble";
import ThreadComposer from "@/components/prochat/thread/ThreadComposer";
import ThreadMessagesList from "@/components/prochat/thread/ThreadMessagesList";
import ThreadCallModals from "@/components/prochat/calls/ThreadCallModals";
import { useThreadCallSession } from "@/hooks/prochat/useThreadCallSession";
import { getSocketOrigin } from "@/lib/api";
import { uploadProChatThreadAttachment } from "@/lib/proChatClient";
import { safeUuid } from "@/components/prochat/thread/proChatThreadUtils";

function LeadDirectChatPanel({
  token,
  threadId,
  leadId,
  messages,
  messagesQuery,
  myUserId,
  participantName,
}) {
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

  const call = useThreadCallSession({
    token,
    threadId,
    myUserId,
    socketRef,
    connected,
    client: false,
    enableMultiparty: false,
    requireConnectedFlag: true,
    title: participantName,
  });

  const mergedMessages = useMemo(() => {
    const merged = Array.isArray(messages) ? [...messages] : [];
    const seen = new Set(merged.map((message) => String(message?.id || "")));
    for (const message of liveMessages) {
      const id = String(message?.id || "");
      if (!id || seen.has(id)) continue;
      seen.add(id);
      merged.push(message);
    }
    merged.sort((a, b) => new Date(a?.created_at || 0).getTime() - new Date(b?.created_at || 0).getTime());
    return merged;
  }, [messages, liveMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [mergedMessages.length, messagesQuery.isLoading]);

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
        if (!ack?.success && process.env.NODE_ENV === "development") {
          console.warn("[lead-direct-chat] join failed", ack);
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
      if (payload?.user_id && String(payload.user_id) === String(myUserId)) return;
      call.onCallInvite(payload);
    };
    socket.on("prochat:call_invite", onCallInvite);

    const onCallDecline = (payload) => {
      if (myUserId && String(payload?.user_id) === String(myUserId)) return;
      call.onCallDecline(payload);
    };
    socket.on("prochat:call_decline", onCallDecline);

    const onCallAccepted = (payload) => {
      call.onCallAccepted(payload);
    };
    socket.on("prochat:call_accepted", onCallAccepted);

    const onCallParticipant = (payload) => {
      call.onCallParticipant(payload);
    };
    socket.on("prochat:call_participant", onCallParticipant);

    const onCallEnded = (payload) => {
      if (myUserId && String(payload?.user_id) === String(myUserId)) return;
      call.onCallEnded(payload);
    };
    socket.on("prochat:call_ended", onCallEnded);

    socket.on("connect_error", (error) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[lead-direct-chat] connect_error", error?.message || error);
      }
    });

    return () => {
      call.endActiveCall();
      socket.off("prochat:message", onMessage);
      socket.off("prochat:typing", onTyping);
      socket.off("prochat:call_invite", onCallInvite);
      socket.off("prochat:call_decline", onCallDecline);
      socket.off("prochat:call_accepted", onCallAccepted);
      socket.off("prochat:call_participant", onCallParticipant);
      socket.off("prochat:call_ended", onCallEnded);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    token,
    threadId,
    myUserId,
    call.onCallInvite,
    call.onCallDecline,
    call.onCallAccepted,
    call.onCallParticipant,
    call.onCallEnded,
    call.endActiveCall,
  ]);

  const autosizeComposer = () => {
    const el = composerRef.current;
    if (!el) return;
    try {
      el.style.height = "0px";
      const next = Math.min(el.scrollHeight || 0, 240);
      el.style.height = `${Math.max(next, 52)}px`;
      el.style.overflowY = (el.scrollHeight || 0) > 240 ? "auto" : "hidden";
    } catch {
      // Ignore autosize failures on non-standard textareas.
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
    const clientId = `lead-direct:${String(leadId || threadId)}:${safeUuid()}`;
    const prevAttachments = atts;
    setDraft("");
    setDraftAttachments([]);
    requestAnimationFrame(() => autosizeComposer());
    socket.emit(
      "prochat:send",
      { thread_id: threadId, body: text, client_id: clientId, attachments: prevAttachments },
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

  return (
    <div className="flex h-[65vh] min-h-[460px] max-h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-white via-primary/[0.025] to-primary/[0.08]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-heading">{participantName}</p>
          <p className="text-[11px] text-text-muted">Reply directly from this lead</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void call.startCall("voice")}
            disabled={
              call.startingCall || call.callSession.open || Boolean(call.incomingCall)
            }
            className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-white text-text-heading transition hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Start voice call"
            title="Start voice call"
          >
            <Phone size={14} />
          </button>
          <button
            type="button"
            onClick={() => void call.startCall("video")}
            disabled={
              call.startingCall || call.callSession.open || Boolean(call.incomingCall)
            }
            className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-white text-text-heading transition hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Start video call"
            title="Start video call"
          >
            <Video size={14} />
          </button>
          <span className={`text-[11px] font-medium ${connected ? "text-primary" : "text-amber-600"}`}>
            {connected ? "Connected" : "Connecting..."}
          </span>
        </div>
      </div>

      <ThreadCallModals call={call} title={participantName} myUserId={myUserId} />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
        <div className="flex min-h-full w-full flex-col justify-end">
          {messagesQuery.isPending || messagesQuery.isLoading ? (
            <p className="py-6 text-center text-xs text-text-muted">Loading messages…</p>
          ) : mergedMessages.length === 0 ? (
            <div className="py-6 text-center text-xs text-text-muted">
              No messages yet. Say hello.
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3">
              <ThreadMessagesList
                messages={mergedMessages}
                myUserId={myUserId}
                isGroup={false}
                membersById={new Map()}
                otherUser={null}
              />
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-primary/10 bg-primary/[0.035] px-3 py-3 backdrop-blur sm:px-5">
        <div className="w-full rounded-2xl border border-white/60 bg-white/35 p-2.5 shadow-sm backdrop-blur-md sm:p-3">
          {otherTyping ? (
            <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-primary/[0.10] text-[10px] font-bold text-primary-dark ring-1 ring-primary/15">
                …
              </span>
              <span className="truncate">Client is typing</span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-text-muted/60 animate-bounce" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-text-muted/60 animate-bounce [animation-delay:120ms]" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-text-muted/60 animate-bounce [animation-delay:240ms]" />
              </span>
            </div>
          ) : null}
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
            onUploadAttachment={(args) => uploadProChatThreadAttachment(args)}
            onSendMessage={sendMessage}
            onEmitTyping={emitTyping}
            typingTimeoutRef={typingTimeoutRef}
            lastTypingSentAt={lastTypingSentAt}
            autosizeComposer={autosizeComposer}
            toast={toast}
            disabled={!threadId}
          />
        </div>
      </div>
    </div>
  );
}

export default function LeadsConversationTab({
  selectedConversation,
  messageMeta,
  messagesQuery,
  messages,
  formatMetaEntries,
  onOpenMeta,
  token,
  myUserId,
  leadId,
}) {
  const scrollRef = useRef(null);
  const directChat = messagesQuery.data?.direct_chat || null;
  const directThreadId = String(directChat?.thread_id || "").trim();
  const canReplyDirectly = Boolean(directChat?.available && directChat?.can_reply && directThreadId);
  const emptyState = messagesQuery.data?.empty_state || null;
  const participantName =
    String(
      selectedConversation?.contact?.full_name ||
        selectedConversation?.name ||
        selectedConversation?.visitor_name ||
        "",
    ).trim() || "Client";

  useEffect(() => {
    if (!messages.length || messagesQuery.isLoading) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, messagesQuery.isLoading, selectedConversation?.id]);

  return (
    <div className="space-y-3">
      {selectedConversation ? (
        <>
          {formatMetaEntries(messageMeta).length > 0 ? (
            <div className="flex items-center justify-between rounded-2xl border border-indigo-100/50 bg-indigo-50 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700/80">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Latest AI Message Insights
              </div>
              <button
                onClick={() => onOpenMeta("Latest AI Message Insights", messageMeta)}
                className="rounded-xl border border-indigo-200 bg-white p-1.5 text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50"
              >
                <Info size={14} />
              </button>
            </div>
          ) : null}

          {canReplyDirectly ? (
            <LeadDirectChatPanel
              token={token}
              threadId={directThreadId}
              leadId={leadId}
              messages={messages}
              messagesQuery={messagesQuery}
              myUserId={myUserId}
              participantName={participantName}
            />
          ) : (
            <div className="flex h-[65vh] min-h-[460px] max-h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-white via-primary/[0.025] to-primary/[0.08]">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-heading">Lead conversation</p>
                  <p className="text-[11px] text-text-muted">Chat history for this lead</p>
                </div>
              </div>
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5"
              >
                <div className="flex min-h-full w-full flex-col justify-end">
                  {messagesQuery.isPending || messagesQuery.isLoading ? (
                    <p className="py-6 text-center text-xs text-text-muted">Loading messages…</p>
                  ) : messagesQuery.isError ? (
                    <p className="py-6 text-center text-xs text-red-600">Failed to load messages.</p>
                  ) : messages.length === 0 ? (
                    <div className="py-6 text-center text-xs text-text-muted">
                      {emptyState?.action || "No messages yet. Conversation will appear here once this lead starts chatting."}
                    </div>
                  ) : (
                    <div className="flex w-full flex-col gap-3">
                      {messages.map((message, index) => (
                        <MessageBubble key={`${index}-${message?.id || "msg"}`} message={message} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-border/70 bg-gradient-to-br from-white via-primary/[0.025] to-primary/[0.08] px-3 py-6">
          <div className="w-full max-w-sm px-5 py-6 text-center">
            <span className="mx-auto mb-2.5 grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Info size={16} />
            </span>
            <p className="text-sm font-semibold text-text-heading">Choose a lead to load conversation</p>
            <p className="mt-1 text-xs text-text-muted">
              Select a lead from the table to view its full chat history here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
