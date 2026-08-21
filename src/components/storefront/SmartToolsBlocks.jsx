'use client';

import { useMemo, useState } from 'react';
import { Calculator, ShieldAlert } from 'lucide-react';

const fieldClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';
const currency = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
});

function progressiveTax(amount, bands) {
  let previousLimit = 0;
  let total = 0;
  bands.forEach(({ limit, rate }) => {
    const taxable = Math.max(0, Math.min(amount, limit) - previousLimit);
    total += taxable * rate;
    previousLimit = limit;
  });
  return total;
}

function transferCharge(amount, province) {
  if (!amount) return null;
  if (province === 'Ontario') {
    return {
      label: 'Illustrative Ontario land transfer tax',
      amount: progressiveTax(amount, [
        { limit: 55_000, rate: 0.005 },
        { limit: 250_000, rate: 0.01 },
        { limit: 400_000, rate: 0.015 },
        { limit: 2_000_000, rate: 0.02 },
        { limit: Number.POSITIVE_INFINITY, rate: 0.025 },
      ]),
      note: 'Excludes Toronto municipal land transfer tax and all rebates or exemptions.',
    };
  }
  if (province === 'British Columbia') {
    return {
      label: 'Illustrative B.C. property transfer tax',
      amount: progressiveTax(amount, [
        { limit: 200_000, rate: 0.01 },
        { limit: 2_000_000, rate: 0.02 },
        { limit: 3_000_000, rate: 0.03 },
        { limit: Number.POSITIVE_INFINITY, rate: 0.05 },
      ]),
      note: 'Assumes a residential purchase and excludes rebates, exemptions, and foreign-buyer taxes.',
    };
  }
  if (province === 'Alberta') {
    return {
      label: 'Illustrative Alberta land-title transfer charge',
      amount: 50 + (Math.ceil(amount / 5_000) * 5),
      note: 'Does not include mortgage registration, legal fees, adjustments, or other closing charges.',
    };
  }
  return null;
}

