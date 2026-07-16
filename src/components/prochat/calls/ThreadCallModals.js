"use client";

import { toast } from "react-toastify";
import IncomingCallModal from "@/components/prochat/calls/IncomingCallModal";
import OutgoingCallNotesModal from "@/components/prochat/calls/OutgoingCallNotesModal";
import ProChatCallModal from "@/components/prochat/calls/ProChatCallModal";

/**
 * Shared call modals for thread chats. Pass the object returned by useThreadCallSession.
 */
export default function ThreadCallModals({
  call,
  title,
  members,
  myUserId,
  onRingTimeoutMessage = "No answer.",
}) {
  if (!call) return null;

  return (
    <>
      <IncomingCallModal
        call={call.incomingCall}
        onAnswer={call.joinIncomingCall}
        onDecline={call.declineIncomingCall}
        onExpire={call.expireIncomingCall}
      />
      <OutgoingCallNotesModal
        open={Boolean(call.outgoingCallPrep)}
        callType={call.outgoingCallPrep?.callType || "voice"}
        title={title}
        pending={call.startingCall}
        onCancel={call.cancelOutgoingCall}
        onStart={(notesConsent) => void call.confirmOutgoingCall(notesConsent)}
      />
      <ProChatCallModal
        open={call.callSession.open}
        token={call.callSession.token}
        serverUrl={call.callSession.serverUrl}
        callType={call.callSession.callType}
        connecting={call.callSession.connecting}
        ringing={call.callSession.ringing}
        peerConnecting={call.callSession.peerConnecting}
        callScope={call.callSession.callScope}
        isHost={call.callSession.isHost}
        participantStates={call.callSession.participantStates}
        transcriptionStatus={call.callSession.transcriptionStatus}
        members={members}
        myUserId={myUserId}
        onInviteParticipant={call.inviteCallParticipant}
        title={title}
        onClose={call.closeCallSession}
        onConnected={call.handleCallConnected}
        onActivateCall={call.handleCallActivate}
        onRingTimeout={() => {
          toast.info(
            call.callSession.peerConnecting
              ? "Could not connect the call."
              : onRingTimeoutMessage,
          );
          call.closeCallSession();
        }}
        onAnswered={call.handleCallAnswered}
      />
    </>
  );
}
