export function displayCallStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "ended") return { label: "Completed", style: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  if (normalized === "declined") return { label: "Declined", style: "bg-red-50 text-red-700 ring-red-200" };
  if (normalized === "expired") return { label: "Missed", style: "bg-amber-50 text-amber-700 ring-amber-200" };
  if (normalized === "unanswered") return { label: "No answer", style: "bg-amber-50 text-amber-700 ring-amber-200" };
  if (normalized === "active") return { label: "In progress", style: "bg-blue-50 text-blue-700 ring-blue-200" };
  if (normalized === "ringing") return { label: "Ringing", style: "bg-violet-50 text-violet-700 ring-violet-200" };
  if (normalized === "connecting") return { label: "Connecting", style: "bg-blue-50 text-blue-700 ring-blue-200" };
  return { label: "Starting", style: "bg-gray-50 text-gray-600 ring-gray-200" };
}

export function callStatusLabel(status) {
  const value = String(status || "").toLowerCase();
  if (value === "ended") return "Completed";
  if (value === "declined") return "Declined";
  if (value === "expired") return "Missed";
  if (value === "unanswered") return "No answer";
  if (value === "active") return "In progress";
  if (value === "ringing") return "Ringing";
  if (value === "connecting") return "Connecting";
  return value ? value.replaceAll("_", " ") : "—";
}

export function formatCallDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCallDateTime(value) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export function formatCallDuration(seconds, { empty = "-" } = {}) {
  const total = Math.max(0, Number(seconds) || 0);
  if (!total) return empty;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}
