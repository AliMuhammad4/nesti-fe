"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store";
import { useProfileQuery } from "@/hooks/useAuthApi";
import { useWorkspaceSocket } from "@/hooks/useWorkspaceSocket";
import IncomingCallModal from "@/components/prochat/calls/IncomingCallModal";
import OutgoingCallNotesModal from "@/components/prochat/calls/OutgoingCallNotesModal";
import ProChatCallModal from "@/components/prochat/calls/ProChatCallModal";
import { createProChatCallToken } from "@/lib/proChatClient";
import {
  acquireCallStartLock,
  claimIncomingCall,
  clearBrowserCallActive,
  isBrowserCallBusy,
  markBrowserCallActive,
  releaseIncomingCallClaim,
  resolveIncomingCallAcrossTabs,
} from "@/lib/callNotifications";
import {
  consumeCallTranscriptionConsent,
  rememberCallTranscriptionConsent,
  resetCallTranscriptionConsent,
} from "@/lib/callTranscriptionConsent";
import { prewarmCallMedia, warmLiveKitHost } from "@/lib/liveKitCallPrep";

const EMPTY_CALL_SESSION = {
  open: false,
  token: "",
  serverUrl: "",
  roomName: "",
  callType: "voice",
  title: "Conversation",
  onEnd: null,
  onActive: null,
  onConnected: null,
  connecting: false,
  ringing: false,
  peerConnecting: false,
  callScope: "direct",
  isHost: false,
  participantStates: [],
  transcriptionStatus: "pending",
  onInviteParticipant: null,
};

function emitCallSignal(socket, event, payload) {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve({ success: false, message: "Realtime calling is reconnecting. Try again." });
      return;
    }
    socket.timeout(5000).emit(event, payload, (error, ack) => {
      if (error) {
        resolve({ success: false, message: "The call signal timed out." });
        return;
      }
      resolve(ack || { success: false });
    });
  });
}

