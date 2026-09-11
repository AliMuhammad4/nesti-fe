const LAWYER_EXPERIENCE_YEAR_COPY = {
  junior: '0–2 years',
  mid: '3–5 years',
  senior: '6–10 years',
  elite: '10+ years',
};

function resolveLawyerExperienceYears(profile = {}, professional = {}) {
  const rawExperience = String(
    professional.experience || profile?.storefront_essentials?.years_experience || '',
  ).trim();
  const explicitYears = rawExperience.match(/\d+\s*(?:\+|[-–]\s*\d+)?\s*years?/i);
  if (explicitYears) return explicitYears[0].replace(/\s+/g, ' ');
  const normalizedLevel = String(
    professional.experience_level || rawExperience,
  ).trim().toLowerCase();
  return LAWYER_EXPERIENCE_YEAR_COPY[normalizedLevel] || '';
}

function finiteMetric(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolveLawyerStandingItems(profile = {}) {
  const professional = profile?.professional_profile || {};
  const experience = resolveLawyerExperienceYears(profile, professional);
  const metrics = profile?.professional_credential_metrics || {};
  const pipelineAmount = finiteMetric(metrics.active_pipeline_value);
  const totalClients = finiteMetric(metrics.total_clients);
  const closedCases = finiteMetric(metrics.closed_cases);
  let pipelineValue = '—';
  if (pipelineAmount !== null) {
    try {
      const currency = String(metrics.currency || profile?.currency || '').trim().toUpperCase();
      pipelineValue = new Intl.NumberFormat(profile?.locale || 'en-US', {
        ...(currency ? { style: 'currency', currency } : {}),
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(pipelineAmount);
    } catch {
      pipelineValue = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(pipelineAmount);
    }
  }

  return [
    {
      id: 'profile-pipeline-value',
      kind: 'pipeline',
      title: 'Pipeline value',
      value: pipelineValue,
    },
    {
      id: 'profile-experience',
      kind: 'experience',
      title: 'Experience',
      value: experience || '—',
    },
    {
      id: 'profile-total-clients',
      kind: 'clients',
      title: 'Total clients',
      value: totalClients !== null
        ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(totalClients)
        : '—',
    },
    {
      id: 'profile-closed-cases',
      kind: 'cases',
      title: 'Closed cases',
      value: closedCases !== null
        ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(closedCases)
        : '—',
    },
  ];
}
