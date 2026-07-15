import { ParticipantKind } from "livekit-client";

export const RING_TIMEOUT_MS = 45_000;
export const VIDEO_PREVIEW_TIMEOUT_MS = 50_000;
export const NESTI_NOTETAKER_NAME = "Nesti Notetaker";

export function callHeading(type) {
  return String(type || "").toLowerCase() === "video" ? "Video call" : "Voice call";
}

export function isNotesAgent(participant) {
  const identity = String(participant?.identity || "").toLowerCase();
  const name = String(participant?.name || "").toLowerCase();
  return (
    participant?.kind === ParticipantKind.AGENT ||
    identity === "nesti-notetaker" ||
    identity.startsWith("agent-") ||
    name.includes("notetaker")
  );
}

export function participantDisplayName(participant) {
  if (isNotesAgent(participant)) return NESTI_NOTETAKER_NAME;
  return (
    String(participant?.name || "").trim() ||
    String(participant?.identity || "").trim() ||
    "Participant"
  );
}

export function humanParticipants(participants) {
  return (participants || []).filter((participant) => !isNotesAgent(participant));
}
