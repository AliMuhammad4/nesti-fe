/**
 * Calendly blocks POST /webhook_subscriptions on free / expired trials (often HTTP 403).
 * Handles both API `calendly_webhook_error_kind` and legacy stored error strings.
 */
export function isCalendlyPlanWebhookBlock(cal) {
  if (cal?.calendly_webhook_error_kind === "calendly_plan") return true;
  const msg = String(cal?.calendly_webhook_register_error || "").trim();
  if (!msg) return false;
  const lowered = msg.toLowerCase();
  const hasPlanSignal =
    /standard|upgrade|trial|subscription|plan|billing|past due|payment failed/.test(lowered);
  const hasWebhookSignal =
    /webhook|webhooks|webhook_subscriptions|booking sync|booking webhooks/.test(lowered);
  if (hasPlanSignal && hasWebhookSignal) return true;
  if (/requires\s+(a\s+)?standard|standard\s*\(or higher\)|upgrade your calendly|plan does not support/.test(lowered)) return true;
  return (
    /\(403\)/.test(msg) &&
    /permission denied|upgrade|standard|trial|plan|calendly account/i.test(msg)
  );
}

/** Shown when webhooks are blocked by plan; keep in sync with node `userFacingCalendlyRegisterError` for calendly_plan. */
/** Aligned with node `userFacingCalendlyRegisterError` for `calendly_plan`. */
export const CALENDLY_PLAN_WEBHOOK_USER_MESSAGE =
  "Calendly booking sync requires a Standard (or higher) Calendly plan.";

export const CALENDLY_BILLING_URL = "https://calendly.com/app/admin/billing";

export function getCalendlyWebhookStatusMessage(cal) {
  const raw = String(cal?.calendly_webhook_register_error || "").trim();
  if (!raw) return "";
  const lowered = raw.toLowerCase();

  if (!isCalendlyPlanWebhookBlock(cal)) {
    return "Calendly is connected, but booking sync is temporarily unavailable. Please reconnect or try again later.";
  }

  const freeTrialExpired = /free trial|trial expired|trial ended|trial has ended/.test(lowered);
  const subscriptionExpired = /subscription expired|subscription has expired|billing issue|payment failed|past due/.test(lowered);

  if (freeTrialExpired) {
    return "Calendly free trial is expired. Upgrade your Calendly plan to restore booking sync.";
  }
  if (subscriptionExpired) {
    return "Calendly subscription is expired. Renew your Calendly subscription to restore booking sync.";
  }
  return "Calendly plan does not support booking webhooks. Upgrade to a Standard (or higher) Calendly plan to enable booking sync.";
}
