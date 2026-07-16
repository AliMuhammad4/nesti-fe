"use client";

export const CALL_TRANSCRIPTION_DISCLOSURE =
  "Nesti can join quietly to capture speech from people who opt in, send that audio to our speech service for transcription, and prepare minutes of meeting — summary, decisions, and action items — that call participants can review later. Minutes of meeting are retained with the call record and removed when that record expires.";

export const CALL_TRANSCRIPTION_CONSENT_EVENT =
  "nesti:request-call-transcription-consent";

export const CALL_TRANSCRIPTION_CONSENT_CANCEL_EVENT =
  "nesti:cancel-call-transcription-consent";

const CONSENT_TIMEOUT_MS = 45_000;

let pendingConsentPromise = null;
let pendingConsentFinish = null;
let cachedConsent = null;

export function resetCallTranscriptionConsent() {
  cachedConsent = null;
}

/** Settle any open consent prompt without caching a decline (navigate-away / hangup). */
export function cancelPendingCallTranscriptionConsent() {
  cachedConsent = null;
  if (typeof pendingConsentFinish === "function") {
    pendingConsentFinish(false, { intentional: false });
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CALL_TRANSCRIPTION_CONSENT_CANCEL_EVENT));
  }
}

export function rememberCallTranscriptionConsent(consent) {
  cachedConsent = consent === true;
}

export function hasCachedCallTranscriptionConsent() {
  return cachedConsent !== null;
}

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
    const finish = (consent, { intentional = true } = {}) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      pendingConsentPromise = null;
      pendingConsentFinish = null;
      if (intentional) {
        cachedConsent = consent === true;
      } else {
        cachedConsent = null;
      }
      resolve(consent === true);
    };
    pendingConsentFinish = finish;

    const timeoutId = window.setTimeout(
      () => finish(false, { intentional: false }),
      CONSENT_TIMEOUT_MS,
    );

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

export function participantNotesChoiceLabel(consent) {
  if (consent === true) return "Minutes on";
  if (consent === false) return "Minutes off";
  return "No choice yet";
}

export function getCallNotesStatus(artifacts = {}) {
  const transcription = text(artifacts.transcription_status || "pending").toLowerCase();
  const minutes = text(artifacts.minutes_status || "not_ready").toLowerCase();
  const errorCode = text(artifacts.transcription_error_code).toLowerCase();
  const errorMessage = text(artifacts.transcription_error_message);
  const segmentCount = Number(artifacts.transcript_segment_count || 0);

  if (transcription === "failed") {
    return {
      key: "failed",
      label: "Minutes unavailable",
      tone: "danger",
      detail: errorMessage || "Minutes of meeting could not be created for this call.",
      emptyTranscript: errorMessage || "Minutes of meeting could not be created for this call.",
      emptyMinutes: errorMessage || "Minutes of meeting could not be created for this call.",
    };
  }

  if (errorCode === "no_transcript_segments") {
    return {
      key: "empty",
      label: "No minutes",
      tone: "muted",
      detail: "Minutes were on, but no speech was captured.",
      emptyTranscript: "No speech was captured for minutes of meeting on this call.",
      emptyMinutes: "Minutes of meeting need a transcript. No speech was captured.",
    };
  }

  if (errorCode === "viewer_no_transcription_consent") {
    return {
      key: "off",
      label: "Minutes unavailable",
      tone: "muted",
      detail:
        "Minutes of meeting and transcript are only available if you allowed minutes on this call.",
      emptyTranscript:
        "Transcript is only available if you allowed minutes on this call.",
      emptyMinutes:
        "Minutes of meeting are only available if you allowed minutes on this call.",
    };
  }

  if (
    transcription === "disabled" ||
    errorCode === "no_transcription_consent" ||
    errorCode === "transcription_disabled"
  ) {
    return {
      key: "off",
      label: "Minutes off",
      tone: "muted",
      detail: "Minutes of meeting were not turned on for this call.",
      emptyTranscript: "Minutes of meeting were not turned on for this call.",
      emptyMinutes:
        "Minutes of meeting are unavailable because they were not turned on.",
    };
  }

  if (minutes === "ready") {
    return {
      key: "ready",
      label: "Minutes ready",
      tone: "success",
      detail: "Minutes of meeting are ready to review.",
      emptyTranscript:
        segmentCount > 0
          ? "Transcript is loading…"
          : "Minutes of meeting are ready. Open the Transcript tab if available.",
      emptyMinutes: "",
    };
  }

  if (minutes === "failed" || errorCode === "empty_minutes") {
    return {
      key: "minutes_failed",
      label: "Summary unavailable",
      tone: "danger",
      detail:
        errorCode === "empty_minutes"
          ? "A transcript may be available, but no substantive summary could be created."
          : "The transcript may be available, but the summary could not be created.",
      emptyTranscript: "The transcript is not available yet.",
      emptyMinutes:
        errorCode === "empty_minutes"
          ? "No substantive minutes could be produced from this transcript."
          : "The meeting summary could not be created.",
    };
  }

  if (
    ["pending", "dispatching", "active"].includes(transcription) ||
    ["pending", "processing"].includes(minutes)
  ) {
    const duringCall = ["pending", "dispatching", "active"].includes(transcription);
    return {
      key: "preparing",
      label: duringCall ? "Capturing minutes" : "Preparing minutes",
      tone: "info",
      detail: duringCall
        ? "Nesti is listening and will prepare minutes of meeting after the call."
        : "Nesti is preparing minutes of meeting for this call.",
      emptyTranscript: duringCall
        ? "Transcript will appear here after the call ends."
        : "Nesti is finishing the transcript. This usually takes a minute.",
      emptyMinutes: duringCall
        ? "Minutes of meeting will be ready shortly after the call ends."
        : "Nesti is preparing your minutes of meeting…",
    };
  }

  if (transcription === "completed" && minutes === "not_ready") {
    return {
      key: "empty",
      label: "No minutes",
      tone: "muted",
      detail: "No minutes of meeting were produced for this call.",
      emptyTranscript: "No transcript is available for this call.",
      emptyMinutes: "No minutes of meeting were produced for this call.",
    };
  }

  return {
    key: "idle",
    label: "Minutes of meeting",
    tone: "muted",
    detail: "",
    emptyTranscript: "The transcript is not available yet.",
    emptyMinutes: "Minutes of meeting are not available yet.",
  };
}

