function finiteMetric(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function compactNumber(value) {
  return new Intl.NumberFormat('en-US', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

function experienceValue(profile = {}) {
  const professional = profile?.professional_profile || {};
  const raw = professional.experience
    || profile?.storefront_essentials?.years_experience
    || profile?.stats?.years_experience
    || '';
  const numeric = finiteMetric(raw);
  if (numeric !== null && numeric > 0) return `${compactNumber(numeric)}+ years`;
  const match = String(raw).match(/\d+\s*(?:\+|[-–]\s*\d+)?\s*years?/i);
  if (match) return match[0].replace(/\s+/g, ' ');
  const levels = {
    junior: '0–2 years',
    mid: '3–5 years',
    senior: '6–10 years',
    elite: '10+ years',
  };
  return levels[String(professional.experience_level || '').toLowerCase()]
    || professional.specializations?.[0]
    || professional.core_specialization_tags?.[0]
    || 'Mortgage advisory';
}

export function resolveBrokerCredentialItems(profile = {}) {
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
      pipelineValue = compactNumber(pipelineAmount);
    }
  }

  return [
    {
      id: 'broker-pipeline-value',
      kind: 'pipeline',
      title: 'Pipeline value',
      value: pipelineValue,
      description: 'Active financing pipeline',
    },
    {
      id: 'broker-experience',
      kind: 'experience',
      title: 'Industry experience',
      value: experienceValue(profile),
      description: 'Mortgage strategy and guidance',
    },
    {
      id: 'broker-total-clients',
      kind: 'clients',
      title: 'Total clients',
      value: totalClients !== null
        ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(totalClients)
        : '—',
      description: 'Clients supported',
    },
    {
      id: 'broker-closed-cases',
      kind: 'cases',
      title: 'Closed cases',
      value: closedCases !== null
        ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(closedCases)
        : '—',
      description: 'Completed financing files',
    },
  ];
}
