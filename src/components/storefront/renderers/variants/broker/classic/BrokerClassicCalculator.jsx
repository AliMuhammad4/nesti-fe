'use client';

import { useMemo, useState } from 'react';
import { Calculator, ShieldAlert } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerContentSource,
} from '../../lawyer/shared/lawyerSectionUtils';
import {
  BROKER_INK,
  brokerAlignmentClass,
  brokerAlignmentMarginClass,
  brokerContentValue,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  transparentSectionPresentation,
} from './brokerSectionUtils';

const fieldClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[color:var(--storefront-accent,#008fd5)] focus:ring-2 focus:ring-[color:var(--storefront-accent,#008fd5)]/15';
const selectClass = `${fieldClass} pr-3`;

const AMORTIZATION_OPTIONS = [10, 15, 20, 25, 30];
const PAYMENT_FREQUENCIES = [
  { id: 'monthly', label: 'Monthly', periodsPerYear: 12, accelerated: false },
  { id: 'semi-monthly', label: 'Semi-monthly', periodsPerYear: 24, accelerated: false },
  { id: 'bi-weekly', label: 'Bi-weekly', periodsPerYear: 26, accelerated: false },
  { id: 'accelerated-bi-weekly', label: 'Accelerated bi-weekly', periodsPerYear: 26, accelerated: true },
  { id: 'weekly', label: 'Weekly', periodsPerYear: 52, accelerated: false },
  { id: 'accelerated-weekly', label: 'Accelerated weekly', periodsPerYear: 52, accelerated: true },
];

function currency(value, digits = 0) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Math.max(0, value || 0));
}

function parseMoney(value) {
  return Number(String(value || '').replace(/[^\d.]/g, '')) || 0;
}

/** Canadian Interest Act: quoted rates compound semi-annually, not in advance. */
function canadianPeriodicRate(annualPercent, periodsPerYear) {
  const annual = Math.max(0, Number(annualPercent) || 0) / 100;
  if (annual <= 0) return 0;
  return (1 + annual / 2) ** (2 / periodsPerYear) - 1;
}

function canadianPayment(principal, annualPercent, amortizationYears, frequency) {
  const amount = Math.max(0, Number(principal) || 0);
  const years = Math.max(1, Number(amortizationYears) || 25);
  const periodsPerYear = frequency.periodsPerYear;
  const totalPeriods = Math.round(years * periodsPerYear);

  if (amount <= 0) return 0;

  // Accelerated payments: take the monthly payment and split it.
  if (frequency.accelerated) {
    const monthly = canadianPayment(amount, annualPercent, years, PAYMENT_FREQUENCIES[0]);
    return frequency.periodsPerYear === 26 ? monthly / 2 : monthly / 4;
  }

  const periodicRate = canadianPeriodicRate(annualPercent, periodsPerYear);
  if (periodicRate <= 0) return amount / totalPeriods;
  return amount * (periodicRate / (1 - (1 + periodicRate) ** -totalPeriods));
}

function mortgageInsuranceRate(ltvPercent) {
  if (ltvPercent <= 80) return 0;
  if (ltvPercent < 85) return 0.028;
  if (ltvPercent < 90) return 0.031;
  if (ltvPercent <= 95) return 0.04;
  return 0.04;
}

function minimumDownPayment(purchasePrice) {
  const price = Math.max(0, Number(purchasePrice) || 0);
  if (price <= 0) return 0;
  if (price <= 500000) return price * 0.05;
  if (price < 1500000) return 25000 + (price - 500000) * 0.1;
  return price * 0.2;
}