export function notesToneClasses(tone) {
  if (tone === "success") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (tone === "info") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (tone === "danger") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-slate-50 text-slate-600 ring-slate-200";
}

export function inCallNotesLabel(status, { receiving = false } = {}) {
  const value = text(status || "pending").toLowerCase();
  if (receiving || value === "active") return "Minutes on";
  if (value === "completed") return "Minutes saved";
  if (value === "failed") return "Minutes unavailable";
  if (value === "disabled") return "Minutes off";
  if (value === "dispatching") return "Starting minutes…";
  return "Minutes pending";
}

export function formatTranscriptClock(ms) {
  const totalSeconds = Math.max(0, Math.floor(Number(ms || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Prefer stored start_time_ms; if many segments share one stamp (legacy STT), use created_at deltas. */
export function resolveTranscriptDisplayTimes(segments) {
  const list = Array.isArray(segments) ? segments : [];
  if (!list.length) return [];

  const starts = list.map((segment) => Math.max(0, Number(segment?.start_time_ms || 0)));
  const uniqueStarts = new Set(starts);
  const collapsed =
    list.length > 1 && uniqueStarts.size <= Math.max(1, Math.ceil(list.length / 3));

  if (!collapsed) {
    return list.map((segment, index) => ({
      ...segment,
      display_time_ms: starts[index],
    }));
  }

  const createdTimes = list
    .map((segment) => new Date(segment?.created_at || 0).getTime())
    .filter((value) => Number.isFinite(value) && value > 0);
  const origin = createdTimes.length ? Math.min(...createdTimes) : null;
  if (origin == null) {
    return list.map((segment, index) => ({
      ...segment,
      display_time_ms: starts[index],
    }));
  }

  const baseOffset = Math.min(...starts);
  return list.map((segment, index) => {
    const created = new Date(segment?.created_at || 0).getTime();
    const fromCreated =
      Number.isFinite(created) && created > 0
        ? baseOffset + Math.max(0, created - origin)
        : starts[index];
    return {
      ...segment,
      display_time_ms: fromCreated,
    };
  });
}
