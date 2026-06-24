/** Human-readable labels for reward ledger activity rows. */
const ACTIVITY_LABELS = {
  pro_signup: "Professional signup",
  pro_profile_complete: "Profile completed",
  pro_verified: "Profile verified",
  pro_first_engagement: "First engagement",
  pro_first_deal: "First deal closed",
  invite_link_created: "Invite link created",
  invite_click_captured: "Invite link clicked",
  invite_signup_converted: "Invite signup",
  referral_created: "Outbound referral sent",
  referral_accepted: "Inbound referral accepted",
  referral_cross_role_bonus: "Cross-role referral bonus",
  referral_paid_invoice_credit: "Referral subscription credit",
  referral_transaction_complete: "Referral transaction",
  deal_closed: "Deal closed",
  lead_active_client: "Inbound network lead",
  complete_profile_monthly: "Monthly profile bonus",
  collaboration_success: "Collaboration success",
  positive_review: "Positive review",
  high_engagement_lead: "High-engagement lead",
  fast_response_monthly: "Fast response bonus",
  ai_tool_milestone: "AI tool milestone",
  education_complete: "Education completed",
  multi_pro_deal_bonus: "Multi-pro deal bonus",
};

function titleCaseWords(text) {
  return String(text || "")
    .trim()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatLedgerActivity(row = {}) {
  const fromApi = String(row.activity_description || "").trim();
  const eventType = String(row.event_type || "").trim();
  if (fromApi && fromApi !== eventType.replace(/_/g, " ")) return fromApi;
  if (ACTIVITY_LABELS[eventType]) return ACTIVITY_LABELS[eventType];
  if (fromApi) return titleCaseWords(fromApi);
  if (eventType) return titleCaseWords(eventType);
  return "Activity";
}

export function formatNestiPoints(value, { compact = false } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return compact ? "0 pts" : "0";
  const formatted = Math.abs(n).toLocaleString("en-US");
  if (compact) return `${n < 0 ? "−" : ""}${formatted} pts`;
  return formatted;
}

export function formatLedgerEarned(row = {}) {
  const kind = String(row.reward_kind || "").toLowerCase();
  const points = Number(row.points_delta || 0);
  const meta = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
  const cents = Number(meta.amount_cents || 500);

  if (kind === "credit" || row.event_type === "referral_paid_invoice_credit") {
    const dollars = (Math.abs(cents) / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return { kind: "credit", amount: dollars, sign: "+", suffix: "credit" };
  }

  if (points !== 0) {
    return {
      kind: "points",
      amount: formatNestiPoints(Math.abs(points)),
      sign: points > 0 ? "+" : "−",
      suffix: "pts",
    };
  }

  return { kind: "empty", amount: null, sign: "", suffix: "" };
}

export function formatPointsBalance(value) {
  return formatNestiPoints(value, { compact: true });
}

/** Icon + color tokens for ledger activity rows (lucide icon names as keys). */
const ACTIVITY_ICON_MAP = {
  deal_closed: { icon: "Trophy", tone: "amber" },
  pro_first_deal: { icon: "Trophy", tone: "amber" },
  multi_pro_deal_bonus: { icon: "Trophy", tone: "amber" },
  pro_profile_complete: { icon: "UserCheck", tone: "sky" },
  complete_profile_monthly: { icon: "UserCheck", tone: "sky" },
  pro_verified: { icon: "BadgeCheck", tone: "emerald" },
  pro_signup: { icon: "UserPlus", tone: "violet" },
  invite_signup_converted: { icon: "UserPlus", tone: "violet" },
  invite_link_created: { icon: "Link2", tone: "slate" },
  invite_click_captured: { icon: "MousePointerClick", tone: "slate" },
  referral_created: { icon: "Send", tone: "primary" },
  referral_accepted: { icon: "Inbox", tone: "primary" },
  referral_cross_role_bonus: { icon: "Shuffle", tone: "primary" },
  referral_paid_invoice_credit: { icon: "CircleDollarSign", tone: "emerald" },
  referral_transaction_complete: { icon: "CircleDollarSign", tone: "emerald" },
  lead_active_client: { icon: "Users", tone: "sky" },
  pro_first_engagement: { icon: "MessageCircle", tone: "sky" },
  collaboration_success: { icon: "Handshake", tone: "emerald" },
  positive_review: { icon: "Star", tone: "amber" },
  high_engagement_lead: { icon: "Flame", tone: "amber" },
  fast_response_monthly: { icon: "Zap", tone: "amber" },
  ai_tool_milestone: { icon: "Bot", tone: "violet" },
  education_complete: { icon: "GraduationCap", tone: "violet" },
};

const ICON_TONE_CLASSES = {
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  primary: "bg-primary/10 text-primary-dark",
  slate: "bg-slate-100 text-slate-500",
};

export function getLedgerActivityVisual(row = {}) {
  const eventType = String(row.event_type || "").trim();
  const isCredit =
    String(row.reward_kind || "").toLowerCase() === "credit" ||
    eventType === "referral_paid_invoice_credit";

  if (isCredit) {
    return { icon: "CircleDollarSign", toneClass: ICON_TONE_CLASSES.emerald };
  }

  const mapped = ACTIVITY_ICON_MAP[eventType];
  if (mapped) {
    return {
      icon: mapped.icon,
      toneClass: ICON_TONE_CLASSES[mapped.tone] || ICON_TONE_CLASSES.slate,
    };
  }

  return { icon: "Sparkles", toneClass: ICON_TONE_CLASSES.slate };
}

const EVENT_CATEGORIES = {
  invite_link_created: "Growth",
  invite_click_captured: "Growth",
  invite_signup_converted: "Growth",
  pro_signup: "Onboarding",
  pro_profile_complete: "Onboarding",
  pro_verified: "Onboarding",
  complete_profile_monthly: "Onboarding",
  referral_created: "Network",
  referral_accepted: "Network",
  referral_cross_role_bonus: "Network",
  referral_paid_invoice_credit: "Billing",
  referral_transaction_complete: "Billing",
  deal_closed: "Deals",
  pro_first_deal: "Deals",
  multi_pro_deal_bonus: "Deals",
  lead_active_client: "Leads",
  pro_first_engagement: "Engagement",
  collaboration_success: "Engagement",
  positive_review: "Engagement",
  high_engagement_lead: "Leads",
  fast_response_monthly: "Engagement",
  ai_tool_milestone: "Milestones",
  education_complete: "Milestones",
};

const CATEGORY_STYLES = {
  Growth: "bg-violet-50 text-violet-700 ring-violet-200/60",
  Onboarding: "bg-sky-50 text-sky-700 ring-sky-200/60",
  Network: "bg-primary/10 text-primary-dark ring-primary/20",
  Billing: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  Deals: "bg-amber-50 text-amber-800 ring-amber-200/60",
  Leads: "bg-orange-50 text-orange-700 ring-orange-200/50",
  Engagement: "bg-indigo-50 text-indigo-700 ring-indigo-200/60",
  Milestones: "bg-slate-100 text-slate-600 ring-slate-200/80",
  Rewards: "bg-amber-50 text-amber-800 ring-amber-200/60",
};

export function getLedgerCategory(row = {}) {
  const eventType = String(row.event_type || "").trim();
  const isCredit =
    String(row.reward_kind || "").toLowerCase() === "credit" ||
    eventType === "referral_paid_invoice_credit";
  const label = isCredit ? "Billing" : EVENT_CATEGORIES[eventType] || "Rewards";
  return {
    label,
    toneClass: CATEGORY_STYLES[label] || CATEGORY_STYLES.Rewards,
  };
}

export function getLedgerSubtitle(row = {}) {
  const meta = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
  const eventType = String(row.event_type || "").trim();

  if (meta.invitee_name) {
    const role = meta.invitee_role ? ` · ${titleCaseWords(meta.invitee_role)}` : "";
    return `Via ${meta.invitee_name}${role}`;
  }
  if (meta.source_channel && meta.source_channel !== "direct") {
    return `Channel: ${titleCaseWords(meta.source_channel)}`;
  }
  if (eventType.startsWith("invite_")) return "Invite link activity";
  if (eventType.startsWith("referral_")) return "Professional network";
  if (eventType.includes("deal")) return "Pipeline milestone";
  if (eventType.startsWith("pro_")) return "Profile milestone";
  return "Reward event logged";
}

export function formatLedgerDate(iso) {
  if (!iso) return { relative: "—", absolute: "" };
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return { relative: "—", absolute: "" };

  const absolute = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(dt);

  const diffMs = Date.now() - dt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  let relative = "Today";
  if (diffDays === 1) relative = "Yesterday";
  else if (diffDays > 1 && diffDays < 7) relative = `${diffDays}d ago`;
  else if (diffDays >= 7) {
    relative = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(dt);
  }

  return { relative, absolute };
}

export function summarizeLedgerPage(rows = []) {
  let points = 0;
  let creditsCents = 0;
  let creditCount = 0;

  for (const row of rows) {
    const earned = formatLedgerEarned(row);
    if (earned.kind === "points") {
      points += Number(row.points_delta || 0);
    } else if (earned.kind === "credit") {
      creditCount += 1;
      const meta = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
      creditsCents += Number(meta.amount_cents || 500);
    }
  }

  return { points, creditsCents, creditCount };
}
