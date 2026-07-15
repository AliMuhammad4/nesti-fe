"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { Info, Phone, Video } from "lucide-react";
import MessageBubble from "@/components/leads/MessageBubble";
import ThreadComposer from "@/components/prochat/thread/ThreadComposer";
import ThreadMessagesList from "@/components/prochat/thread/ThreadMessagesList";
import ProChatCallModal from "@/components/prochat/calls/ProChatCallModal";
import IncomingCallModal from "@/components/prochat/calls/IncomingCallModal";
import OutgoingCallNotesModal from "@/components/prochat/calls/OutgoingCallNotesModal";
import { getSocketOrigin } from "@/lib/api";
import { createProChatCallToken, uploadProChatThreadAttachment } from "@/lib/proChatClient";
import { safeUuid } from "@/components/prochat/thread/proChatThreadUtils";
import {
  acquireCallStartLock,
  claimIncomingCall,
  clearBrowserCallActive,
  isBrowserCallBusy,
  markIncomingCallHandled,
  markBrowserCallActive,
  releaseIncomingCallClaim,
  resolveIncomingCallAcrossTabs,
} from "@/lib/callNotifications";
import {
  consumeCallTranscriptionConsent,
  rememberCallTranscriptionConsent,
  resetCallTranscriptionConsent,
} from "@/lib/callTranscriptionConsent";
import { activateCallSessionWhenReady } from "@/lib/callActivation";
import { prewarmCallMedia, warmLiveKitHost } from "@/lib/liveKitCallPrep";

