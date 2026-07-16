"use client";

import {
  ControlBar,
  RoomAudioRenderer,
  useParticipants,
} from "@livekit/components-react";
import { PhoneOff, UserPlus } from "lucide-react";
import LiveCallStatus from "./LiveCallStatus";
import {
  humanParticipants,
  participantDisplayName,
  participantInitials,
  participantProfileImage,
} from "./livekitParticipants";

export default function VoiceCallView({ endLabel = "End call", onDeviceError, onEnd, onShowPeople }) {
  const participants = useParticipants();
  const humans = humanParticipants(participants);

  return (
    <div className="relative flex h-full flex-col items-center justify-between px-5 py-7">
      <RoomAudioRenderer />
      <LiveCallStatus />
      <div className="flex flex-1 flex-wrap items-center justify-center gap-10">
        {humans.map((participant) => {
          const name = participantDisplayName(participant);
          const initials = participantInitials(participant);
          const profileImage = participantProfileImage(participant);
          return (
            <div key={participant.identity} className="flex w-40 flex-col items-center gap-3 text-center">
              <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-b from-white/10 to-white/5 text-2xl font-semibold tracking-wide text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImage}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {participant.isLocal ? "You" : name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-black/55 px-2 py-2 shadow-lg backdrop-blur-md sm:w-auto sm:gap-3 sm:px-3">
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: false,
            screenShare: false,
            chat: false,
            settings: false,
            leave: false,
          }}
          onDeviceError={({ error }) => onDeviceError?.(error)}
          className="border-0 bg-transparent p-0"
        />
        {onShowPeople ? (
          <button
            type="button"
            onClick={onShowPeople}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <UserPlus size={17} />
            <span className="hidden sm:inline">People</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={onEnd}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400"
        >
          <PhoneOff size={17} />
          <span className="hidden sm:inline">{endLabel}</span>
        </button>
      </div>
    </div>
  );
}
