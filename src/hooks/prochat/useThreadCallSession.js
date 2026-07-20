"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { safeUuid } from "@/components/prochat/thread/proChatThreadUtils";
import {
  acquireCallStartLock,
  claimIncomingCall,
  clearBrowserCallActive,
  clearIncomingCallHandled,
  isBrowserCallBusy,
  markIncomingCallHandled,
  markBrowserCallActive,
  releaseIncomingCallClaim,
  resolveIncomingCallAcrossTabs,
} from "@/lib/callNotifications";
import { createProChatCallToken } from "@/lib/proChatClient";
import {
  cancelPendingCallTranscriptionConsent,
  consumeCallTranscriptionConsent,
  takeCallTranscriptionConsent,
  resetCallTranscriptionConsent,
} from "@/lib/callTranscriptionConsent";
import { activateCallSessionWhenReady } from "@/lib/callActivation";
import {
  emitCallSignal as emitSocketCallSignal,
  emitCallEndSignal,
  isCallEndConfirmed,
} from "@/lib/callSignal";
import { prewarmCallMedia, warmLiveKitHost } from "@/lib/liveKitCallPrep";

export function emptyCallSession(callType = "voice") {
  return {
    open: false,
    token: "",
    serverUrl: "",
    roomName: "",
    callType,
    connecting: false,
    ringing: false,
    peerConnecting: false,
    callScope: "direct",
    isHost: false,
    participantStates: [],
    transcriptionStatus: "pending",
    callId: "",
    transcriptionConsent: false,
  };
}

/**
 * Shared live-call session for thread chats (messages, leads, inquiries).
 * Parent owns the socket; this hook owns call state + signaling actions.
 */