const EMPTY_CALL_SESSION = {
  open: false,
  token: "",
  serverUrl: "",
  roomName: "",
  callType: "voice",
  connecting: false,
  ringing: false,
  peerConnecting: false,
  participantStates: [],
  transcriptionStatus: "pending",
};

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
  const autoJoinHandledRef = useRef(false);
  const callOperationRef = useRef(0);
  const startCallPendingRef = useRef(false);
  const [draft, setDraft] = useState("");
  const [draftAttachments, setDraftAttachments] = useState([]);
  const [uploadingAttachments, setUploadingAttachments] = useState([]);
  const [liveMessages, setLiveMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCallPrep, setOutgoingCallPrep] = useState(null);
  const [startingCall, setStartingCall] = useState(false);
  const [callSession, setCallSession] = useState(EMPTY_CALL_SESSION);
  const callSessionRef = useRef(callSession);
  const incomingCallRef = useRef(incomingCall);
  const pendingInviteRef = useRef(null);

  useEffect(() => {
    callSessionRef.current = callSession;
  }, [callSession]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    const onHandledElsewhere = (event) => {
      const roomName = String(event?.detail?.roomName || "");
      if (!roomName || String(incomingCallRef.current?.roomName || "") !== roomName) return;
      callOperationRef.current += 1;
      setIncomingCall(null);
    };
    window.addEventListener("nesti:incoming-call-handled", onHandledElsewhere);
    return () =>
      window.removeEventListener("nesti:incoming-call-handled", onHandledElsewhere);
  }, []);

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
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      if (myUserId && String(payload.user_id) === String(myUserId)) return;
      const roomName = String(payload.room_name || `prochat:${threadId}`);
      const currentIncomingRoom = String(incomingCallRef.current?.roomName || "");
      if (currentIncomingRoom === roomName) return;
      if (callSessionRef.current?.open || currentIncomingRoom) {
        socket.emit("prochat:call_decline", {
          thread_id: threadId,
          room_name: roomName,
          call_type: payload.call_type || "voice",
        });
        return;
      }
      markIncomingCallHandled(payload.room_name);
      toast.dismiss(`incoming-call:${String(payload.room_name || "")}`);
      const callType =
        String(payload.call_type || "voice").toLowerCase() === "video" ? "video" : "voice";
      void warmLiveKitHost();
      void prewarmCallMedia({ video: callType === "video" });
      setIncomingCall({
        roomName,
        callType,
        callerName: String(payload.sender_name || "Participant"),
        participantStates: Array.isArray(payload.participant_states)
          ? payload.participant_states
          : [],
        transcriptionStatus: payload.transcription_status || "pending",
        expiresAt: Date.now() + 85_000,
      });
    };
    socket.on("prochat:call_invite", onCallInvite);

    const onCallDecline = (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      if (myUserId && String(payload.user_id) === String(myUserId)) return;
      const activeRoom = String(callSessionRef.current?.roomName || "");
      const incomingRoom = String(incomingCallRef.current?.roomName || "");
      const eventRoom = String(payload.room_name || "");
      if (eventRoom !== activeRoom && eventRoom !== incomingRoom) return;
      toast.info("Call was declined.");
      callOperationRef.current += 1;
      clearBrowserCallActive(eventRoom);
      setIncomingCall(null);
      setCallSession(EMPTY_CALL_SESSION);
    };
    socket.on("prochat:call_decline", onCallDecline);

    const onCallAccepted = (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      const eventRoom = String(payload.room_name || "");
      setCallSession((current) =>
        current.open && eventRoom && String(current.roomName || "") === eventRoom
          ? { ...current, ringing: false, peerConnecting: false }
          : current,
      );
    };
    socket.on("prochat:call_accepted", onCallAccepted);

    const onCallParticipant = (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      const eventRoom = String(payload.room_name || "");
      const activeRoom = String(callSessionRef.current?.roomName || "");
      const incomingRoom = String(incomingCallRef.current?.roomName || "");
      if (!eventRoom || (eventRoom !== activeRoom && eventRoom !== incomingRoom)) return;
      const participantStates = Array.isArray(payload.participant_states)
        ? payload.participant_states
        : [];
      const peerJoined = participantStates.some(
        (participant) =>
          String(participant?.user_id || "") !== String(myUserId) &&
          participant?.status === "joined",
      );
      setIncomingCall((current) =>
        current && String(current.roomName || "") === eventRoom
          ? {
              ...current,
              participantStates,
              transcriptionStatus:
                payload.transcription_status || current.transcriptionStatus,
            }
          : current,
      );
      setCallSession((current) =>
        current.open && String(current.roomName || "") === eventRoom
          ? {
              ...current,
              participantStates,
              transcriptionStatus:
                payload.transcription_status || current.transcriptionStatus,
              ringing: current.ringing && !peerJoined,
              peerConnecting: peerJoined ? false : current.peerConnecting,
            }
          : current,
      );
    };
    socket.on("prochat:call_participant", onCallParticipant);

    const onCallEnded = (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      if (myUserId && String(payload.user_id) === String(myUserId)) return;
      const activeRoom = String(callSessionRef.current?.roomName || "");
      const incomingRoom = String(incomingCallRef.current?.roomName || "");
      const eventRoom = String(payload.room_name || "");
      if (eventRoom !== activeRoom && eventRoom !== incomingRoom) return;
      setIncomingCall(null);
      callOperationRef.current += 1;
      clearBrowserCallActive(eventRoom);
      resolveIncomingCallAcrossTabs(eventRoom, "ended");
      setCallSession(EMPTY_CALL_SESSION);
    };
    socket.on("prochat:call_ended", onCallEnded);

    socket.on("connect_error", (error) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[lead-direct-chat] connect_error", error?.message || error);
      }
    });

    return () => {
      const active = callSessionRef.current;
      if (active?.open && active.roomName && socket.connected) {
        socket.emit("prochat:call_ended", {
          thread_id: threadId,
          room_name: active.roomName,
          call_type: active.callType || "voice",
        });
      }
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

  useEffect(() => {
    const endActiveCall = () => {
      const active = callSessionRef.current;
      const socket = socketRef.current;
      clearBrowserCallActive(active?.roomName);
      if (!active?.open || !active.roomName || !socket?.connected) return;
      socket.emit("prochat:call_ended", {
        thread_id: threadId,
        room_name: active.roomName,
        call_type: active.callType || "voice",
      });
    };
    window.addEventListener("pagehide", endActiveCall);
    return () => {
      window.removeEventListener("pagehide", endActiveCall);
      endActiveCall();
    };
  }, [threadId]);

  const openCallSession = async (callType, roomNameHint = "", { ringing = false } = {}) => {
    if (!token || !threadId) return null;
    const normalizedType =
      String(callType || "").toLowerCase() === "video" ? "video" : "voice";
    void warmLiveKitHost();
    void prewarmCallMedia({ video: normalizedType === "video" });
    const transcriptionConsent = await consumeCallTranscriptionConsent();
    if (isBrowserCallBusy(roomNameHint)) {
      toast.info("Another call is already in progress.");
      return null;
    }
    markBrowserCallActive(roomNameHint);
    const operationId = ++callOperationRef.current;
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
        action: ringing ? "start" : "join",
        client: false,
        transcriptionConsent,
      });
      if (callOperationRef.current !== operationId) {
        if (ringing && response?.room_name) {
          void emitCallSignal("prochat:call_ended", {
            thread_id: threadId,
            room_name: response.room_name,
            call_type: normalizedType,
          });
        }
        clearBrowserCallActive(roomNameHint);
        return null;
      }
      const roomName = String(response?.room_name || roomNameHint || `prochat:${threadId}`);
      markBrowserCallActive(roomName);
      setCallSession({
        open: true,
        token: String(response?.token || ""),
        serverUrl: String(response?.url || ""),
        roomName,
        callType: normalizedType,
        connecting: false,
        ringing,
        participantStates: Array.isArray(response?.participant_states)
          ? response.participant_states
          : [],
        transcriptionStatus: response?.transcription_status || "pending",
      });
      return { roomName };
    } catch (error) {
      clearBrowserCallActive(roomNameHint);
      if (callOperationRef.current !== operationId) return null;
      setCallSession({ ...EMPTY_CALL_SESSION, callType: normalizedType });
      toast.error(error?.message || "Could not start call");
      return null;
    }
  };

  const startCall = (callType) => {
    if (
      startCallPendingRef.current ||
      callSessionRef.current?.open ||
      incomingCallRef.current
    ) {
      return;
    }
    if (!socketRef.current?.connected || !connected) {
      toast.error("Chat is not connected yet. Try again.");
      return;
    }
    resetCallTranscriptionConsent();
    setOutgoingCallPrep({
      callType: String(callType || "").toLowerCase() === "video" ? "video" : "voice",
    });
  };

  const cancelOutgoingCall = () => {
    setOutgoingCallPrep(null);
    resetCallTranscriptionConsent();
  };

  const confirmOutgoingCall = async (notesConsent) => {
    const callType = outgoingCallPrep?.callType;
    if (!callType) return;
    rememberCallTranscriptionConsent(notesConsent);
    setOutgoingCallPrep(null);
    if (
      startCallPendingRef.current ||
      callSessionRef.current?.open ||
      incomingCallRef.current
    ) {
      return;
    }
    if (!socketRef.current?.connected || !connected) {
      toast.error("Chat is not connected yet. Try again.");
      return;
    }
    startCallPendingRef.current = true;
    setStartingCall(true);
    const release = await acquireCallStartLock(threadId);
    if (!release) {
      startCallPendingRef.current = false;
      setStartingCall(false);
      return;
    }
    try {
      const roomName = `prochat:${threadId}:${safeUuid()}`;
      const started = await openCallSession(callType, roomName, { ringing: true });
      if (!started) return;
      const invite = {
        thread_id: threadId,
        room_name: started.roomName,
        call_type: callType,
      };
      pendingInviteRef.current = invite;
      if (callType === "voice") {
        pendingInviteRef.current = null;
        const ack = await emitCallSignal("prochat:call_invite", invite);
        if (!ack?.success) {
          clearBrowserCallActive(invite.room_name);
          void emitCallSignal("prochat:call_ended", invite);
          setCallSession(EMPTY_CALL_SESSION);
          toast.error(ack?.message || "Could not notify the other participant.");
          return;
        }
      }
      setIncomingCall(null);
    } finally {
      release();
      startCallPendingRef.current = false;
      setStartingCall(false);
    }
  };

  const handleCallConnected = async () => {
    const invite = pendingInviteRef.current;
    if (!invite) {
      return;
    }
    pendingInviteRef.current = null;
    const ack = await emitCallSignal("prochat:call_invite", invite);
    if (!ack?.success) {
      clearBrowserCallActive(invite.room_name);
      void emitCallSignal("prochat:call_ended", {
        thread_id: invite.thread_id,
        room_name: invite.room_name,
        call_type: invite.call_type,
      });
      setCallSession(EMPTY_CALL_SESSION);
      toast.error(ack?.message || "Could not notify the other participant.");
      return;
    }
  };

  const handleCallActivate = () => {
    activateCallSessionWhenReady({
      emit: emitCallSignal,
      getSession: () => callSessionRef.current,
      threadId,
    });
  };

  const joinIncomingCall = async () => {
    if (!incomingCall) return;
    const call = incomingCallRef.current || incomingCall;
    setIncomingCall(null);
    setCallSession((previous) => ({
      ...previous,
      open: true,
      connecting: true,
      ringing: false,
      roomName: call.roomName,
      callType: call.callType,
      participantStates: call.participantStates || [],
      transcriptionStatus: call.transcriptionStatus || "pending",
    }));
    const claimed = await claimIncomingCall(call.roomName);
    if (!claimed) {
      resetCallTranscriptionConsent();
      setCallSession(EMPTY_CALL_SESSION);
      return;
    }
    const joined = await openCallSession(call.callType, call.roomName, { ringing: false });
    if (joined) {
      resolveIncomingCallAcrossTabs(call.roomName, "answered");
    } else {
      releaseIncomingCallClaim(call.roomName);
      resetCallTranscriptionConsent();
    }
  };

  useEffect(() => {
    callOperationRef.current += 1;
    autoJoinHandledRef.current = false;
    startCallPendingRef.current = false;
    setStartingCall(false);
    setIncomingCall(null);
    setCallSession(EMPTY_CALL_SESSION);
  }, [threadId]);

  useEffect(() => {
    if (!token || !threadId || autoJoinHandledRef.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("incoming_call") !== "1") return;
    autoJoinHandledRef.current = true;
    const callType = String(params.get("call_type") || "voice").toLowerCase() === "video" ? "video" : "voice";
    const roomName = String(params.get("room_name") || "").trim();
    void openCallSession(callType, roomName, { ringing: false }).then((joined) => {
      if (!joined) {
        autoJoinHandledRef.current = false;
        return;
      }
      params.delete("incoming_call");
      params.delete("call_type");
      params.delete("room_name");
      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", next);
    });
    // openCallSession is stable enough for this one-shot deep link join
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, threadId]);

  const declineIncomingCall = async () => {
    if (!incomingCall) return;
    const ack = await emitCallSignal("prochat:call_decline", {
      thread_id: threadId,
      room_name: incomingCall.roomName,
      call_type: incomingCall.callType,
    });
    if (!ack?.success) {
      toast.error(ack?.message || "Could not decline the call.");
      return;
    }
    resolveIncomingCallAcrossTabs(incomingCall.roomName, "declined");
    setIncomingCall(null);
  };

  const closeCallSession = () => {
    callOperationRef.current += 1;
    pendingInviteRef.current = null;
    clearBrowserCallActive(callSession.roomName);
    void emitCallSignal("prochat:call_ended", {
      thread_id: threadId,
      room_name: callSession.roomName || `prochat:${threadId}`,
      call_type: callSession.callType || "voice",
    }).then((ack) => {
      if (!ack?.success && ack?.code !== "call_not_found") {
        toast.warning(ack?.message || "The call closed locally, but the end signal was not confirmed.");
      }
    });
    setCallSession(EMPTY_CALL_SESSION);
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
            onClick={() => void startCall("voice")}
            disabled={startingCall || callSession.open || Boolean(incomingCall)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-white text-text-heading transition hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Start voice call"
            title="Start voice call"
          >
            <Phone size={14} />
          </button>
          <button
            type="button"
            onClick={() => void startCall("video")}
            disabled={startingCall || callSession.open || Boolean(incomingCall)}
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

      <IncomingCallModal
        call={incomingCall}
        onAnswer={joinIncomingCall}
        onDecline={declineIncomingCall}
        onExpire={() => {
          if (incomingCall?.roomName) {
            resolveIncomingCallAcrossTabs(incomingCall.roomName, "expired");
          }
          setIncomingCall(null);
        }}
      />
      <OutgoingCallNotesModal
        open={Boolean(outgoingCallPrep)}
        callType={outgoingCallPrep?.callType || "voice"}
        title={participantName}
        pending={startingCall}
        onCancel={cancelOutgoingCall}
        onStart={(notesConsent) => void confirmOutgoingCall(notesConsent)}
      />

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

      <ProChatCallModal
        open={callSession.open}
        token={callSession.token}
        serverUrl={callSession.serverUrl}
        callType={callSession.callType}
        connecting={callSession.connecting}
        ringing={callSession.ringing}
        peerConnecting={callSession.peerConnecting}
        participantStates={callSession.participantStates}
        transcriptionStatus={callSession.transcriptionStatus}
        title={participantName}
        onClose={closeCallSession}
        onConnected={handleCallConnected}
        onActivateCall={handleCallActivate}
        onRingTimeout={() => {
          toast.info("No answer.");
          closeCallSession();
        }}
        onAnswered={() => {
          setCallSession((current) => ({
            ...current,
            ringing: false,
            peerConnecting: false,
          }));
        }}
      />
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