export function BrokerClassicCalculator({ actions = {}, block }) {
  const content = blockContent(block);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '1');
  const [purchasePrice, setPurchasePrice] = useState('750000');
  const [downPayment, setDownPayment] = useState('150000');
  const [rate, setRate] = useState('4.79');
  const [years, setYears] = useState('25');
  const [frequencyId, setFrequencyId] = useState('monthly');

  const frequency = PAYMENT_FREQUENCIES.find((item) => item.id === frequencyId)
    || PAYMENT_FREQUENCIES[0];

  const result = useMemo(() => {
    const price = parseMoney(purchasePrice);
    const down = parseMoney(downPayment);
    const basePrincipal = Math.max(0, price - down);
    const downPercent = price > 0 ? (down / price) * 100 : 0;
    const ltvPercent = price > 0 ? (basePrincipal / price) * 100 : 0;
    const insuranceRate = mortgageInsuranceRate(ltvPercent);
    const insurancePremium = basePrincipal * insuranceRate;
    const insuredPrincipal = basePrincipal + insurancePremium;
    const payment = canadianPayment(insuredPrincipal, rate, years, frequency);
    const monthlyEquivalent = canadianPayment(
      insuredPrincipal,
      rate,
      years,
      PAYMENT_FREQUENCIES[0],
    );
    const minDown = minimumDownPayment(price);
    return {
      price,
      down,
      basePrincipal,
      insuredPrincipal,
      insurancePremium,
      insuranceRate,
      payment,
      monthlyEquivalent,
      downPercent,
      ltvPercent,
      minDown,
      meetsMinDown: down + 0.01 >= minDown,
      needsInsurance: insuranceRate > 0,
      highRatioBlocked: ltvPercent > 95,
    };
  }, [purchasePrice, downPayment, rate, years, frequency]);

  const setDownPercent = (percent) => {
    const price = parseMoney(purchasePrice);
    if (price <= 0) return;
    setDownPayment(String(Math.round(price * (Number(percent) / 100))));
  };

  const ctaLabel = brokerContentValue(content, 'cta_label', 'Get My Mortgage Options');
  const paymentLabel = frequency.accelerated
    ? `Estimated ${frequency.label.toLowerCase()} payment`
    : `Estimated ${frequency.label.toLowerCase()} payment`;

  return (
    <section
      id="calculator"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div
        className={`w-full max-w-none overflow-hidden ${presentation.cardVisualClass}`}
        style={cardSurfaceStyle(presentation)}
      >
        <div className="grid lg:grid-cols-[1.12fr_.88fr] lg:items-stretch">
          <div className="flex h-full flex-col border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:border-slate-100">
            <div
              className={`space-y-3 ${brokerAlignmentClass(presentation.headingAlignment)} ${brokerAlignmentMarginClass(presentation.headingAlignment)}`}
              data-storefront-anim-item="true"
            >
              <div className={`flex items-center gap-3 ${
                presentation.headingAlignment === 'center'
                  ? 'justify-center'
                  : presentation.headingAlignment === 'right'
                    ? 'justify-end'
                    : ''
              }`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color:var(--storefront-accent,#008fd5)] text-white shadow-[0_8px_18px_rgba(0,143,213,.28)]">
                  <Calculator size={20} />
                </span>
                <EditableText
                  as="h2"
                  field="content.heading"
                  label="Calculator heading"
                  source={lawyerContentSource(content, 'heading')}
                  className="min-w-0 text-xl font-bold tracking-tight text-[color:var(--storefront-primary,#0c2139)] sm:text-2xl sm:leading-tight"
                >
                  {brokerContentValue(content, 'heading', 'Estimate your payment, then get options')}
                </EditableText>
              </div>
              <EditableText
                as="p"
                field="content.body"
                label="Calculator description"
                source={lawyerContentSource(content, 'body')}
                className={`text-sm leading-6 text-slate-600 ${
                  presentation.headingAlignment === 'left' ? 'sm:pl-14 sm:whitespace-nowrap' : ''
                }`}
              >
                {brokerContentValue(content, 'body', 'Use this planner to explore an illustrative payment range, then request a personalized mortgage review.')}
              </EditableText>
            </div>

            <div className="mt-7 grid flex-1 content-start gap-4 text-left sm:grid-cols-2" data-storefront-anim-item="true">
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Home purchase price
                <input
                  className={fieldClass}
                  inputMode="numeric"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value.replace(/\D/g, ''))}
                  placeholder="750000"
                />
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Down payment
                <input
                  className={fieldClass}
                  inputMode="numeric"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value.replace(/\D/g, ''))}
                  placeholder="150000"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {[5, 10, 15, 20].map((percent) => (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => setDownPercent(percent)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                        Math.abs(result.downPercent - percent) < 0.35
                          ? 'border-[color:var(--storefront-accent,#008fd5)] bg-[color:var(--storefront-accent,#008fd5)]/10 text-[color:var(--storefront-accent,#008fd5)]'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {percent}%
                    </button>
                  ))}
                  <span className="text-[11px] text-slate-500">
                    {result.downPercent.toFixed(1)}% down
                    {!result.meetsMinDown && result.price > 0
                      ? ` · typical minimum ${currency(result.minDown)}`
                      : ''}
                  </span>
                </div>
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-700">
                Interest rate (%)
                <input
                  className={fieldClass}
                  inputMode="decimal"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
                <span className="mt-1 block min-h-[1rem] text-[11px] leading-4 text-slate-500">
                  Compounded semi-annually (Canadian standard)
                </span>
              </label>

              <label className="flex flex-col text-sm font-medium text-slate-700">
                Amortization period
                <select
                  className={selectClass}
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                >
                  {AMORTIZATION_OPTIONS.map((option) => (
                    <option key={option} value={String(option)}>
                      {option} years
                    </option>
                  ))}
                </select>
                <span className="mt-1 block min-h-[1rem] text-[11px] leading-4 text-transparent select-none" aria-hidden>
                  &nbsp;
                </span>
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Payment frequency
                <select
                  className={selectClass}
                  value={frequencyId}
                  onChange={(e) => setFrequencyId(e.target.value)}
                >
                  {PAYMENT_FREQUENCIES.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div
            className="flex h-full flex-col bg-[color:var(--storefront-primary,#0c2139)] p-6 text-white sm:p-8"
            data-storefront-anim-item="true"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Canadian payment estimate</p>

            <div className="mt-6 flex flex-1 flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.06] px-3.5 py-3.5 ring-1 ring-white/10">
                  <p className="text-[11px] text-white/55">Mortgage amount</p>
                  <p className="mt-1 text-lg font-bold tracking-tight">{currency(result.basePrincipal)}</p>
                </div>
                <div className="rounded-xl bg-white/[0.06] px-3.5 py-3.5 ring-1 ring-white/10">
                  <p className="text-[11px] text-white/55">Down payment</p>
                  <p className="mt-1 text-lg font-bold tracking-tight">{currency(result.down)}</p>
                </div>
              </div>

              {result.highRatioBlocked ? (
                <p className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-100">
                  Down payment is under 5%. High-ratio insured mortgages in Canada typically require at least 5% down.
                </p>
              ) : null}

              {result.needsInsurance && !result.highRatioBlocked ? (
                <div className="rounded-xl bg-white/[0.06] px-3.5 py-3.5 ring-1 ring-white/10">
                  <p className="text-[11px] text-white/55">
                    Mortgage default insurance ({(result.insuranceRate * 100).toFixed(2)}%)
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">{currency(result.insurancePremium)}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">
                    Usually added to the mortgage when down payment is below 20%.
                  </p>
                </div>
              ) : null}

              <div className="rounded-xl bg-white/[0.04] px-3.5 py-3.5 ring-1 ring-white/10">
                <p className="text-sm text-white/65">Total amount financed</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{currency(result.insuredPrincipal)}</p>
              </div>

              <div className="rounded-xl bg-white/[0.04] px-3.5 py-4 ring-1 ring-white/10">
                <p className="text-sm text-white/65">{paymentLabel}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{currency(result.payment)}</p>
                {frequency.id !== 'monthly' ? (
                  <p className="mt-1 text-[11px] text-white/45">
                    Monthly equivalent ≈ {currency(result.monthlyEquivalent)}
                  </p>
                ) : null}
              </div>

              <div className="mt-auto pt-2">
                <button
                  type="button"
                  onClick={() => {
                    actions.onCtaClick?.('mortgage_options');
                    actions.onDirectLeadClick?.();
                  }}
                  className="inline-flex min-h-12 w-full items-center justify-center bg-[color:var(--storefront-accent,#008fd5)] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 hover:brightness-105"
                  style={{
                    borderRadius: presentation.controlRadius,
                    boxShadow: presentation.shellShadow,
                  }}
                >
                  <EditableText
                    field="content.cta_label"
                    label="Calculator CTA"
                    source={lawyerContentSource(content, 'cta_label')}
                  >
                    {ctaLabel}
                  </EditableText>
                </button>

                <p className="mt-4 flex gap-2 text-xs leading-5 text-white/55">
                  <ShieldAlert className="mt-0.5 shrink-0" size={14} />
                  Educational estimate only. Uses Canadian semi-annual compounding. Not a formal quote, stress-test result, or lender commitment. Property tax, heat, condo fees, and lender rules are excluded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
