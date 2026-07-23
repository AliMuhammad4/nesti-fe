'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Calculator, Home, MapPin, ShieldAlert } from 'lucide-react';

const fieldClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';

function ToolShell({ icon: Icon, title, description, children }) {
  return (
    <section className="border-y border-slate-100 bg-transparent py-12 sm:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={20} /></div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
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

export function ClosingCostEstimator() {
  const [price, setPrice] = useState('');
  const [province, setProvince] = useState('Ontario');
  const amount = Number(price) || 0;
  // Conservative planning estimate only; province-specific legal/tax rules are
  // intentionally not represented as a quote.
  const estimate = amount ? Math.max(1800, amount * (province === 'Ontario' ? 0.018 : 0.015)) : 0;
  return (
    <ToolShell icon={Calculator} title="Closing-cost planning estimator" description="Plan for potential closing costs before your transaction.">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Purchase price<input className={fieldClass} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 900000" /></label>
        <label className="text-sm font-medium text-slate-700">Province<select className={fieldClass} value={province} onChange={(e) => setProvince(e.target.value)}><option>Ontario</option><option>British Columbia</option><option>Alberta</option><option>Other</option></select></label>
      </div>
      {estimate > 0 && <div className="mt-5 rounded-xl bg-primary/10 p-4"><p className="text-sm text-slate-600">Planning estimate</p><p className="mt-1 text-2xl font-bold text-slate-900">{new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(estimate)}</p></div>}
      <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500"><ShieldAlert className="mt-0.5 shrink-0" size={14} />General educational estimate only, not legal advice or a quote. Taxes, rebates, disbursements, and fees vary by transaction and jurisdiction.</p>
    </ToolShell>
  );
}

export function HomeValuationLeadBlock({ onLeadClick }) {
  return (
    <section className="border-y border-slate-100 bg-transparent pb-8 pt-4 sm:pb-10 sm:pt-5">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(28rem,1.2fr)] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Home valuation
              </p>
              <div className="mt-2.5 flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Home size={17} />
                </span>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  What could your home be worth?
                </h2>
              </div>
              <p className="mt-2.5 max-w-xl text-[13px] leading-5 text-slate-500">
                Request a personalized local market review from this professional.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-primary shadow-sm ring-1 ring-slate-200">
                  <MapPin size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">Start with your property address</p>
                  <p className="mt-0.5 text-[12px] leading-5 text-slate-500">
                    Share your address and goals for a human-reviewed valuation conversation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onLeadClick}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                >
                  Request valuation
                  <ArrowRight size={13} />
                </button>
              </div>
              <p className="mt-3 flex items-start gap-1.5 border-t border-slate-200 pt-3 text-[10px] leading-4 text-slate-400">
                <ShieldAlert size={12} className="mt-0.5 shrink-0" />
                A valuation request is not an appraisal or guarantee of sale price.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