export default function WorkspaceSocketBridge({ children }) {
  const [callSession, setCallSession] = useState(EMPTY_CALL_SESSION);
  const [pendingOutgoingStart, setPendingOutgoingStart] = useState(null);
  const [startingOutgoingCall, setStartingOutgoingCall] = useState(false);
  const answerOperationRef = useRef(0);
  const outgoingOperationRef = useRef(0);
  const answeringRoomRef = useRef("");
  const incomingCallRef = useRef(null);
  const callSessionRef = useRef(callSession);
  const workspaceSocketRef = useRef(null);
  const closeCallRef = useRef(() => {});
  const endedRoomsRef = useRef(new Set());
  const token = useAppSelector((s) => s.auth.token);
  const myUserId = useAppSelector((s) => s.auth.user?.id || s.auth.user?._id || "");
  const queryClient = useQueryClient();
  useProfileQuery();
  const incomingCall = useWorkspaceSocket(token, queryClient, {
    callBusy: callSession.open,
    socketRef: workspaceSocketRef,
  });

  useEffect(() => {
    callSessionRef.current = callSession;
  }, [callSession]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    const closeRemoteCall = (event) => {
      const roomName = String(event?.detail?.roomName || "");
      if (!roomName) return;
      clearBrowserCallActive(roomName);
      if (
        answeringRoomRef.current === roomName ||
        String(incomingCallRef.current?.call?.roomName || "") === roomName
      ) {
        answerOperationRef.current += 1;
        answeringRoomRef.current = "";
        releaseIncomingCallClaim(roomName);
        incomingCallRef.current?.dismiss?.();
      }
      setCallSession((current) => {
        if (String(current.roomName || "") !== roomName) return current;
        endedRoomsRef.current.add(roomName);
        return EMPTY_CALL_SESSION;
      });
    };
    window.addEventListener("nesti:active-call-ended", closeRemoteCall);
    const updateParticipant = (event) => {
      const payload = event?.detail || {};
      const roomName = String(payload.room_name || "");
      if (!roomName) return;
      setCallSession((current) => {
        if (!current.open || String(current.roomName || "") !== roomName) return current;
        const participantStates = Array.isArray(payload.participant_states)
          ? payload.participant_states
          : current.participantStates;
        const peerJoined = participantStates.some(
          (participant) =>
            String(participant?.user_id || "") !== String(myUserId) &&
            participant?.status === "joined",
        );
        return {
          ...current,
          callScope: payload.call_scope === "multiparty" ? "multiparty" : current.callScope,
          participantStates,
          transcriptionStatus:
            payload.transcription_status || current.transcriptionStatus,
          ringing: current.ringing && !peerJoined,
          peerConnecting: peerJoined ? false : current.peerConnecting,
        };
      });
    };
    const markCallAccepted = (event) => {
      const payload = event?.detail || {};
      const roomName = String(payload.room_name || "");
      if (!roomName) return;
      setCallSession((current) =>
        current.open && String(current.roomName || "") === roomName
          ? { ...current, ringing: false, peerConnecting: false }
          : current,
      );
    };
    const closeEndedCall = (event) => {
      const payload = event?.detail || {};
      closeRemoteCall({ detail: { roomName: payload.room_name } });
    };
    window.addEventListener("nesti:prochat-call-accepted", markCallAccepted);
    window.addEventListener("nesti:prochat-call-participant", updateParticipant);
    window.addEventListener("nesti:prochat-call-ended", closeEndedCall);
    return () => {
      window.removeEventListener("nesti:active-call-ended", closeRemoteCall);
      window.removeEventListener("nesti:prochat-call-accepted", markCallAccepted);
      window.removeEventListener("nesti:prochat-call-participant", updateParticipant);
      window.removeEventListener("nesti:prochat-call-ended", closeEndedCall);
    };
  }, [myUserId]);

  useEffect(() => {
    const startCallFromHistory = (event) => {
      const request = event?.detail || {};
      const threadId = String(request.threadId || "").trim();
      const callType = String(request.callType || "voice").toLowerCase() === "video"
        ? "video"
        : "voice";
      const finish = (result) => {
        if (typeof request.onResult === "function") {
          request.onResult(result);
        } else if (!result?.success) {
          toast.error(result?.message || "Could not start the call.");
        }
      };
      if (!threadId) {
        finish({ success: false, message: "This call has no conversation." });
        return;
      }
      if (
        callSessionRef.current.open ||
        incomingCallRef.current ||
        isBrowserCallBusy()
      ) {
        finish({ success: false, message: "Finish the current call before starting another." });
        return;
      }
      void warmLiveKitHost();
      void prewarmCallMedia({ video: callType === "video" });
      resetCallTranscriptionConsent();
      setPendingOutgoingStart({ request, threadId, callType });
    };
    window.addEventListener("nesti:start-call", startCallFromHistory);
    return () => window.removeEventListener("nesti:start-call", startCallFromHistory);
  }, [queryClient, token]);

  const cancelPendingOutgoingStart = () => {
    setPendingOutgoingStart(null);
    resetCallTranscriptionConsent();
  };

  const confirmPendingOutgoingStart = async (notesConsent) => {
    const pending = pendingOutgoingStart;
    if (!pending) return;
    const { request, threadId, callType } = pending;
    const finish = (result) => {
      if (typeof request.onResult === "function") {
        request.onResult(result);
      } else if (!result?.success) {
        toast.error(result?.message || "Could not start the call.");
      }
    };
    rememberCallTranscriptionConsent(notesConsent);
    setPendingOutgoingStart(null);
    const transcriptionConsent = await consumeCallTranscriptionConsent();
    if (
      callSessionRef.current.open ||
      incomingCallRef.current ||
      isBrowserCallBusy()
    ) {
      finish({ success: false, message: "Finish the current call before starting another." });
      return;
    }
    setStartingOutgoingCall(true);
    const release = await acquireCallStartLock(threadId);
    if (!release) {
      setStartingOutgoingCall(false);
      finish({ success: false, message: "A call is already being started." });
      return;
    }
    const operationId = ++outgoingOperationRef.current;
    setCallSession({
      ...EMPTY_CALL_SESSION,
      open: true,
      connecting: true,
      ringing: true,
      callType,
      title: String(request.title || "Participant"),
      isHost: true,
    });
    try {
      const response = await createProChatCallToken({
        token,
        id: threadId,
        callType,
        action: "start",
        client: Boolean(request.client),
        transcriptionConsent,
      });
      if (outgoingOperationRef.current !== operationId) return;
      const roomName = String(response?.room_name || "");
      const payload = {
        thread_id: threadId,
        room_name: roomName,
        call_type: callType,
      };
      let invited = false;
      if (callType === "voice") {
        invited = true;
        const ack = await emitCallSignal(
          workspaceSocketRef.current,
          "prochat:call_invite",
          payload,
        );
        if (!ack?.success) {
          void emitCallSignal(
            workspaceSocketRef.current,
            "prochat:call_ended",
            payload,
          );
          setCallSession(EMPTY_CALL_SESSION);
          finish({
            success: false,
            message: ack?.message || "Could not notify the participant.",
          });
          return;
        }
      }
      markBrowserCallActive(roomName);
      endedRoomsRef.current.delete(roomName);
      setCallSession({
        open: true,
        token: String(response?.token || ""),
        serverUrl: String(response?.url || ""),
        roomName,
        callType,
        title: String(request.title || "Participant"),
        connecting: false,
        ringing: true,
        callScope: response?.call_scope === "multiparty" ? "multiparty" : "direct",
        isHost: true,
        participantStates: Array.isArray(response?.participant_states)
          ? response.participant_states
          : [],
        transcriptionStatus: response?.transcription_status || "pending",
        onInviteParticipant: async (targetUserId) => {
          const ack = await emitCallSignal(
            workspaceSocketRef.current,
            "prochat:call_invite",
            {
              ...payload,
              target_user_id: targetUserId,
            },
          );
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
        onActive: null,
        onConnected: async () => {
          if (invited) return;
          invited = true;
          const ack = await emitCallSignal(
            workspaceSocketRef.current,
            "prochat:call_invite",
            payload,
          );
          if (!ack?.success) {
            toast.error(ack?.message || "Could not notify the participant.");
            closeCallRef.current();
          }
        },
        onEnd: () =>
          emitCallSignal(
            workspaceSocketRef.current,
            "prochat:call_ended",
            payload,
          ).then(
            (ack) => Boolean(ack?.success || ack?.code === "call_not_found"),
          ),
      });
      queryClient.invalidateQueries({ queryKey: ["prochat-call-records"] });
      finish({ success: true });
    } catch (error) {
      if (outgoingOperationRef.current !== operationId) return;
      setCallSession(EMPTY_CALL_SESSION);
      finish({ success: false, message: error?.message || "Could not start the call." });
    } finally {
      release();
      setStartingOutgoingCall(false);
    }
  };

  const answerIncomingCall = async () => {
    const pending = incomingCall;
    const call = pending?.call;
    if (!call?.threadId || !call?.roomName) return;
    pending.dismiss?.();
    setCallSession({
      open: true,
      connecting: true,
      ringing: false,
      token: "",
      serverUrl: "",
      roomName: call.roomName,
      callType: call.callType || "voice",
      title: call.callerName || "Conversation",
      callScope: call.callScope === "multiparty" ? "multiparty" : "direct",
      isHost: false,
      participantStates: Array.isArray(call.participantStates) ? call.participantStates : [],
      transcriptionStatus: call.transcriptionStatus || "pending",
      onEnd: pending.onEnd,
      onActive: pending.onActive,
    });
    void warmLiveKitHost();
    void prewarmCallMedia({
      video: String(call.callType || "").toLowerCase() === "video",
    });
    const transcriptionConsent = await consumeCallTranscriptionConsent();
    const claimed = await claimIncomingCall(call.roomName);
    if (!claimed) {
      resetCallTranscriptionConsent();
      setCallSession(EMPTY_CALL_SESSION);
      return;
    }
    const operationId = ++answerOperationRef.current;
    answeringRoomRef.current = call.roomName;
    markBrowserCallActive(call.roomName);
    try {
      const response = await createProChatCallToken({
        token,
        id: call.threadId,
        callType: call.callType,
        roomName: call.roomName,
        action: "join",
        client: Boolean(call.client),
        transcriptionConsent,
      });
      if (
        answerOperationRef.current !== operationId ||
        answeringRoomRef.current !== call.roomName
      ) {
        return;
      }
      answeringRoomRef.current = "";
      resolveIncomingCallAcrossTabs(call.roomName, "answered");
      setCallSession({
        open: true,
        token: String(response?.token || ""),
        serverUrl: String(response?.url || ""),
        roomName: String(response?.room_name || call.roomName),
        callType: String(response?.call_type || call.callType || "voice"),
        title: call.callerName || "Conversation",
        callScope: call.callScope === "multiparty" ? "multiparty" : "direct",
        isHost: false,
        participantStates: Array.isArray(call.participantStates)
          ? call.participantStates
          : [],
        transcriptionStatus: response?.transcription_status || "pending",
        connecting: false,
        onEnd: pending.onEnd,
        onActive: pending.onActive,
      });
    } catch (error) {
      if (answerOperationRef.current !== operationId) return;
      answeringRoomRef.current = "";
      resetCallTranscriptionConsent();
      releaseIncomingCallClaim(call.roomName);
      clearBrowserCallActive(call.roomName);
      setCallSession(EMPTY_CALL_SESSION);
      toast.error(error?.message || "Could not join the call.");
    }
  };

  const closeCall = () => {
    answerOperationRef.current += 1;
    outgoingOperationRef.current += 1;
    answeringRoomRef.current = "";
    const current = callSessionRef.current;
    clearBrowserCallActive(current.roomName);
    setCallSession(EMPTY_CALL_SESSION);
    if (current.roomName) {
      window.dispatchEvent(
        new CustomEvent("nesti:call-history-ended", {
          detail: { roomName: current.roomName },
        }),
      );
    }
    queryClient.invalidateQueries({ queryKey: ["prochat-call-records"] });
    if (!current.roomName || endedRoomsRef.current.has(current.roomName)) return;
    endedRoomsRef.current.add(current.roomName);
    const endRequest = current.onEnd?.();
    if (!endRequest) return;
    void endRequest.then((confirmed) => {
      queryClient.invalidateQueries({ queryKey: ["prochat-call-records"] });
      if (!confirmed) {
        toast.warning("The call closed locally, but the end signal was not confirmed.");
      }
    });
  };
  closeCallRef.current = closeCall;

  return (
    <>
      {children}
      <IncomingCallModal
        call={incomingCall?.call}
        onAnswer={answerIncomingCall}
        onDecline={incomingCall?.onDecline}
        onExpire={() => {
          const roomName = incomingCall?.call?.roomName;
          if (roomName) resolveIncomingCallAcrossTabs(roomName, "expired");
          incomingCall?.dismiss?.();
        }}
      />
      <OutgoingCallNotesModal
        open={Boolean(pendingOutgoingStart)}
        callType={pendingOutgoingStart?.callType || "voice"}
        title={String(pendingOutgoingStart?.request?.title || "Participant")}
        pending={startingOutgoingCall}
        onCancel={cancelPendingOutgoingStart}
        onStart={(notesConsent) => void confirmPendingOutgoingStart(notesConsent)}
      />
      <ProChatCallModal
        open={callSession.open}
        token={callSession.token}
        serverUrl={callSession.serverUrl}
        callType={callSession.callType}
        title={callSession.title}
        connecting={callSession.connecting}
        ringing={callSession.ringing}
        peerConnecting={callSession.peerConnecting}
        callScope={callSession.callScope}
        isHost={callSession.isHost}
        participantStates={callSession.participantStates}
        transcriptionStatus={callSession.transcriptionStatus}
        myUserId={myUserId}
        onInviteParticipant={callSession.onInviteParticipant}
        onClose={closeCall}
        onConnected={() => {
          if (callSession.onConnected) {
            void callSession.onConnected();
          }
        }}
        onActivateCall={callSession.onActive || undefined}
        onRingTimeout={() => {
          toast.info("No answer.");
          closeCall();
        }}
        onAnswered={() => {
          setCallSession((current) => ({
            ...current,
            ringing: false,
            peerConnecting: false,
          }));
          queryClient.invalidateQueries({ queryKey: ["prochat-call-records"] });
        }}
      />
    </>
  );
}
