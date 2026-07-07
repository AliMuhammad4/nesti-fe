/** Shared buyer qualification options — aligned with agent lead capture / chat intake. */

export const CLIENT_MORTGAGE_STATUS_OPTIONS = [
  { value: "fully_pre_approved", label: "Yes – fully pre-approved" },
  { value: "paying_cash", label: "Paying cash" },
  { value: "in_progress", label: "Pre-approval in progress" },
  { value: "not_yet", label: "Not yet" },
];

export const CLIENT_REALTOR_STATUS_OPTIONS = [
  { value: "no_agent", label: "No – I need one" },
  { value: "has_agent_but_open", label: "Yes, but open to others" },
  { value: "has_exclusive_agent", label: "Yes – exclusively" },
];

export const CLIENT_MOTIVATION_REASON_OPTIONS = [
  { value: "relocation", label: "Relocation / job move" },
  { value: "family_change", label: "Growing family" },
  { value: "divorce", label: "Divorce" },
  { value: "investment", label: "Investment" },
  { value: "upgrading", label: "Upgrading to bigger home" },
  { value: "downsizing", label: "Downsizing" },
  { value: "just_exploring", label: "Just exploring" },
];

export const CLIENT_VIEWING_READINESS_OPTIONS = [
  { value: "asap", label: "Yes – ASAP" },
  { value: "few_weeks", label: "Within a few weeks" },
  { value: "maybe_later", label: "Maybe later" },
  { value: "just_browsing", label: "Just browsing for now" },
];

export const CLIENT_LIVING_SITUATION_OPTIONS = [
  { value: "renting", label: "Renting" },
  { value: "own_need_to_sell", label: "Own – need to sell first" },
  { value: "own_not_selling", label: "Own – not selling" },
];

export const CLIENT_OFFER_READINESS_OPTIONS = [
  { value: "yes_immediately", label: "Yes – immediately" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No – not yet" },
];

export function labelForQualificationValue(value, options) {
  if (!value) return "";
  const match = options.find((option) => option.value === value);
  if (match?.label) return match.label;
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
