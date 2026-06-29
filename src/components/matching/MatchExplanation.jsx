import { CheckCircle2, XCircle, TrendingUp } from "lucide-react";

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
