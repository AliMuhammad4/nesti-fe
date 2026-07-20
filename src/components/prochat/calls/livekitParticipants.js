import { ParticipantKind } from "livekit-client";

export const RING_TIMEOUT_MS = 90_000;
export const CONNECT_TIMEOUT_MS = 45_000;
export const VIDEO_PREVIEW_TIMEOUT_MS = 50_000;
export const NESTI_NOTETAKER_NAME = "Nesti Minutes";

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
    name.includes("notetaker") ||
    name.includes("nesti minutes")
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

export function participantMetadata(participant) {
  const raw = String(participant?.metadata || "").trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function participantProfileImage(participant) {
  const meta = participantMetadata(participant);
  return String(meta.profile_image || "").trim();
}

export function participantInitials(participant) {
  const name = participantDisplayName(participant);
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}

export function humanParticipants(participants) {
  return (participants || []).filter((participant) => !isNotesAgent(participant));
}
