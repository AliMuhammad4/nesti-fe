'use client';

import {
  CalendarDays,
  CircleDollarSign,
  FileCheck2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicBandColors,
  lawyerClassicGridClass,
  lawyerClassicResolvedPaddingClass,
  lawyerClassicSectionStyle,
} from '../shared/lawyerSectionUtils';

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
  if (LAWYER_EXPERIENCE_YEAR_COPY[normalizedLevel]) {
    return LAWYER_EXPERIENCE_YEAR_COPY[normalizedLevel];
  }
  return '';
}

function resolveLawyerStandingItems(profile) {
  const professional = profile?.professional_profile || {};
  const experience = resolveLawyerExperienceYears(profile, professional);
  const metrics = profile?.professional_credential_metrics
    || profile?.seller_credential_metrics
    || {};
  const pipelineAmount = Number(metrics.active_pipeline_value);
  const totalClients = Number(metrics.total_clients);
  const closedCases = Number(metrics.closed_cases ?? profile?.closed_seller_leads_count);
  let pipelineValue = '—';
  if (Number.isFinite(pipelineAmount)) {
    try {
      pipelineValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: metrics.currency || 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(pipelineAmount);
    } catch {
      pipelineValue = `$${new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(pipelineAmount)}`;
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
      value: Number.isFinite(totalClients)
        ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(totalClients)
        : '—',
    },
    {
      id: 'profile-closed-cases',
      kind: 'cases',
      title: 'Closed cases',
      value: Number.isFinite(closedCases)
        ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(closedCases)
        : '—',
    },
  ];
}

export function LawyerClassicCredentials({ profile, block }) {
  const content = blockContent(block);
  const isVerified = profile?.credentials_verified === true
    || profile?.professional_profile?.credentials_verified === true;
  const items = resolveLawyerStandingItems(profile);
  const legacyBody = [
    '',
    'Professional standing and experience clients can verify.',
    'Experience, expertise, recognition, and current practice affiliation.',
  ].includes(String(content.body || '').trim());
  const bodyCopy = legacyBody
    ? 'Current practice activity and experience at a glance.'
    : content.body;
  const standingIcons = {
    pipeline: CircleDollarSign,
    experience: CalendarDays,
    clients: Users,
    cases: FileCheck2,
  };
  const padding = block?.data?.layout?.padding || block?.layout?.padding;
  const sectionStyle = lawyerClassicSectionStyle(block);
  const band = lawyerClassicBandColors(sectionStyle);
  const requestedTextColor = band.requestedTextColor;

  return (
    <div
      className={`relative w-full max-w-none overflow-hidden px-5 sm:px-8 lg:px-12 ${lawyerClassicResolvedPaddingClass(padding, 'py-12 sm:py-14')}`}
      style={{ backgroundColor: band.background, color: band.color }}
    >
      <div className="w-full max-w-none">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-storefront-anim-item="true">
          <div>
            <EditableText
              as="p"
              field="content.eyebrow"
              label="Credentials eyebrow"
              source={content.eyebrow ? 'persisted' : 'fallback'}
              className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
            >
              {content.eyebrow || 'Professional standing'}
            </EditableText>
            <EditableText
              as="h2"
              field="content.heading"
              label="Credentials heading"
              source={content.heading ? 'persisted' : 'fallback'}
              className={`mt-3 text-3xl font-semibold uppercase tracking-[-0.02em] sm:text-4xl ${
                requestedTextColor ? 'text-current' : 'text-primary-contrast'
              }`}
            >
              {content.heading || 'Your lawyer'}
            </EditableText>
            <EditableText
              as="p"
              field="content.body"
              label="Credentials description"
              source={content.body ? 'persisted' : 'fallback'}
              className={`mt-4 max-w-2xl text-sm leading-7 ${
                requestedTextColor ? 'text-current opacity-70' : 'text-primary-contrast/70'
              }`}
            >
              {bodyCopy}
            </EditableText>
            <div className="mt-5 h-0.5 w-16 bg-accent" />
          </div>
          {isVerified ? (
          <EditableText
            field="content.verification_label"
            label="Credentials verification label"
            source={content.verification_label ? 'persisted' : 'fallback'}
            className={`inline-flex w-fit items-center gap-3 bg-white/[0.07] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] ${
              requestedTextColor ? 'text-current' : 'text-primary-contrast'
            }`}
          >
            <ShieldCheck size={18} className="text-accent" />
            {content.verification_label || 'Verified legal profile'}
          </EditableText>
          ) : null}
        </div>

        <div className={`mt-8 grid auto-rows-fr gap-3 ${lawyerClassicGridClass(4, items.length)}`}>
          {items.map((item) => {
            const Icon = standingIcons[item.kind] || ShieldCheck;
            return (
              <article
                key={item.id}
                data-storefront-anim-item="true"
                className="group min-h-40 bg-white/[0.055] p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.06)] transition hover:-translate-y-1 hover:bg-white/[0.09]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent">{item.title}</h3>
                    <p className={`mt-3 text-2xl font-semibold tracking-tight ${
                      requestedTextColor ? 'text-current' : 'text-primary-contrast'
                    }`}>
                      {item.value}
                    </p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center bg-accent/10 text-accent transition group-hover:scale-110">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