function ToolShell({
  icon: Icon,
  title,
  description,
  titleField,
  descriptionField,
  children,
}) {
  return (
    <section className="border-y border-slate-100 bg-transparent py-12 sm:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-5 sm:p-7" data-storefront-anim-item="true">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={20} /></div>
            <div className="min-w-0 flex-1">
              <h2
                data-storefront-field={titleField}
                data-storefront-source={titleField ? 'persisted' : undefined}
                data-storefront-label={titleField ? 'Estimator heading' : undefined}
                className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
              >
                {title}
              </h2>
              <p
                data-storefront-field={descriptionField}
                data-storefront-source={descriptionField ? 'persisted' : undefined}
                data-storefront-label={descriptionField ? 'Estimator description' : undefined}
                className="mt-1 text-sm leading-6 text-slate-500"
              >
                {description}
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function MortgageAffordabilityCalculator() {
  const [income, setIncome] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('25');
  const result = useMemo(() => {
    const annualIncome = Number(income) || 0;
    const down = Number(downPayment) || 0;
    const monthlyBudget = annualIncome * 0.39 / 12;
    const monthlyRate = (Number(rate) || 0) / 100 / 12;
    const months = (Number(years) || 25) * 12;
    const mortgage = monthlyRate > 0 ? monthlyBudget * ((1 - (1 + monthlyRate) ** -months) / monthlyRate) : monthlyBudget * months;
    return { mortgage, homePrice: mortgage + down };
  }, [income, downPayment, rate, years]);

  return (
    <ToolShell icon={Calculator} title="Mortgage affordability planner" description="Explore a rough starting range before speaking with a licensed mortgage professional.">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Annual household income<input className={fieldClass} inputMode="numeric" value={income} onChange={(e) => setIncome(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 100000" /></label>
        <label className="text-sm font-medium text-slate-700">Available down payment<input className={fieldClass} inputMode="numeric" value={downPayment} onChange={(e) => setDownPayment(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 80000" /></label>
        <label className="text-sm font-medium text-slate-700">Illustrative interest rate<input className={fieldClass} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} /></label>
        <label className="text-sm font-medium text-slate-700">Amortization years<input className={fieldClass} inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} /></label>
      </div>
      {Number(income) > 0 && (
        <div className="mt-5 rounded-xl bg-primary/10 p-4">
          <p className="text-sm text-slate-600">Illustrative home-price range</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Math.max(0, result.homePrice))}</p>
        </div>
      )}
      <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500"><ShieldAlert className="mt-0.5 shrink-0" size={14} />For education only. This is not a rate quote, pre-approval, or lending commitment. Taxes, debts, and lender criteria are not included.</p>
    </ToolShell>
  );
}

export function ClosingCostEstimator({ content = {} }) {
  const [price, setPrice] = useState('');
  const [province, setProvince] = useState('Ontario');
  const amount = Number(price) || 0;
  const transfer = useMemo(() => transferCharge(amount, province), [amount, province]);
  const legalAllowance = amount ? { low: 1_800, high: 3_500 } : null;
  const hasUsablePrice = amount >= 10_000 && amount <= 100_000_000;
  const inputError = amount > 0 && !hasUsablePrice
    ? 'Enter a purchase price between $10,000 and $100,000,000.'
    : '';
  const estimateLow = hasUsablePrice
    ? (transfer?.amount || 0) + legalAllowance.low
    : 0;
  const estimateHigh = hasUsablePrice
    ? (transfer?.amount || 0) + legalAllowance.high
    : 0;
  return (
    <ToolShell
      icon={Calculator}
      title={content.heading || 'Closing-cost planning estimator'}
      description={content.body || 'Plan for potential closing costs before your transaction.'}
      titleField="content.heading"
      descriptionField="content.body"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="closing-cost-price">
          <span>Purchase price</span>
          <input
            id="closing-cost-price"
            className={fieldClass}
            inputMode="numeric"
            autoComplete="off"
            value={price}
            onChange={(event) => setPrice(event.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="e.g. 900000"
            aria-describedby="closing-cost-price-help closing-cost-price-error"
            aria-invalid={Boolean(inputError)}
          />
        </label>
        <label className="text-sm font-medium text-slate-700" htmlFor="closing-cost-province">
          <span>Province or territory</span>
          <select
            id="closing-cost-province"
            className={fieldClass}
            value={province}
            onChange={(event) => setProvince(event.target.value)}
          >
            <option>Ontario</option>
            <option>British Columbia</option>
            <option>Alberta</option>
            <option>Other</option>
          </select>
        </label>
      </div>
      <p id="closing-cost-price-help" className="mt-2 text-xs leading-5 text-slate-500">
        CAD only. The result covers selected transfer charges plus a general legal and disbursement allowance.
      </p>
      <p id="closing-cost-price-error" className="mt-1 text-xs font-medium text-red-600" role="alert">
        {inputError}
      </p>
      {hasUsablePrice ? (
        <div className="mt-5 rounded-xl bg-primary/10 p-4" role="status" aria-live="polite">
          {transfer ? (
            <>
              <div className="flex flex-col gap-1 border-b border-primary/10 pb-3 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="text-sm font-medium text-slate-700">{transfer.label}</p>
                <p className="text-xl font-bold text-slate-900">{currency.format(transfer.amount)}</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{transfer.note}</p>
            </>
          ) : (
            <p className="text-sm leading-6 text-slate-700">
              Transfer taxes and registration charges are not estimated for this jurisdiction.
            </p>
          )}
          <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-sm font-medium text-slate-700">Legal and disbursement planning allowance</p>
            <p className="text-lg font-bold text-slate-900">
              {currency.format(legalAllowance.low)}–{currency.format(legalAllowance.high)}
            </p>
          </div>
          {transfer ? (
            <div className="mt-4 border-t border-primary/10 pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Partial planning range
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {currency.format(estimateLow)}–{currency.format(estimateHigh)}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
      <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500">
        <ShieldAlert className="mt-0.5 shrink-0" size={14} aria-hidden="true" />
        <span>
          Educational planning only—not legal advice or a quote. Municipal taxes, sales taxes,
          adjustments, financing charges, insurance, rebates, exemptions, and transaction-specific
          fees may materially change the total. Confirm the final statement of adjustments with your lawyer.
        </span>
      </p>
    </ToolShell>
  );
}
