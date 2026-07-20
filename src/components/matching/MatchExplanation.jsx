import {
  Award,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  MessageCircle,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

export default function MatchExplanation({ leadMatch }) {
  if (!leadMatch?.icp_fit) {
    return null;
  }

  const { fit_score, fit_tier, matched_factors, missing_factors } = leadMatch.icp_fit;

  const getTierColor = (tier) => {
    switch (tier) {
      case 'perfect_match':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good_match':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low_match':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'perfect_match':
        return 'Perfect Match';
      case 'good_match':
        return 'Good Match';
      case 'low_match':
        return 'Low Match';
      default:
        return 'Match';
    }
  };

  const formatMatchFactor = (factor) => {
    const labels = {
      client_type: 'Client Type',
      price_range: 'Price Range',
      property_type: 'Property Type',
      service_area: 'Service Area',
      timeline: 'Timeline',
      language: 'Language',
      experience: 'Experience Level',
      loan_type: 'Loan Type',
      credit_range: 'Credit Range',
      income: 'Income Range',
      loan_size: 'Loan Size',
      transaction_type: 'Transaction Type',
      property_value: 'Property Value',
    };
    return labels[factor] || factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Match Analysis</h3>
        <div className={`flex items-center gap-2 rounded-full border px-4 py-2 ${getTierColor(fit_tier)}`}>
          <TrendingUp size={16} />
          <span className="font-semibold">{fit_score}% Match</span>
        </div>
      </div>

      <div className={`mb-6 rounded-lg border p-4 ${getTierColor(fit_tier)}`}>
        <p className="text-sm font-medium">
          {getTierLabel(fit_tier)} - This lead aligns well with your ideal client profile
        </p>
      </div>

      {matched_factors && matched_factors.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Matching Factors</h4>
          <div className="space-y-2">
            {matched_factors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>{formatMatchFactor(factor)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {missing_factors && missing_factors.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Missing Factors</h4>
          <div className="space-y-2">
            {missing_factors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-500">
                <XCircle size={16} className="text-gray-400" />
                <span>{formatMatchFactor(factor)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {leadMatch.final_match_score && leadMatch.tier_boost > 0 && (
        <div className="mt-4 rounded-lg bg-primary/5 p-3">
          <p className="text-xs text-primary">
            <span className="font-semibold">Subscription Boost:</span> +{leadMatch.tier_boost} points from your {leadMatch.subscription_tier} plan
          </p>
        </div>
      )}
    </div>
  );
}

export function MatchScoreCard({ score, tier, compact = false }) {
  const getTierColor = (t) => {
    switch (t) {
      case 'perfect_match':
        return 'text-green-600';
      case 'good_match':
        return 'text-blue-600';
      case 'low_match':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`text-2xl font-bold ${getTierColor(tier)}`}>{score}%</div>
        <div className="text-sm text-gray-500">Match</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
      <div className={`mb-2 text-4xl font-bold ${getTierColor(tier)}`}>{score}%</div>
      <div className="text-sm text-gray-500">Match Score</div>
    </div>
  );
}

function getTierStyles(tier) {
  switch (tier) {
    case "excellent_match":
      return {
        ring: "ring-emerald-200",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        score: "text-emerald-700",
        bar: "bg-emerald-500",
        pill: "bg-emerald-50 text-emerald-700",
      };
    case "strong_match":
      return {
        ring: "ring-primary/20",
        badge: "bg-primary/10 text-primary border-primary/20",
        score: "text-primary",
        bar: "bg-primary",
        pill: "bg-primary/10 text-primary",
      };
    case "good_match":
      return {
        ring: "ring-sky-200",
        badge: "bg-sky-50 text-sky-700 border-sky-200",
        score: "text-sky-700",
        bar: "bg-sky-500",
        pill: "bg-sky-50 text-sky-700",
      };
    default:
      return {
        ring: "ring-slate-200",
        badge: "bg-slate-50 text-slate-600 border-slate-200",
        score: "text-slate-600",
        bar: "bg-slate-400",
        pill: "bg-slate-100 text-slate-600",
      };
  }
}

export function formatTierLabel(tier) {
  return String(tier || "match")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function shortFitLabel(label = "") {
  return String(label)
    .replace(" Fit", "")
    .replace("Communication & Language", "Communication")
    .replace("Personality & Preference", "Personality");
}

function getFitRatio(item) {
  const weight = Number(item.weight || 0);
  const itemScore = Number(item.score || 0);
  return weight > 0 ? itemScore / weight : 0;
}

function getFitStrength(ratio) {
  if (ratio >= 0.85) return "strong";
  if (ratio >= 0.6) return "good";
  if (ratio >= 0.35) return "partial";
  return "low";
}

function getFitIcon(key = "", label = "") {
  const token = String(key || label).toLowerCase();
  if (token.includes("financial") || token.includes("budget")) return DollarSign;
  if (token.includes("location") || token.includes("area")) return MapPin;
  if (token.includes("timeline")) return Clock;
  if (token.includes("special")) return Target;
  if (token.includes("communication") || token.includes("language")) return MessageCircle;
  if (token.includes("experience")) return Award;
  return CheckCircle2;
}

function getClientFitHighlights(breakdown = [], limit) {
  const highlights = (Array.isArray(breakdown) ? breakdown : [])
    .map((item) => {
      const strength = getFitStrength(getFitRatio(item));
      return {
        key: item.key || item.label,
        label: shortFitLabel(item.label),
        strength,
        Icon: getFitIcon(item.key, item.label),
      };
    })
    .filter(Boolean);

  return typeof limit === "number" ? highlights.slice(0, limit) : highlights;
}

function fitPillStyles(strength) {
  switch (strength) {
    case "strong":
      return {
        pill: "border-emerald-200/60 bg-emerald-50/50",
        icon: "text-emerald-600",
      };
    case "good":
      return {
        pill: "border-primary/15 bg-primary/[0.04]",
        icon: "text-primary",
      };
    case "partial":
      return {
        pill: "border-sky-200/60 bg-sky-50/50",
        icon: "text-sky-600",
      };
    default:
      return {
        pill: "border-slate-200/80 bg-slate-50/60",
        icon: "text-slate-500",
      };
  }
}

function FitHighlightPill({ item, size = "md" }) {
  const pillStyles = fitPillStyles(item.strength);
  const compact = size === "sm";

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border ${pillStyles.pill} ${
        compact ? "gap-1.5 px-2.5 py-1" : "gap-2 px-3.5 py-2"
      }`}
    >
      <item.Icon
        size={compact ? 12 : 14}
        strokeWidth={2.25}
        className={`shrink-0 ${pillStyles.icon}`}
      />
      <span className={`truncate font-medium text-text-heading ${compact ? "text-[11px]" : "text-sm"}`}>
        {item.label}
      </span>
    </span>
  );
}

export function ClientMatchTierBadge({ tier, className = "", size = "md" }) {
  if (!tier) return null;
  const styles = getTierStyles(tier);
  const compact = size === "sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border font-semibold ${styles.badge} ${
        compact ? "px-2.5 py-0.5 text-[11px] leading-4" : "px-3.5 py-1.5 text-sm"
      } ${className}`}
    >
      {formatTierLabel(tier)}
    </span>
  );
}

export function ClientMatchScore({ score, tier, size = "md", className = "" }) {
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore) || numericScore <= 0) return null;
  const styles = getTierStyles(tier);
  const compact = size === "sm";

  return (
    <span
      className={`shrink-0 font-bold tabular-nums leading-none ${styles.score} ${
        compact ? "text-sm" : "text-2xl"
      } ${className}`}
    >
      {Math.round(numericScore)}%
    </span>
  );
}

export function ClientMatchSummary({ tier, score, className = "" }) {
  if (!tier && !(Number(score) > 0)) return null;

  return (
    <div className={`flex shrink-0 items-center gap-1.5 ${className}`}>
      {tier ? <ClientMatchTierBadge tier={tier} size="sm" /> : null}
      <ClientMatchScore score={score} tier={tier} size="sm" />
    </div>
  );
}

export function ClientMatchExplanation({
  breakdown = [],
  tier,
  score,
  compact = false,
}) {
  const highlights = getClientFitHighlights(breakdown);
  const numericScore = Number(score);
  const showScore = Number.isFinite(numericScore) && numericScore > 0;

  if (!tier && !highlights.length && !showScore) return null;

  if (compact) {
    return (
      <div className="mt-3 border-t border-slate-100/80 pt-3">
        <p className="mb-2 text-[11px] font-semibold text-text-heading">Matched to your preferences</p>
        {highlights.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {highlights.map((item) => (
              <FitHighlightPill key={item.key} item={item} size="sm" />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-heading">Matched to your preferences</p>
          <p className="mt-0.5 text-xs text-text-muted">Based on your profile and home search goals</p>
        </div>
        {tier || showScore ? (
          <div className="flex shrink-0 items-center gap-2">
            {tier ? <ClientMatchTierBadge tier={tier} /> : null}
            {showScore ? <ClientMatchScore score={score} tier={tier} /> : null}
          </div>
        ) : null}
      </div>

      {highlights.length ? (
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          {highlights.map((item) => (
            <FitHighlightPill key={item.key} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
