"use client";

export const CALL_TRANSCRIPTION_DISCLOSURE =
  "Nesti Notetaker can join quietly to capture speech from people who opt in, send that audio to our speech service for transcription, and prepare meeting notes — summary, decisions, and action items — that call participants can review later. Notes are retained with the call record and removed when that record expires.";

export const CALL_TRANSCRIPTION_CONSENT_EVENT =
  "nesti:request-call-transcription-consent";

const CONSENT_TIMEOUT_MS = 45_000;

let pendingConsentPromise = null;
let cachedConsent = null;

export function resetCallTranscriptionConsent() {
  cachedConsent = null;
}

export function rememberCallTranscriptionConsent(consent) {
  cachedConsent = consent === true;
}

export function hasCachedCallTranscriptionConsent() {
  return cachedConsent !== null;
}

/**
 * Ask for notes consent while the phone is ringing so Answer does not wait
 * on a second modal. Prefer {@link rememberCallTranscriptionConsent} from
 * the incoming-call UI when possible.
 */
export function primeCallTranscriptionConsent() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (cachedConsent !== null) return Promise.resolve(cachedConsent);
  if (pendingConsentPromise) return pendingConsentPromise;
  return requestCallTranscriptionConsent();
}

export function requestCallTranscriptionConsent() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (cachedConsent !== null) return Promise.resolve(cachedConsent);
  if (pendingConsentPromise) return pendingConsentPromise;

  pendingConsentPromise = new Promise((resolve) => {
    let settled = false;
    const finish = (consent) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      pendingConsentPromise = null;
      cachedConsent = consent === true;
      resolve(cachedConsent);
    };

    const timeoutId = window.setTimeout(() => finish(false), CONSENT_TIMEOUT_MS);

    window.dispatchEvent(
      new CustomEvent(CALL_TRANSCRIPTION_CONSENT_EVENT, {
        detail: { resolve: finish },
      }),
    );
  });

  return pendingConsentPromise;
}

export function consumeCallTranscriptionConsent() {
  if (cachedConsent !== null) {
    const value = cachedConsent;
    cachedConsent = null;
    return Promise.resolve(value);
  }
  return requestCallTranscriptionConsent();
}

function text(value) {
  return String(value || "").trim();
}

/** Participant-level notes choice label (People panel + Call details). */
export function participantNotesChoiceLabel(consent) {
  if (consent === true) return "Notes on";
  if (consent === false) return "Notes off";
  return "No choice yet";
}

/**
 * Unified notes status for history badges, detail headers, and toasts.
 * Returns { key, label, tone, detail, emptyTranscript, emptyMinutes }.
 */
export function getCallNotesStatus(artifacts = {}) {
  const transcription = text(artifacts.transcription_status || "pending").toLowerCase();
  const minutes = text(artifacts.minutes_status || "not_ready").toLowerCase();
  const errorCode = text(artifacts.transcription_error_code).toLowerCase();
  const errorMessage = text(artifacts.transcription_error_message);
  const segmentCount = Number(artifacts.transcript_segment_count || 0);

  if (transcription === "failed") {
    return {
      key: "failed",
      label: "Notes unavailable",
      tone: "danger",
      detail: errorMessage || "Notes could not be created for this call.",
      emptyTranscript: errorMessage || "Notes could not be created for this call.",
      emptyMinutes: errorMessage || "Notes could not be created for this call.",
    };
  }

  if (errorCode === "no_transcript_segments") {
    return {
      key: "empty",
      label: "No notes",
      tone: "muted",
      detail: "Notes were on, but no speech was captured.",
      emptyTranscript: "No speech was captured for notes on this call.",
      emptyMinutes: "Meeting notes need a transcript. No speech was captured.",
    };
  }

  if (
    transcription === "disabled" ||
    errorCode === "no_transcription_consent" ||
    errorCode === "transcription_disabled"
  ) {
    return {
      key: "off",
      label: "Notes off",
      tone: "muted",
      detail: "Notes were not turned on for this call.",
      emptyTranscript: "Notes were not turned on for this call.",
      emptyMinutes: "Meeting notes are unavailable because notes were not turned on.",
    };
  }

  if (minutes === "ready") {
    return {
      key: "ready",
      label: "Notes ready",
      tone: "success",
      detail: "Meeting notes are ready to review.",
      emptyTranscript:
        segmentCount > 0
          ? "Transcript is loading…"
          : "Meeting notes are ready. Open the Transcript tab if available.",
      emptyMinutes: "",
    };
  }

  if (minutes === "failed") {
    return {
      key: "minutes_failed",
      label: "Summary unavailable",
      tone: "danger",
      detail: "The transcript may be available, but the summary could not be created.",
      emptyTranscript: "The transcript is not available yet.",
      emptyMinutes: "The meeting summary could not be created.",
    };
  }

  if (
    ["pending", "dispatching", "active"].includes(transcription) ||
    ["pending", "processing"].includes(minutes)
  ) {
    const duringCall = ["pending", "dispatching", "active"].includes(transcription);
    return {
      key: "preparing",
      label: duringCall ? "Taking notes" : "Preparing notes",
      tone: "info",
      detail: duringCall
        ? "Nesti Notetaker is listening and will prepare notes after the call."
        : "Nesti Notetaker is preparing notes for this call.",
      emptyTranscript: duringCall
        ? "Transcript will appear here after the call ends."
        : "Nesti Notetaker is finishing the transcript. This usually takes a minute.",
      emptyMinutes: duringCall
        ? "Notes will be ready shortly after the call ends."
        : "Nesti Notetaker is preparing your meeting notes…",
    };
  }

  if (transcription === "completed" && minutes === "not_ready") {
    return {
      key: "empty",
      label: "No notes",
      tone: "muted",
      detail: "No meeting notes were produced for this call.",
      emptyTranscript: "No transcript is available for this call.",
      emptyMinutes: "No meeting notes were produced for this call.",
    };
  }

  return {
    key: "idle",
    label: "Notes",
    tone: "muted",
    detail: "",
    emptyTranscript: "The transcript is not available yet.",
    emptyMinutes: "Meeting notes are not available yet.",
  };
}

export function notesToneClasses(tone) {
  if (tone === "success") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (tone === "info") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (tone === "danger") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-slate-50 text-slate-600 ring-slate-200";
}

/** Quiet in-call pill label (Meet-style). */
export function inCallNotesLabel(status, { receiving = false } = {}) {
  const value = text(status || "pending").toLowerCase();
  if (receiving || value === "active") return "Notes on";
  if (value === "completed") return "Notes saved";
  if (value === "failed") return "Notes unavailable";
  if (value === "disabled") return "Notes off";
  if (value === "dispatching") return "Starting notes…";
  return "Notes pending";
}

/** Format call-relative ms as m:ss / h:mm:ss for transcript rows. */
export function formatTranscriptClock(ms) {
  const totalSeconds = Math.max(0, Math.floor(Number(ms || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