export function useThreadCallSession({
  token,
  threadId,
  myUserId,
  socketRef,
  connected = false,
  client = false,
  enableMultiparty = false,
  requireConnectedFlag = true,
  title = "Conversation",
}) {
  const autoJoinHandledRef = useRef(false);
  const callOperationRef = useRef(0);
  const pendingInviteRef = useRef(null);
  const startCallPendingRef = useRef(false);
  const endingRoomsRef = useRef(new Set());
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCallPrep, setOutgoingCallPrep] = useState(null);
  const [startingCall, setStartingCall] = useState(false);
  const [callSession, setCallSession] = useState(() =>
    emptyCallSession("voice"),
  );
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
    setOutgoingCallPrep(null);
    setCallSession(emptyCallSession("voice"));
    startCallPendingRef.current = false;
    setStartingCall(false);
    return () => {
      callOperationRef.current += 1;
      cancelPendingCallTranscriptionConsent();
      // Leaving the thread without answering must not permanently swallow reinvites.
      const pendingRoom = String(incomingCallRef.current?.roomName || "").trim();
      if (pendingRoom) clearIncomingCallHandled(pendingRoom);
    };
  }, [threadId, enableMultiparty]);

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
    (eventName, payload) => emitSocketCallSignal(socketRef.current, eventName, payload),
    [socketRef],
  );

  const emitCallEnd = useCallback(
    (eventName, payload) => emitCallEndSignal(socketRef.current, eventName, payload),
    [socketRef],
  );

  const endSignalFor = useCallback(
    (active) => {
      if (
        enableMultiparty &&
        active?.callScope === "multiparty" &&
        !active?.isHost
      ) {
        return "prochat:call_leave";
      }
      return "prochat:call_ended";
    },
    [enableMultiparty],
  );

  const endActiveCall = useCallback(() => {
    const active = callSessionRef.current;
    const socket = socketRef.current;
    const roomName = String(active?.roomName || "").trim();
    clearBrowserCallActive(roomName);
    if (!active?.open || !roomName || !socket?.connected) return;
    if (endingRoomsRef.current.has(roomName)) return;
    endingRoomsRef.current.add(roomName);
    socket.emit(endSignalFor(active), {
      thread_id: threadId,
      room_name: roomName,
      call_type: active.callType || "voice",
    });
    window.setTimeout(() => endingRoomsRef.current.delete(roomName), 8_000);
  }, [endSignalFor, socketRef, threadId]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    window.addEventListener("pagehide", endActiveCall);
    return () => {
      window.removeEventListener("pagehide", endActiveCall);
      endActiveCall();
    };
  }, [endActiveCall]);

  const socketReady = useCallback(() => {
    if (!socketRef.current?.connected) return false;
    if (requireConnectedFlag && !connected) return false;
    return true;
  }, [connected, requireConnectedFlag, socketRef]);

  const openCallSession = useCallback(
    async (
      callType,
      roomNameHint = "",
      { ringing = false, transcriptionConsent: consentOverride } = {},
    ) => {
      if (!token || !threadId) return null;
      const normalizedType =
        String(callType || "").toLowerCase() === "video" ? "video" : "voice";
      const operationId = ++callOperationRef.current;
      const warmPromise = Promise.all([
        warmLiveKitHost(),
        prewarmCallMedia({ video: normalizedType === "video" }),
      ]);
      const transcriptionConsent =
        typeof consentOverride === "boolean"
          ? consentOverride
          : await consumeCallTranscriptionConsent();
      if (callOperationRef.current !== operationId) {
        return null;
      }
      if (isBrowserCallBusy(roomNameHint)) {
        toast.info("Another call is already in progress.");
        return null;
      }
      markBrowserCallActive(roomNameHint);
      try {
        setCallSession((previous) => ({
          ...previous,
          open: true,
          connecting: true,
          ringing,
          roomName: roomNameHint,
          callType: normalizedType,
          isHost: Boolean(ringing),
        }));
        const [response] = await Promise.all([
          createProChatCallToken({
            token,
            id: threadId,
            callType: normalizedType,
            roomName: roomNameHint,
            action: ringing ? "start" : "join",
            client: Boolean(client),
            transcriptionConsent,
          }),
          warmPromise,
        ]);
        if (callOperationRef.current !== operationId) {
          if (ringing && response?.room_name) {
            void emitCallSignal("prochat:call_ended", {
              thread_id: threadId,
              room_name: response.room_name,
              call_type: normalizedType,
            });
          }
          clearBrowserCallActive(roomNameHint);
          setCallSession(emptyCallSession(normalizedType));
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
          peerConnecting: false,
          callScope:
            enableMultiparty && response?.call_scope === "multiparty"
              ? "multiparty"
              : "direct",
          isHost: Boolean(ringing),
          participantStates: Array.isArray(response?.participant_states)
            ? response.participant_states
            : [],
          transcriptionStatus: response?.transcription_status || "pending",
          callId: String(response?.call_id || ""),
          transcriptionConsent: response?.transcription_consent === true,
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
    [client, emitCallSignal, enableMultiparty, threadId, token],
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
      if (!socketReady()) {
        toast.error("Chat is not connected yet. Try again.");
        return;
      }
      resetCallTranscriptionConsent();
      setOutgoingCallPrep({
        callType: String(callType || "").toLowerCase() === "video" ? "video" : "voice",
      });
    },
    [socketReady],
  );

  const cancelOutgoingCall = useCallback(() => {
    setOutgoingCallPrep(null);
    cancelPendingCallTranscriptionConsent();
    startCallPendingRef.current = false;
    setStartingCall(false);
  }, []);

  const confirmOutgoingCall = useCallback(
    async (notesConsent) => {
      const callType = outgoingCallPrep?.callType;
      if (!callType) return;
      const transcriptionConsent = takeCallTranscriptionConsent(notesConsent);
      setOutgoingCallPrep(null);
      if (
        startCallPendingRef.current ||
        callSessionRef.current?.open ||
        incomingCallRef.current
      ) {
        return;
      }
      if (!socketReady()) {
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
        const started = await openCallSession(callType, roomName, {
          ringing: true,
          transcriptionConsent,
        });
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
            setCallSession(emptyCallSession("voice"));
            toast.error(ack?.message || "Could not notify the other participant.");
            return;
          }
          if (ack?.call) {
            setCallSession((current) => ({
              ...current,
              callScope:
                enableMultiparty && ack.call.call_scope === "multiparty"
                  ? "multiparty"
                  : current.callScope,
              participantStates: Array.isArray(ack.call.participant_states)
                ? ack.call.participant_states
                : current.participantStates,
              callId: String(ack.call.call_id || current.callId || ""),
              transcriptionStatus:
                ack.call.transcription_status || current.transcriptionStatus,
            }));
          }
        }
        setIncomingCall(null);
      } finally {
        release();
        startCallPendingRef.current = false;
        setStartingCall(false);
      }
    },
    [
      emitCallSignal,
      enableMultiparty,
      openCallSession,
      outgoingCallPrep?.callType,
      socketReady,
      threadId,
    ],
  );

  const handleCallConnected = useCallback(async () => {
    const invite = pendingInviteRef.current;
    if (!invite) return;
    pendingInviteRef.current = null;
    const ack = await emitCallSignal("prochat:call_invite", invite);
    if (!ack?.success) {
      clearBrowserCallActive(invite.room_name);
      void emitCallSignal("prochat:call_ended", {
        thread_id: invite.thread_id,
        room_name: invite.room_name,
        call_type: invite.call_type,
      });
      setCallSession(emptyCallSession("voice"));
      toast.error(ack?.message || "Could not notify the other participant.");
      return;
    }
    if (ack?.call) {
      setCallSession((current) => ({
        ...current,
        callScope:
          enableMultiparty && ack.call.call_scope === "multiparty"
            ? "multiparty"
            : current.callScope,
        participantStates: Array.isArray(ack.call.participant_states)
          ? ack.call.participant_states
          : current.participantStates,
        callId: String(ack.call.call_id || current.callId || ""),
        transcriptionStatus:
          ack.call.transcription_status || current.transcriptionStatus,
      }));
    }
  }, [emitCallSignal, enableMultiparty]);

  const handleCallActivate = useCallback(() => {
    activateCallSessionWhenReady({
      emit: emitCallSignal,
      getSession: () => callSessionRef.current,
      threadId,
      onFailure: (result) => {
        if (result?.code === "call_closed") return;
        toast.warning(
          result?.message ||
            "Could not mark the call active yet. Still connecting…",
        );
      },
    });
  }, [emitCallSignal, threadId]);

  const joinIncomingCall = useCallback(async (notesConsent) => {
    const call = incomingCallRef.current;
    if (!call) return;
    // Resolve consent before the connecting UI so the policy modal never stacks on it.
    const transcriptionConsent =
      typeof notesConsent === "boolean"
        ? takeCallTranscriptionConsent(notesConsent)
        : await consumeCallTranscriptionConsent();
    if (incomingCallRef.current?.roomName !== call.roomName) {
      return;
    }
    setIncomingCall(null);
    setCallSession((previous) => ({
      ...previous,
      open: true,
      connecting: true,
      ringing: false,
      roomName: call.roomName,
      callType: call.callType,
      callScope: call.callScope || previous.callScope || "direct",
      isHost: false,
      participantStates: call.participantStates || [],
      transcriptionStatus: call.transcriptionStatus || "pending",
      callId: String(call.callId || ""),
    }));
    const claimed = await claimIncomingCall(call.roomName);
    if (!claimed) {
      setCallSession(emptyCallSession("voice"));
      return;
    }
    const joined = await openCallSession(call.callType, call.roomName, {
      ringing: false,
      transcriptionConsent,
    });
    if (joined) {
      resolveIncomingCallAcrossTabs(call.roomName, "answered");
    } else {
      releaseIncomingCallClaim(call.roomName);
      setCallSession(emptyCallSession("voice"));
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
    cancelPendingCallTranscriptionConsent();
    pendingInviteRef.current = null;
    const active = callSessionRef.current;
    const roomName = String(active.roomName || "").trim();
    clearBrowserCallActive(roomName);
    setCallSession(emptyCallSession("voice"));
    if (!roomName || endingRoomsRef.current.has(roomName)) return;
    endingRoomsRef.current.add(roomName);
    void emitCallEnd(endSignalFor(active), {
      thread_id: threadId,
      room_name: roomName,
      call_type: active.callType || "voice",
    }).then((ack) => {
      // Keep the set entry briefly so pagehide / Strict Mode cleanup don't double-end.
      window.setTimeout(() => endingRoomsRef.current.delete(roomName), 8_000);
      if (isCallEndConfirmed(ack)) return;
      // One more delayed retry if the ack was only a timeout/disconnect.
      void emitCallEnd(endSignalFor(active), {
        thread_id: threadId,
        room_name: roomName,
        call_type: active.callType || "voice",
      }).then((retryAck) => {
        if (isCallEndConfirmed(retryAck)) return;
        toast.warning(
          retryAck?.message ||
            "The call closed locally, but the end signal was not confirmed.",
        );
      });
    });
  }, [emitCallEnd, endSignalFor, threadId]);

  const inviteCallParticipant = useCallback(
    async (targetUserId) => {
      if (!enableMultiparty) return false;
      const active = callSessionRef.current;
      if (!active?.isHost || active.callScope !== "multiparty") return false;
      const ack = await emitCallSignal("prochat:call_invite", {
        thread_id: threadId,
        room_name: active.roomName,
        call_type: active.callType,
        target_user_id: targetUserId,
      });
      if (!ack?.success) {
        toast.error(ack?.message || "Could not invite this participant.");
        return false;
      }
      setCallSession((current) => ({
        ...current,
        participantStates: Array.isArray(ack?.call?.participant_states)
          ? ack.call.participant_states
          : current.participantStates,
      }));
      toast.success("Invitation sent.");
      return true;
    },
    [emitCallSignal, enableMultiparty, threadId],
  );

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
          ? { ...current, ringing: false, peerConnecting: true }
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
      const callType =
        String(payload.call_type || "voice").toLowerCase() === "video"
          ? "video"
          : "voice";
      const nextIncoming = {
        roomName,
        callType,
        callerName: String(payload.sender_name || "Participant"),
        callScope:
          enableMultiparty && payload.call_scope === "multiparty"
            ? "multiparty"
            : "direct",
        participantStates: Array.isArray(payload.participant_states)
          ? payload.participant_states
          : [],
        transcriptionStatus: payload.transcription_status || "pending",
        callId: String(payload.call_id || ""),
        inviteOccurredAt: payload.occurred_at || new Date().toISOString(),
        expiresAt: Date.now() + 85_000,
      };
      // Same-room reinvite while already ringing: refresh timer/payload instead of no-op.
      if (currentIncomingRoom === roomName) {
        setIncomingCall((current) =>
          current && String(current.roomName || "") === roomName
            ? { ...current, ...nextIncoming }
            : current,
        );
        return;
      }
      if (callSessionRef.current?.open || currentIncomingRoom) {
        void emitCallSignal("prochat:call_decline", {
          thread_id: threadId,
          room_name: roomName,
          call_type: payload.call_type || "voice",
        });
        return;
      }
      markIncomingCallHandled(payload.room_name, "shown");
      toast.dismiss(`incoming-call:${String(payload.room_name || "")}`);
      void warmLiveKitHost();
      void prewarmCallMedia({ video: callType === "video" });
      setIncomingCall(nextIncoming);
    },
    [emitCallSignal, enableMultiparty, threadId],
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
              callId: String(payload.call_id || current.callId || ""),
            }
          : current,
      );
      setCallSession((current) =>
        current.open && String(current.roomName || "") === eventRoom
          ? {
              ...current,
              callScope:
                enableMultiparty && payload.call_scope === "multiparty"
                  ? "multiparty"
                  : current.callScope,
              participantStates,
              transcriptionStatus:
                payload.transcription_status || current.transcriptionStatus,
              callId: String(payload.call_id || current.callId || ""),
              ringing: current.ringing && !peerJoined,
            }
          : current,
      );
    },
    [enableMultiparty, myUserId, threadId],
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
      setCallSession(emptyCallSession("voice"));
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
      setCallSession(emptyCallSession("voice"));
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
    client: Boolean(client),
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
    inviteCallParticipant: enableMultiparty ? inviteCallParticipant : undefined,
  };
}
