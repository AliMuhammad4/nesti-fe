'use client';

import {
  BadgeCheck,
} from 'lucide-react';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  resolveLawyerClassicIcon,
} from '../../lawyer/shared/lawyerSectionUtils';
import {
  BROKER_INK,
  brokerAlignmentClass,
  brokerAlignmentMarginClass,
  brokerContentRegionClass,
  brokerDarkSurfaceClass,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  transparentSectionPresentation,
} from './brokerSectionUtils';
import { resolveBrokerCredentialItems } from './brokerCredentialMetrics';

export function BrokerClassicCredentials({ profile, block }) {
  const content = blockContent(block);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '4');
  const defaultOrder = ['pipeline', 'experience', 'clients', 'cases'];
  const requestedOrder = Array.isArray(content.metric_order)
    ? content.metric_order.filter((kind) => defaultOrder.includes(kind))
    : [];
  const metricOrder = [...new Set([...requestedOrder, ...defaultOrder])];
  const hiddenMetrics = new Set(Array.isArray(content.hidden_metrics) ? content.hidden_metrics : []);
  const metrics = resolveBrokerCredentialItems(profile)
    .filter((item) => !hiddenMetrics.has(item.kind))
    .map((item) => ({
      ...item,
      title: content.metric_labels?.[item.kind] || item.title,
    }))
    .sort((a, b) => metricOrder.indexOf(a.kind) - metricOrder.indexOf(b.kind));
  const metricIconDefaults = {
    pipeline: 'dollar',
    experience: 'calendar',
    clients: 'users',
    cases: 'file',
  };
  const professional = profile?.professional_profile || {};
  const license = professional.license_number || profile?.license_number || '';
  const isVerified = profile?.credentials_verified === true
    || professional.credentials_verified === true
    || Boolean(license);
  const cardBackground = content.card_background || '';
  const cardTextColor = content.card_text_color || '';
  const hasCustomMetricCards = Boolean(cardBackground || cardTextColor);
  const sectionBackground = presentation.background && presentation.background !== 'transparent'
    ? presentation.background
    : 'var(--storefront-primary, #0c2139)';
  const sectionColor = presentation.color || '#ffffff';
  const hasCustomSectionText = Boolean(
    (block?.data?.style || block?.style || {}).textColor,
  );

  return (
    <section
      id="credentials"
      className={`relative overflow-hidden px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: sectionBackground, color: sectionColor }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(0,143,213,.16),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative w-full max-w-none">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className={`max-w-3xl ${brokerAlignmentClass(presentation.headingAlignment)} ${brokerAlignmentMarginClass(presentation.headingAlignment)}`}>
            <EditableText
              as="p"
              field="content.eyebrow"
              label="Credentials eyebrow"
              className="text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--storefront-accent,#008fd5)]"
            >
              {content.eyebrow || 'Professional standing'}
            </EditableText>
            <EditableText
              as="h2"
              field="content.heading"
              label="Credentials heading"
              className={`mt-2 text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-3xl ${
                hasCustomSectionText ? 'text-current' : 'text-white'
              }`}
            >
              {content.heading || 'Mortgage experience you can verify'}
            </EditableText>
            <EditableText
              as="p"
              field="content.body"
              label="Credentials description"
              className={`mt-3 max-w-2xl text-sm leading-6 ${
                hasCustomSectionText ? 'text-current opacity-65' : 'text-white/65'
              }`}
            >
              {content.body || 'A transparent view of financing activity, responsiveness, and professional experience.'}
            </EditableText>
          </div>

          {isVerified ? (
            <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm">
              <BadgeCheck size={17} className="text-[color:var(--storefront-accent,#008fd5)]" />
              Verified mortgage profile
            </div>
          ) : null}
        </div>

        <div className={`relative mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${brokerContentRegionClass(presentation.contentAlignment)}`}>
        {metrics.map((item, index) => {
          const Icon = resolveLawyerClassicIcon(
            { icon: content.metric_icons?.[item.kind] || metricIconDefaults[item.kind] },
            index,
            ['dollar', 'calendar', 'users', 'file'],
          );
          return (
          <article
            key={item.id}
            data-storefront-anim-item="true"
            className={`group relative min-w-0 overflow-hidden px-4 py-4 text-left transition duration-300 hover:-translate-y-0.5 ${
              hasCustomMetricCards
                ? presentation.cardVisualClass
                : brokerDarkSurfaceClass(presentation)
            }`}
            style={{
              ...cardSurfaceStyle(presentation),
              ...(cardBackground ? { background: cardBackground } : {}),
              ...(cardTextColor ? { color: cardTextColor } : {}),
            }}
          >
            <span className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-[color:var(--storefront-accent,#008fd5)]/75" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className={`text-[10px] font-semibold uppercase tracking-[0.13em] ${
                  hasCustomMetricCards ? 'text-current opacity-45' : 'text-white/45'
                }`}
                >
                  {item.title}
                </p>
                <p className={`mt-1.5 break-words text-2xl font-semibold leading-tight tracking-[-0.025em] ${
                  hasCustomMetricCards ? 'text-current' : 'text-white'
                }`}
                >
                  {item.value}
                </p>
              </div>
              <span
                className="grid h-8 w-8 shrink-0 place-items-center bg-[color:var(--storefront-accent,#008fd5)] text-white transition duration-300 group-hover:brightness-110"
                style={{ borderRadius: presentation.controlRadius }}
              >
                <Icon size={14} strokeWidth={2} />
              </span>
            </div>
            <p className={`mt-2.5 text-xs leading-5 ${
              hasCustomMetricCards ? 'text-current opacity-45' : 'text-white/45'
            }`}
            >
              {item.description}
            </p>
          </article>
          );
        })}
        </div>

      </div>
    </section>
  );
}
