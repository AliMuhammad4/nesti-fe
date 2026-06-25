"use client";

import { Calendar } from "lucide-react";
import { useCalendlyConnection } from "@/hooks/useCalendlyConnection";
import { getCalendlyWebhookStatusMessage } from "@/lib/calendlyErrors";

/**
 * Single control for the dashboard hero: shows Calendly connection status and toggles OAuth / disconnect.
 * @param {"dark" | "light"} surface — `dark` for overlay heroes; `light` for white card footers (e.g. Settings-style dashboard hero).
 */
export default function DashboardCalendlyButton({ className = "", surface = "dark", compact = false }) {
  const {
    token,
    statusQuery,
    cal,
    connected,
    connecting,
    startCalendlyOAuth,
    disconnectMut,
    registerWebhookMut,
    allGood,
    planBlocked,
    webhookError,
  } = useCalendlyConnection();

  if (!token) return null;

  const busy =
    connecting ||
    disconnectMut.isPending ||
    registerWebhookMut?.isPending ||
    statusQuery.isFetching;
  const loading = statusQuery.isLoading;
  const light = surface === "light";

  const base = compact
    ? "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 "
    : "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold shadow-sm transition disabled:opacity-50 ";
  const focusRing =
    light
      ? "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      : "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
  const buttonBase = `${base}${focusRing}`;

  if (loading) {
    return (
      <div
        className={`${buttonBase} ${
          light
            ? "border-slate-200 bg-slate-50 text-text-muted"
            : "border-white/25 bg-white/10 text-white/80"
        } ${className}`}
        aria-busy
      >
        <Calendar size={compact ? 14 : 18} className="opacity-90" aria-hidden />
        …
      </div>
    );
  }

  if (connected) {
    const planBlockedLabel = "Calendly Connected (sync limited)";
    const webhookErrorLabel = "Calendly Connected (sync needs attention)";
    const cleanStatusMessage = getCalendlyWebhookStatusMessage(cal);
    const statusDetail = planBlocked || webhookError
      ? (cleanStatusMessage || "Calendly is connected, but booking sync needs attention.")
      : "";
    const label = allGood
      ? "Calendly connected"
      : planBlocked
        ? compact ? "Calendly · upgrade plan" : planBlockedLabel
        : webhookError
          ? compact ? "Calendly · sync issue" : webhookErrorLabel
          : compact ? "Calendly · syncing" : "Calendly Connected (finishing setup)";

    const title = allGood
      ? "Click to disconnect Calendly"
      : planBlocked
        ? cleanStatusMessage || "Calendly is connected, but bookings can't sync because your plan doesn't allow webhooks. Upgrade to Standard/Teams to enable booking sync."
        : webhookError
          ? cleanStatusMessage || "Calendly is connected, but webhooks couldn't be registered. Open Settings → Calendar to reconnect."
          : "Calendly connected, but webhooks are still syncing — bookings may not update yet.";

    return (
      <div className={`inline-flex max-w-full flex-col items-start gap-1 ${className}`}>
        <button
          type="button"
          onClick={() => disconnectMut.mutate()}
          disabled={busy}
          className={`${buttonBase} ${
            planBlocked || webhookError
              ? light
                ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100/90"
                : "border-amber-200/50 bg-amber-500/25 text-white hover:bg-amber-500/35"
              : light
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/90"
                : "border-emerald-200/50 bg-emerald-500/25 text-white hover:bg-emerald-500/35"
          }`}
          title={title}
        >
          <Calendar size={compact ? 14 : 18} className="opacity-95" aria-hidden />
          {label}
        </button>
        {!compact && statusDetail ? (
          <p
            className={`max-w-[28rem] text-xs leading-relaxed ${
              light ? "text-amber-800" : "text-white/90"
            }`}
          >
            {statusDetail}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startCalendlyOAuth}
      disabled={busy}
      className={`${buttonBase} ${
        light
          ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
          : "border-white/40 bg-white/10 text-white hover:bg-white/20"
      } ${className}`}
      title="Connect your Calendly account"
    >
      <Calendar size={compact ? 14 : 18} className="opacity-95" aria-hidden />
      {connecting ? "Connecting…" : compact ? "Connect Calendly" : "Calendly Disconnected"}
    </button>
  );
}
