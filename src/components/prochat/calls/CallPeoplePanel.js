"use client";

import { useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { participantNotesChoiceLabel } from "@/lib/callTranscriptionConsent";

export default function CallPeoplePanel({
  participantStates,
  members,
  myUserId,
  isHost,
  onClose,
  onInviteParticipant,
}) {
  const [invitingUserId, setInvitingUserId] = useState("");
  const memberById = new Map(
    (Array.isArray(members) ? members : []).map((member) => [
      String(member?.id || member?._id || ""),
      member,
    ]),
  );
  const normalizedParticipantStates = (Array.isArray(participantStates) ? participantStates : [])
    .map((participant) => ({
      ...participant,
      user_id: String(participant?.user_id || ""),
      status: String(participant?.status || "invited"),
    }))
    .filter((participant) => participant.user_id);

  return (
    <aside className="absolute inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">People</p>
          <p className="text-xs text-slate-400">
            {normalizedParticipantStates.length} call participants
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 hover:bg-white/10"
          aria-label="Close people panel"
        >
          <X size={16} />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {normalizedParticipantStates.map((participant) => {
          const member = memberById.get(participant.user_id);
          const name =
            member?.full_name ||
            [member?.first_name, member?.last_name].filter(Boolean).join(" ") ||
            (participant.user_id === String(myUserId) ? "You" : "Participant");
          const canReinvite =
            isHost &&
            participant.user_id !== String(myUserId) &&
            participant.status !== "joined" &&
            typeof onInviteParticipant === "function";
          return (
            <div
              key={participant.user_id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{name}</p>
                <p className="text-xs capitalize text-slate-400">{participant.status}</p>
                <p
                  className={`mt-0.5 text-[10px] ${
                    participant.transcription_consent === true
                      ? "text-emerald-300"
                      : participant.transcription_consent === false
                        ? "text-slate-400"
                        : "text-amber-300"
                  }`}
                >
                  {participantNotesChoiceLabel(participant.transcription_consent)}
                </p>
              </div>
              {canReinvite ? (
                <button
                  type="button"
                  disabled={invitingUserId === participant.user_id}
                  onClick={async () => {
                    setInvitingUserId(participant.user_id);
                    try {
                      await onInviteParticipant(participant.user_id);
                    } finally {
                      setInvitingUserId("");
                    }
                  }}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-emerald-500 px-3 text-xs font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
                >
                  {invitingUserId === participant.user_id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <UserPlus size={13} />
                  )}
                  {participant.status === "invited" ? "Ring again" : "Reinvite"}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
