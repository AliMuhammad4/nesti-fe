"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
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
import { createProChatCallToken } from "@/lib/proChatClient";
import {
  consumeCallTranscriptionConsent,
  rememberCallTranscriptionConsent,
  resetCallTranscriptionConsent,
} from "@/lib/callTranscriptionConsent";
import { activateCallSessionWhenReady } from "@/lib/callActivation";
import { prewarmCallMedia, warmLiveKitHost } from "@/lib/liveKitCallPrep";

const emptyCallSession = (callType = "voice") => ({
  open: false,
  token: "",
  serverUrl: "",
  roomName: "",
  callType,
  connecting: false,
  ringing: false,
  peerConnecting: false,
  participantStates: [],
  transcriptionStatus: "pending",
});

export function useInquiryCallSession({
  token,
  threadId,
  myUserId,
  socketRef,
  connected,
  title = "Inquiry",
}) {
  const autoJoinHandledRef = useRef(false);
  const callOperationRef = useRef(0);
  const pendingInviteRef = useRef(null);
  const startCallPendingRef = useRef(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCallPrep, setOutgoingCallPrep] = useState(null);
  const [startingCall, setStartingCall] = useState(false);
  const [callSession, setCallSession] = useState(() => emptyCallSession());
  const callSessionRef = useRef(callSession);
  const incomingCallRef = useRef(incomingCall);

  useEffect(() => {
    callSessionRef.current = callSession;
  }, [callSession]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    callOperationRef.current += 1;
    autoJoinHandledRef.current = false;
    setIncomingCall(null);
    setCallSession(emptyCallSession());
    startCallPendingRef.current = false;
    setStartingCall(false);
  }, [threadId]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onHandledElsewhere = (event) => {
      const roomName = String(event?.detail?.roomName || "");
      if (!roomName || String(incomingCallRef.current?.roomName || "") !== roomName) {
        return;
      }
      callOperationRef.current += 1;
      setIncomingCall(null);
    };
    window.addEventListener("nesti:incoming-call-handled", onHandledElsewhere);
    return () =>
      window.removeEventListener("nesti:incoming-call-handled", onHandledElsewhere);
  }, []);

  const emitCallSignal = useCallback(
    (eventName, payload) => {
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
    },
    [socketRef],
  );

  const endActiveCall = useCallback(() => {
    const active = callSessionRef.current;
    const socket = socketRef.current;
    clearBrowserCallActive(active?.roomName);
    if (!active?.open || !active.roomName || !socket?.connected) return;
    socket.emit("prochat:call_ended", {
      thread_id: threadId,
      room_name: active.roomName,
      call_type: active.callType || "voice",
    });
  }, [socketRef, threadId]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    window.addEventListener("pagehide", endActiveCall);
    return () => {
      window.removeEventListener("pagehide", endActiveCall);
      endActiveCall();
    };
  }, [endActiveCall]);

  const openCallSession = useCallback(
    async (callType, roomNameHint = "", { ringing = false } = {}) => {
      if (!token || !threadId) return null;
      const normalizedType =
        String(callType || "").toLowerCase() === "video" ? "video" : "voice";
      // Overlap permission/device + LiveKit DNS/TLS warm with consent + token work.
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
        setCallSession((previous) => ({
          ...previous,
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
          client: true,
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
        const roomName = String(
          response?.room_name || roomNameHint || `prochat:${threadId}`,
        );
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
        setCallSession(emptyCallSession(normalizedType));
        toast.error(error?.message || "Could not start call");
        return null;
      }
    },
    [emitCallSignal, threadId, token],
  );

  const startCall = useCallback(
    (callType) => {
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
    },
    [connected, socketRef],
  );

  const cancelOutgoingCall = useCallback(() => {
    setOutgoingCallPrep(null);
    resetCallTranscriptionConsent();
  }, []);

  const confirmOutgoingCall = useCallback(
    async (notesConsent) => {
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
            setCallSession(emptyCallSession());
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
    },
    [connected, emitCallSignal, openCallSession, outgoingCallPrep?.callType, socketRef, threadId],
  );

  const handleCallConnected = useCallback(async () => {
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
      setCallSession(emptyCallSession());
      toast.error(ack?.message || "Could not notify the other participant.");
    }
  }, [emitCallSignal]);

  const handleCallActivate = useCallback(() => {
    activateCallSessionWhenReady({
      emit: emitCallSignal,
      getSession: () => callSessionRef.current,
      threadId,
    });
  }, [emitCallSignal, threadId]);

  const joinIncomingCall = useCallback(async () => {
    const call = incomingCallRef.current;
    if (!call) return;
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
      setCallSession(emptyCallSession());
      return;
    }
    const joined = await openCallSession(call.callType, call.roomName, {
      ringing: false,
    });
    if (joined) {
      resolveIncomingCallAcrossTabs(call.roomName, "answered");
    } else {
      releaseIncomingCallClaim(call.roomName);
      resetCallTranscriptionConsent();
    }
  }, [openCallSession]);

  const declineIncomingCall = useCallback(async () => {
    const call = incomingCallRef.current;
    if (!call) return;
    const ack = await emitCallSignal("prochat:call_decline", {
      thread_id: threadId,
      room_name: call.roomName,
      call_type: call.callType,
    });
    if (!ack?.success) {
      toast.error(ack?.message || "Could not decline the call.");
      return;
    }
    resolveIncomingCallAcrossTabs(call.roomName, "declined");
    setIncomingCall(null);
  }, [emitCallSignal, threadId]);

  const expireIncomingCall = useCallback(() => {
    const call = incomingCallRef.current;
    if (call?.roomName) {
      resolveIncomingCallAcrossTabs(call.roomName, "expired");
    }
    setIncomingCall(null);
  }, []);

  const closeCallSession = useCallback(() => {
    callOperationRef.current += 1;
    pendingInviteRef.current = null;
    const active = callSessionRef.current;
    clearBrowserCallActive(active.roomName);
    void emitCallSignal("prochat:call_ended", {
      thread_id: threadId,
      room_name: active.roomName || `prochat:${threadId}`,
      call_type: active.callType || "voice",
    }).then((ack) => {
      if (!ack?.success && ack?.code !== "call_not_found") {
        toast.warning(
          ack?.message ||
            "The call closed locally, but the end signal was not confirmed.",
        );
      }
    });
    setCallSession(emptyCallSession());
  }, [emitCallSignal, threadId]);

  const handleCallAnswered = useCallback(() => {
    setCallSession((current) => ({
      ...current,
      ringing: false,
      peerConnecting: false,
    }));
  }, []);

  const onCallAccepted = useCallback(
    (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      const eventRoom = String(payload.room_name || "");
      setCallSession((current) =>
        current.open && eventRoom && String(current.roomName || "") === eventRoom
          ? { ...current, ringing: false, peerConnecting: false }
          : current,
      );
    },
    [threadId],
  );

  const onCallInvite = useCallback(
    (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      const roomName = String(payload.room_name || `prochat:${threadId}`);
      const currentIncomingRoom = String(incomingCallRef.current?.roomName || "");
      if (currentIncomingRoom === roomName) return;
      if (callSessionRef.current?.open || currentIncomingRoom) {
        void emitCallSignal("prochat:call_decline", {
          thread_id: threadId,
          room_name: roomName,
          call_type: payload.call_type || "voice",
        });
        return;
      }
      markIncomingCallHandled(payload.room_name);
      toast.dismiss(`incoming-call:${String(payload.room_name || "")}`);
      const callType =
        String(payload.call_type || "voice").toLowerCase() === "video"
          ? "video"
          : "voice";
      // Warm while the user decides to answer — biggest latency win for the callee.
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
    },
    [emitCallSignal, threadId],
  );

  const onCallParticipant = useCallback(
    (payload) => {
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
          String(participant?.user_id || "") !== String(myUserId || "") &&
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
    },
    [myUserId, threadId],
  );

  const onCallDecline = useCallback(
    (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      const activeRoom = String(callSessionRef.current?.roomName || "");
      const incomingRoom = String(incomingCallRef.current?.roomName || "");
      const eventRoom = String(payload.room_name || "");
      if (eventRoom !== activeRoom && eventRoom !== incomingRoom) return;
      toast.info("Call was declined.");
      callOperationRef.current += 1;
      resetCallTranscriptionConsent();
      clearBrowserCallActive(eventRoom);
      setIncomingCall(null);
      setCallSession(emptyCallSession());
    },
    [threadId],
  );

  const onCallEnded = useCallback(
    (payload) => {
      if (!payload || String(payload.thread_id) !== String(threadId)) return;
      const activeRoom = String(callSessionRef.current?.roomName || "");
      const incomingRoom = String(incomingCallRef.current?.roomName || "");
      const eventRoom = String(payload.room_name || "");
      if (eventRoom !== activeRoom && eventRoom !== incomingRoom) return;
      setIncomingCall(null);
      callOperationRef.current += 1;
      resetCallTranscriptionConsent();
      clearBrowserCallActive(eventRoom);
      resolveIncomingCallAcrossTabs(eventRoom, "ended");
      setCallSession(emptyCallSession());
    },
    [threadId],
  );

  useEffect(() => {
    if (
      !token ||
      !threadId ||
      autoJoinHandledRef.current ||
      typeof window === "undefined"
    ) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("incoming_call") !== "1") return;
    autoJoinHandledRef.current = true;
    const callType =
      String(params.get("call_type") || "voice").toLowerCase() === "video"
        ? "video"
        : "voice";
    const roomName = String(params.get("room_name") || "").trim();
    void openCallSession(callType, roomName, { ringing: false }).then((joined) => {
      if (!joined) {
        autoJoinHandledRef.current = false;
        return;
      }
      params.delete("incoming_call");
      params.delete("call_type");
      params.delete("room_name");
      const next = `${window.location.pathname}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      window.history.replaceState({}, "", next);
    });
  }, [openCallSession, threadId, token]);

  return {
    title,
    incomingCall,
    outgoingCallPrep,
    callSession,
    startingCall,
    onCallInvite,
    onCallAccepted,
    onCallParticipant,
    onCallDecline,
    onCallEnded,
    startCall,
    confirmOutgoingCall,
    cancelOutgoingCall,
    handleCallConnected,
    handleCallActivate,
    handleCallAnswered,
    joinIncomingCall,
    declineIncomingCall,
    expireIncomingCall,
    closeCallSession,
    endActiveCall,
  };
}
