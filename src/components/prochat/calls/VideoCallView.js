"use client";

import {
  ControlBar,
  ParticipantTile,
  RoomAudioRenderer,
  useIsMuted,
  useIsSpeaking,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, PhoneOff, UserPlus, Users } from "lucide-react";
import LiveCallStatus from "./LiveCallStatus";
import { isNotesAgent, participantDisplayName } from "./livekitParticipants";

function MeetParticipantTile({ trackRef }) {
  const participant = trackRef.participant;
  const isSpeaking = useIsSpeaking(participant);
  const isMuted = useIsMuted(Track.Source.Microphone, { participant });
  const isScreenShare = trackRef.source === Track.Source.ScreenShare;
  const name = participantDisplayName(participant);

  return (
    <div
      className={`relative min-h-0 overflow-hidden rounded-2xl bg-[#202124] shadow-lg transition-all duration-200 ${
        isSpeaking
          ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950"
          : "ring-1 ring-white/10"
      }`}
    >
      <ParticipantTile
        trackRef={trackRef}
        className="h-full w-full !border-0 !bg-[#202124] [&_.lk-focus-toggle-button]:hidden [&_.lk-participant-metadata]:hidden"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="pointer-events-none absolute bottom-3 left-3 flex max-w-[calc(100%-4.5rem)] items-center gap-2 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
        <span className="truncate">
          {participant.isLocal ? "You" : name}
          {isScreenShare ? " · Presentation" : ""}
        </span>
      </div>
      <div
        className={`pointer-events-none absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full ${
          isMuted ? "bg-red-500 text-white" : "bg-black/55 text-white"
        }`}
        aria-label={isMuted ? `${name} is muted` : `${name} microphone is on`}
      >
        {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
      </div>
      {participant.isLocal ? (
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          You
        </span>
      ) : null}
    </div>
  );
}

export default function VideoCallView({ endLabel = "End call", onDeviceError, onEnd, onShowPeople }) {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]).filter((trackRef) => !isNotesAgent(trackRef.participant));
  const participantCount = new Set(
    tracks.map((trackRef) => trackRef.participant.identity),
  ).size;
  const singleTile = tracks.length === 1;

  return (
    <div className="relative flex h-full flex-col bg-[#0f1012]">
      <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2">
        <LiveCallStatus />
      </div>
      <div className="pointer-events-none absolute right-4 top-3 z-10 hidden items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur sm:flex">
        <Users size={14} />
        {participantCount} {participantCount === 1 ? "person" : "people"}
      </div>
      <div className="min-h-0 flex-1 p-3 pt-14 sm:p-4 sm:pt-14">
        <div
          className={`mx-auto grid h-full min-h-0 gap-3 sm:gap-4 ${
            singleTile
              ? "max-w-5xl grid-cols-1"
              : tracks.length <= 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {tracks.map((trackRef) => (
            <MeetParticipantTile
              key={`${trackRef.participant.identity}:${trackRef.source}`}
              trackRef={trackRef}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-[#202124] p-2.5 sm:gap-3">
        <ControlBar
          controls={{
            microphone: true,
            camera: true,
            screenShare: true,
            chat: false,
            settings: false,
            leave: false,
          }}
          onDeviceError={({ error }) => onDeviceError?.(error)}
          className="border-0 bg-transparent p-0 [&_.lk-button]:!rounded-full"
        />
        {onShowPeople ? (
          <button
            type="button"
            onClick={onShowPeople}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <UserPlus size={17} />
            <span className="hidden sm:inline">Add people</span>
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
      <RoomAudioRenderer />
    </div>
  );
}
