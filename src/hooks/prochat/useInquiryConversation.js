"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { safeUuid, validateProChatAttachmentLimits } from "@/components/prochat/thread/proChatThreadUtils";
import { useAppDispatch } from "@/store";
import { clearUnread } from "@/store/proChatSlice";
import { getSocketOrigin } from "@/lib/api";
import {
  fetchProChatThreadMessages,
  uploadProChatThreadAttachment,
} from "@/lib/proChatClient";
import { useInquiryCallSession } from "./useInquiryCallSession";

export function useInquiryConversation({ item, token, myUserId }) {
  const dispatch = useAppDispatch();
  const threadId = String(item?.thread_id || "").trim();
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

  const call = useInquiryCallSession({
    token,
    threadId,
    myUserId,
    socketRef,
    connected,
  });
  const {
    endActiveCall,
    onCallDecline: handleCallDeclineSignal,
    onCallEnded: handleCallEndedSignal,
    onCallInvite: handleCallInviteSignal,
    onCallAccepted: handleCallAcceptedSignal,
    onCallParticipant: handleCallParticipantSignal,
  } = call;

  const messagesQuery = useQuery({
    queryKey: ["inquiry-thread-messages", token, threadId],
    enabled: Boolean(token && threadId),
    queryFn: () =>
      fetchProChatThreadMessages({
        token,
        id: threadId,
        page: 1,
        limit: 100,
        client: true,
      }),
    staleTime: 10_000,
  });

  const messages = useMemo(() => {
    const fromApi = Array.isArray(messagesQuery.data?.items)
      ? messagesQuery.data.items
      : [];
    const merged = [...fromApi];
    const seen = new Set(merged.map((message) => String(message?.id || "")));
    for (const message of liveMessages) {
      const id = String(message?.id || "");
      if (!id || seen.has(id)) continue;
      seen.add(id);
      merged.push(message);
    }
    merged.sort(
      (first, second) =>
        new Date(first?.created_at || 0).getTime() -
        new Date(second?.created_at || 0).getTime(),
    );
    return merged;
  }, [liveMessages, messagesQuery.data?.items]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (threadId) dispatch(clearUnread({ threadId }));
  }, [dispatch, messages.length, threadId]);

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
    setOtherTyping(false);
  }, [threadId]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
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

    const onConnect = () => {
      setConnected(true);
      socket.emit("prochat:join", { thread_id: threadId }, (ack) => {
        setConnected(Boolean(ack?.success));
        if (!ack?.success) {
          toast.error(ack?.message || "Could not join this inquiry chat.");
        }
      });
    };
    const onDisconnect = () => setConnected(false);
    const onMessage = (message) => {
      if (!message || String(message.thread_id) !== String(threadId)) return;
      setLiveMessages((previous) => {
        if (
          previous.some(
            (existing) => String(existing?.id) === String(message.id),
          )
        ) {
          return previous;
        }
        return [...previous, message];
      });
    };
    const onTyping = (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      if (myUserId && String(payload.user_id) === String(myUserId)) return;
      setOtherTyping(Boolean(payload.is_typing));
    };
    const onCallInvite = (payload) => {
      if (myUserId && String(payload?.user_id) === String(myUserId)) return;
      handleCallInviteSignal(payload);
    };
    const onCallDecline = (payload) => {
      if (myUserId && String(payload?.user_id) === String(myUserId)) return;
      handleCallDeclineSignal(payload);
    };
    const onCallEnded = (payload) => {
      if (myUserId && String(payload?.user_id) === String(myUserId)) return;
      handleCallEndedSignal(payload);
    };
    const onCallParticipant = (payload) => {
      handleCallParticipantSignal(payload);
    };
    const onCallAccepted = (payload) => {
      handleCallAcceptedSignal(payload);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("prochat:message", onMessage);
    socket.on("prochat:typing", onTyping);
    socket.on("prochat:call_invite", onCallInvite);
    socket.on("prochat:call_decline", onCallDecline);
    socket.on("prochat:call_ended", onCallEnded);
    socket.on("prochat:call_accepted", onCallAccepted);
    socket.on("prochat:call_participant", onCallParticipant);

    return () => {
      endActiveCall();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("prochat:message", onMessage);
      socket.off("prochat:typing", onTyping);
      socket.off("prochat:call_invite", onCallInvite);
      socket.off("prochat:call_decline", onCallDecline);
      socket.off("prochat:call_ended", onCallEnded);
      socket.off("prochat:call_accepted", onCallAccepted);
      socket.off("prochat:call_participant", onCallParticipant);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    endActiveCall,
    handleCallDeclineSignal,
    handleCallEndedSignal,
    handleCallInviteSignal,
    handleCallAcceptedSignal,
    handleCallParticipantSignal,
    myUserId,
    threadId,
    token,
  ]);

  const autosizeComposer = useCallback(() => {
    const element = composerRef.current;
    if (!element) return;
    try {
      element.style.height = "0px";
      const next = Math.min(element.scrollHeight || 0, 180);
      element.style.height = `${Math.max(next, 44)}px`;
      element.style.overflowY =
        (element.scrollHeight || 0) > 180 ? "auto" : "hidden";
    } catch {
      // Ignore detached composer elements.
    }
  }, []);

  const emitTyping = useCallback(
    (isTyping) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected || !connected || !threadId) return;
      socket.emit("prochat:typing", {
        thread_id: threadId,
        is_typing: Boolean(isTyping),
      });
    },
    [connected, threadId],
  );

  const sendMessage = useCallback(async () => {
    const text = String(draft || "").trim();
    const attachments = Array.isArray(draftAttachments)
      ? draftAttachments
      : [];
    if (!text && attachments.length < 1) return;
    if (uploadingAttachments.length > 0) {
      toast.info("Please wait for attachments to finish uploading.");
      return;
    }
    const attachmentLimit = validateProChatAttachmentLimits(attachments);
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
    const previousAttachments = attachments;
    setDraft("");
    setDraftAttachments([]);
    requestAnimationFrame(() => autosizeComposer());
    socket.emit(
      "prochat:send",
      {
        thread_id: threadId,
        body: text,
        client_id,
        attachments: previousAttachments,
      },
      (ack) => {
        if (!ack?.success) {
          toast.error(ack?.message || "Could not send message");
          setDraft(text);
          setDraftAttachments(previousAttachments);
          return;
        }
        const message = ack?.message;
        if (message) {
          setLiveMessages((previous) => {
            if (
              previous.some(
                (existing) => String(existing?.id) === String(message.id),
              )
            ) {
              return previous;
            }
            return [...previous, message];
          });
        }
      },
    );
  }, [
    autosizeComposer,
    connected,
    draft,
    draftAttachments,
    item?.id,
    threadId,
    uploadingAttachments.length,
  ]);

  const onUploadAttachment = useCallback(
    (args) => uploadProChatThreadAttachment({ ...args, client: true }),
    [],
  );

  return {
    threadId,
    mounted,
    messagesQuery,
    messages,
    connected,
    otherTyping,
    draft,
    setDraft,
    draftAttachments,
    setDraftAttachments,
    uploadingAttachments,
    setUploadingAttachments,
    scrollRef,
    composerRef,
    fileInputRef,
    typingTimeoutRef,
    lastTypingSentAt,
    socketRef,
    autosizeComposer,
    emitTyping,
    sendMessage,
    onUploadAttachment,
    ...call,
  };
}
