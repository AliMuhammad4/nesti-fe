'use client';

import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, ShieldCheck, TrendingUp } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerContentSource,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from './BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentValue,
  brokerContentRegionClass,
  brokerHighlightCardStyle,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  normalizedItems,
  transparentSectionPresentation,
} from './brokerSectionUtils';
import { BROKER_CLASSIC_ROLE_HIGHLIGHTS, BROKER_CLASSIC_ROLE_SNAPSHOT_DEFAULTS } from './brokerClassicDefaults';

export function BrokerClassicBusinessLoans({
  profile,
  actions = {},
  block,
  fallbackHighlights = BROKER_CLASSIC_ROLE_HIGHLIGHTS,
  snapshotDefaults = BROKER_CLASSIC_ROLE_SNAPSHOT_DEFAULTS,
  headingDefaults = {
    eyebrow: 'Business & commercial',
    heading: 'Flexible financing for growing businesses',
    body: 'Fast approvals, affordable repayment plans, and clear documentation pathways for business and commercial needs.',
  },
  ctaDefault = 'See What I May Qualify For',
}) {
  const content = blockContent(block);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '2');
  const stats = profile?.stats || {};
  const company = profile?.professional_profile?.company_name
    || profile?.company_name
    || 'Independent mortgage guidance';
  const snapshot = [
    {
      id: 'funded',
      icon: BriefcaseBusiness,
      label: 'Loans funded',
      value: Number(stats.loans_funded) > 0
        ? `${new Intl.NumberFormat('en-US').format(stats.loans_funded)}+`
        : 'Tailored',
    },
    {
      id: 'approval',
      icon: TrendingUp,
      label: 'Approval rate',
      value: Number(stats.approval_rate) > 0 ? `${stats.approval_rate}%` : 'Strategic',
    },
    {
      id: 'turnaround',
      icon: Clock3,
      label: 'Average approval',
      value: Number(stats.avg_approval_days) > 0 ? `${stats.avg_approval_days} days` : 'Responsive',
    },
  ];
  const { items, hasPersisted } = normalizedItems(content, fallbackHighlights, 'highlights', 6);
  const ctaLabel = brokerContentValue(content, 'cta_label', ctaDefault);
  const snapshotEyebrow = brokerContentValue(
    content,
    'snapshot_eyebrow',
    snapshotDefaults.snapshot_eyebrow,
  );
  const snapshotHeading = brokerContentValue(
    content,
    'snapshot_heading',
    snapshotDefaults.snapshot_heading,
  );

  return (
    <section
      id="business-loans"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow={headingDefaults.eyebrow}
          heading={headingDefaults.heading}
          body={headingDefaults.body}
        />

        <div
          className={`relative mt-10 overflow-hidden ${presentation.cardVisualClass} ${brokerContentRegionClass(presentation.contentAlignment)}`}
          style={cardSurfaceStyle(presentation)}
        >
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[color:var(--storefront-accent,#008fd5)]/10 blur-3xl" />

          <div className="relative border-b border-slate-100 px-6 py-7 sm:px-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--storefront-accent,#008fd5)]">
                  <BriefcaseBusiness size={15} />
                  <EditableText
                    as="span"
                    field="content.snapshot_eyebrow"
                    label="Snapshot eyebrow"
                    source={lawyerContentSource(content, 'snapshot_eyebrow')}
                  >
                    {snapshotEyebrow}
                  </EditableText>
                </span>
                <EditableText
                  as="h3"
                  field="content.snapshot_heading"
                  label="Snapshot heading"
                  source={lawyerContentSource(content, 'snapshot_heading')}
                  className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-[color:var(--storefront-primary,#0c2139)] sm:text-3xl"
                >
                  {snapshotHeading}
                </EditableText>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
                <CheckCircle2 size={16} className="text-[color:var(--storefront-accent,#008fd5)]" />
                {company}
              </div>
            </div>
          </div>

          <div className="relative grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {snapshot.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-4 px-6 py-5 sm:px-7">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center bg-[color:var(--storefront-accent,#008fd5)]/10 text-[color:var(--storefront-accent,#008fd5)]"
                    style={{ borderRadius: presentation.controlRadius }}
                  >
                    <Icon size={19} />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-[color:var(--storefront-primary,#0c2139)]">{item.value}</p>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative bg-[#f8fafc] px-6 py-7 sm:px-9">
            <ul className="grid gap-3 md:grid-cols-3">
              {items.map((item, index) => {
                const highlightStyle = brokerHighlightCardStyle(item, presentation);
                return (
                <li
                  key={item.id}
                  className={`flex items-start gap-3 px-4 py-4 ${presentation.cardVisualClass}`}
                  style={highlightStyle.style}
                >
                  <ShieldCheck
                    size={18}
                    className={`mt-0.5 shrink-0 ${highlightStyle.hasCustom ? 'text-current' : 'text-[color:var(--storefront-accent,#008fd5)]'}`}
                  />
                  <EditableText
                    field="content.highlights"
                    label={`Highlight ${index + 1}`}
                    source={hasPersisted ? 'persisted' : 'fallback'}
                    collection="highlights"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="title"
                    className={`text-sm font-semibold leading-6 ${
                      highlightStyle.hasCustom ? 'text-current' : 'text-[color:var(--storefront-primary,#0c2139)]'
                    }`}
                  >
                    {item.title}
                  </EditableText>
                </li>
                );
              })}
            </ul>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={actions.onDirectLeadClick}
                className="inline-flex min-h-12 items-center gap-2 bg-[color:var(--storefront-accent,#008fd5)] px-7 text-sm font-bold tracking-wide text-white transition hover:brightness-110"
                style={{ borderRadius: presentation.controlRadius, boxShadow: presentation.shellShadow }}
              >
                <EditableText
                  as="span"
                  field="content.cta_label"
                  label="Business financing button"
                  source={lawyerContentSource(content, 'cta_label')}
                >
                  {ctaLabel}
                </EditableText>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
