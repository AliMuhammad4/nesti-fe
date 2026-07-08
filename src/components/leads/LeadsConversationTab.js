"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { Inbox, Info } from "lucide-react";
import MessageBubble from "@/components/leads/MessageBubble";
import ThreadComposer from "@/components/prochat/thread/ThreadComposer";
import ThreadMessagesList from "@/components/prochat/thread/ThreadMessagesList";
import { SkeletonBlock } from "@/components/ui/ContentSkeletons";
import { getSocketOrigin } from "@/lib/api";
import { uploadProChatThreadAttachment } from "@/lib/proChatClient";
import { safeUuid } from "@/components/prochat/thread/proChatThreadUtils";

function LeadDirectChatPanel({ token, threadId, leadId, messages, messagesQuery, myUserId }) {
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

    socket.on("connect_error", (error) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[lead-direct-chat] connect_error", error?.message || error);
      }
    });

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
    <>
      <div
        ref={scrollRef}
        className="h-[65vh] min-h-[460px] max-h-[calc(100vh-11rem)] overflow-y-auto rounded-md border border-border/60 bg-background-light/30 p-3 scroll-smooth"
      >
        {messagesQuery.isPending || messagesQuery.isLoading ? (
          <div className="space-y-2.5" aria-busy="true" aria-label="Loading conversation">
            {Array.from({ length: 8 }).map((_, idx) => {
              const inbound = idx % 2 === 0;
              return (
                <div key={`direct-conversation-skeleton-${idx}`} className={`flex ${inbound ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[78%] rounded-xl border border-border/50 bg-white/80 p-2.5 shadow-sm ${inbound ? "rounded-bl-md" : "rounded-br-md"}`}>
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="mt-1.5 h-3 w-56 max-w-[92%]" />
                    <SkeletonBlock className="mt-1.5 h-3 w-40 max-w-[72%]" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : mergedMessages.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center px-3 py-6">
            <div className="w-full max-w-sm rounded-xl border border-border/70 bg-white/80 px-5 py-6 text-center shadow-sm">
              <span className="mx-auto mb-2.5 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Inbox size={16} />
              </span>
              <p className="text-sm font-semibold text-text-heading">No messages yet</p>
              <p className="mt-1 text-xs text-text-muted">Send the first reply to start a direct conversation with this client.</p>
            </div>
          </div>
        ) : (
          <ThreadMessagesList
            messages={mergedMessages}
            myUserId={myUserId}
            isGroup={false}
            membersById={new Map()}
            otherUser={null}
          />
        )}
      </div>
      {otherTyping ? <p className="px-1 text-[11px] font-medium text-text-muted">Client is typing...</p> : null}
      <div className="rounded-2xl border border-border/70 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-text-muted">
          <span>Direct client chat</span>
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
    </>
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

  useEffect(() => {
    if (!messages.length || messagesQuery.isLoading) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, messagesQuery.isLoading, selectedConversation?.id]);

  return (
    <div className="rounded-md border border-border bg-white shadow-sm p-4 space-y-3">
      {selectedConversation ? (
        <>
          {formatMetaEntries(messageMeta).length > 0 ? (
            <div className="flex items-center justify-between p-3 rounded-md bg-indigo-50 border border-indigo-100/50">
              <div className="text-xs font-bold text-indigo-700/80 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Latest AI Message Insights
              </div>
              <button
                onClick={() => onOpenMeta("Latest AI Message Insights", messageMeta)}
                className="p-1.5 rounded-md bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
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
            />
          ) : (
            <div
              ref={scrollRef}
              className="h-[65vh] min-h-[460px] max-h-[calc(100vh-11rem)] overflow-y-auto rounded-md border border-border/60 bg-background-light/30 p-3 space-y-2.5 scroll-smooth"
            >
              {messagesQuery.isPending || messagesQuery.isLoading ? (
                <div className="space-y-2.5" aria-busy="true" aria-label="Loading conversation">
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const inbound = idx % 2 === 0;
                    return (
                      <div
                        key={`conversation-skeleton-${idx}`}
                        className={`flex ${inbound ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-xl border border-border/50 bg-white/80 p-2.5 shadow-sm ${
                            inbound ? "rounded-bl-md" : "rounded-br-md"
                          }`}
                        >
                          <SkeletonBlock className="h-3 w-20" />
                          <SkeletonBlock className="mt-1.5 h-3 w-56 max-w-[92%]" />
                          <SkeletonBlock className="mt-1.5 h-3 w-40 max-w-[72%]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : messagesQuery.isError ? (
                <div className="text-sm text-red-600">Failed to load messages.</div>
              ) : messages.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center px-3 py-6">
                  <div className="w-full max-w-sm rounded-xl border border-border/70 bg-white/80 px-5 py-6 text-center shadow-sm">
                    <span className="mx-auto mb-2.5 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Inbox size={16} />
                    </span>
                    <p className="text-sm font-semibold text-text-heading">No messages yet</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {emptyState?.action || "Conversation messages will appear here once this lead starts chatting."}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble key={`${index}-${message?.id || "msg"}`} message={message} />
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[220px] items-center justify-center px-3 py-6">
          <div className="w-full max-w-sm rounded-xl border border-border/70 bg-background-light/40 px-5 py-6 text-center shadow-sm">
            <span className="mx-auto mb-2.5 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
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
