"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, CreditCard, Crown, ExternalLink, Loader2, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { toast } from "react-toastify";

const PLANS = [
  {
    tier: 'basic',
    name: 'Basic',
    price: '$9.99',
    period: '/mo',
    description: 'Start with the essentials for tracking your buying journey.',
    features: [
      'Basic homeownership progress tracking',
      'Simple budget calculator',
      'Match with 5 professionals/month',
      'Email support',
    ],
    icon: Check,
    popular: false,
  },
  {
    tier: 'standard',
    name: 'Standard',
    price: '$24.99',
    period: '/mo',
    description: 'Get stronger planning tools and priority professional matching.',
    features: [
      'Advanced progress tracking',
      'Detailed financial planning tools',
      'Match with 15 professionals/month',
      'Priority matching',
      'Chat support',
    ],
    icon: Zap,
    popular: true,
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$49.99',
    period: '/mo',
    description: 'Unlock premium matching, recommendations, and dedicated support.',
    features: [
      'All Standard features',
      'Unlimited professional matching',
      'Premium priority matching',
      'Personalized recommendations',
      'Dedicated support',
      'Exclusive market insights',
    ],
    icon: Crown,
    popular: false,
  },
];

const formatDate = (value) => {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const TIER_ORDER = {
  basic: 1,
  standard: 2,
  pro: 3,
};

const getTierRank = (tier) => TIER_ORDER[String(tier || "").trim().toLowerCase()] || 0;

const getPlanSwitchLabel = (currentTier, targetTier) => {
  const currentRank = getTierRank(currentTier);
  const targetRank = getTierRank(targetTier);
  if (!currentRank || !targetRank || currentRank === targetRank) return "Switch plan";
  return targetRank > currentRank ? "Upgrade" : "Downgrade";
};

export default function ClientSubscriptionPanel({
  subscription,
  invoices = [],
  invoicesLoading = false,
  onSubscriptionChange,
  token,
  mode = "billing",
}) {
  const [loading, setLoading] = useState(false);
  const [processingTier, setProcessingTier] = useState(null);
  const [planSwitchTarget, setPlanSwitchTarget] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPlanOptions, setShowPlanOptions] = useState(false);
  const isSubscriptionPage = mode === "subscription";

  const handleSubscribe = async (tier) => {
    try {
      setLoading(true);
      setProcessingTier(tier);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/subscription/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.success && data.data.sessionUrl) {
        window.location.href = data.data.sessionUrl;
      } else {
        toast.error(data.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setLoading(false);
      setProcessingTier(null);
    }
  };

  const handleCancel = async (reason) => {
    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Subscription will be canceled at the end of the billing period');
        setShowCancelModal(false);
        if (onSubscriptionChange) {
          onSubscriptionChange();
        }
      } else {
        toast.error(data.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/subscription/resume`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Subscription will continue renewing automatically');
        if (onSubscriptionChange) {
          await onSubscriptionChange();
        }
      } else {
        toast.error(data.message || 'Failed to continue subscription');
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast.error('Failed to continue subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!planSwitchTarget) return;

    try {
      setLoading(true);
      setProcessingTier(planSwitchTarget.tier);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/subscription/change-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: planSwitchTarget.tier }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Subscription plan updated');
        setPlanSwitchTarget(null);
        if (data.changeType === 'upgrade' && data.invoice?.hostedInvoiceUrl && data.invoice.status !== 'paid') {
          window.location.href = data.invoice.hostedInvoiceUrl;
          return;
        }
        if (onSubscriptionChange) {
          await onSubscriptionChange();
        }
      } else {
        toast.error(data.message || 'Failed to change subscription plan');
      }
    } catch (error) {
      console.error('Error changing client subscription plan:', error);
      toast.error('Failed to change subscription plan');
    } finally {
      setLoading(false);
      setProcessingTier(null);
    }
  };

  const currentTier = subscription?.tier;
  const isActive = subscription?.status === 'active';
  const pendingTier = String(subscription?.pending_tier || '').trim().toLowerCase();
  const pendingTierEffectiveAt = subscription?.pending_tier_effective_at;
  const pendingPlan = PLANS.find((plan) => plan.tier === pendingTier);
  const currentPlan = PLANS.find((plan) => plan.tier === currentTier);
  const renewalLabel = formatDate(subscription?.current_period_end);
  const showPlanCards = isSubscriptionPage ? true : (!isActive || showPlanOptions);
  const visiblePlans = isActive && !isSubscriptionPage
    ? PLANS.filter((plan) => getTierRank(plan.tier) > getTierRank(currentTier))
    : PLANS;
  const canShowPlanToggle = isActive
    ? (isSubscriptionPage ? true : visiblePlans.length > 0)
    : visiblePlans.length > 0;

  return (
    <div className="w-full space-y-5">
      {subscription && isActive && !isSubscriptionPage ? (
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.055)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />
          <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck size={18} />
                  </span>
                  <h2 className="text-xl font-black text-text-heading sm:text-2xl">
                    {currentPlan?.name || String(currentTier || '').replace(/_/g, ' ')}{" "}
                    {isSubscriptionPage ? "plan" : "billing plan"}
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-text-body">
                  {isSubscriptionPage
                    ? (currentPlan?.description || 'Monthly subscription billed through Stripe.')
                    : `Current billing plan with renewal details and payment history. ${currentPlan?.description || ''}`.trim()}
                </p>
              </div>
              <div className="w-full shrink-0 rounded-2xl border border-border/80 bg-gradient-to-br from-white to-background-light/45 p-4 lg:w-auto lg:min-w-[10rem]">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black tracking-tight text-primary">
                    {currentPlan?.price || '—'}
                  </span>
                  <span className="mb-1.5 text-sm font-semibold text-text-muted">
                    {currentPlan?.period || '/month'}
                  </span>
                </div>
                <p className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-text-muted">
                  <CreditCard size={13} className="text-primary" />
                  Recurring monthly billing
                </p>
              </div>
            </div>

            <div
              className={`mt-5 grid gap-3 sm:grid-cols-2 ${
                canShowPlanToggle ? "lg:grid-cols-3" : "lg:grid-cols-2"
              }`}
            >
              <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-white to-background-light/45 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">Next renewal</p>
                <p className="mt-1 text-sm font-semibold text-text-heading">{renewalLabel || '—'}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-white to-background-light/45 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">Status</p>
                <p className={`mt-1 text-sm font-semibold ${subscription?.cancel_at_period_end ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {subscription?.cancel_at_period_end ? 'Cancels at period end' : 'Active subscription'}
                </p>
              </div>
              {canShowPlanToggle ? (
                <div className="flex items-center rounded-2xl border border-border/80 bg-gradient-to-br from-white to-background-light/45 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setShowPlanOptions((prev) => !prev)}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    {showPlanOptions
                      ? 'Hide plans'
                      : isSubscriptionPage
                        ? 'Change plan'
                        : 'Upgrade options'}{" "}
                    →
                  </button>
                </div>
              ) : null}
            </div>

            {subscription?.cancel_at_period_end ? (
              <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Subscription is set to end on{" "}
                <span className="font-semibold text-amber-950">{renewalLabel || "your period end date"}</span>.
                Manage cancellation only from the Subscriptions page.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {pendingPlan ? (
        <div className="rounded-3xl border border-amber-200/80 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-[0_14px_38px_rgba(15,23,42,0.04)]">
          <p className="font-bold text-amber-950">Plan change scheduled</p>
          <p className="mt-1 leading-relaxed">
            You will stay on the <span className="font-semibold capitalize">{currentTier}</span> plan until{" "}
            <span className="font-semibold">{pendingTierEffectiveAt ? formatDate(pendingTierEffectiveAt) : "your next renewal"}</span>.
            Then your subscription will move to <span className="font-semibold">{pendingPlan.name}</span>.
          </p>
        </div>
      ) : null}

      {showPlanCards ? (
      visiblePlans.length > 0 ? (
      <div className="grid gap-4 lg:grid-cols-3">
        {visiblePlans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentTier === plan.tier && isActive;
          const isScheduledPlan = pendingTier === plan.tier;
          const isProcessing = processingTier === plan.tier;
          const switchLabel = getPlanSwitchLabel(currentTier, plan.tier);

          return (
            <div
              key={plan.tier}
              className={`group relative flex min-h-[23.5rem] flex-col overflow-hidden rounded-3xl border bg-white px-4 pb-4 pt-3 transition-all duration-300 ${
                isCurrentPlan
                  ? 'border-primary/70 bg-gradient-to-br from-primary/[0.08] via-white to-emerald-50/70 shadow-[0_22px_60px_rgba(22,163,74,0.20)] ring-2 ring-primary/25'
                  : plan.popular
                    ? 'border-primary/35 shadow-[0_22px_55px_rgba(22,163,74,0.16)] ring-1 ring-primary/15'
                    : 'border-border shadow-[0_14px_38px_rgba(15,23,42,0.055)] hover:border-primary/25 hover:shadow-[0_20px_48px_rgba(15,23,42,0.09)]'
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${
                  isCurrentPlan
                    ? 'bg-gradient-to-r from-emerald-500 via-primary to-primary-dark'
                    : plan.popular
                      ? 'bg-gradient-to-r from-primary via-primary-dark to-primary'
                      : 'bg-gradient-to-r from-primary/35 via-primary/20 to-transparent'
                }`}
              />
              <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-primary/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80" />

              <div className="relative z-10 mb-3 flex min-h-[2rem] items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    isCurrentPlan ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-primary/10 text-primary'
                  }`}>
                    {plan.popular ? <Sparkles size={17} /> : <Icon size={17} />}
                  </span>
                  <h3 className="truncate text-xl font-black leading-tight text-text-heading">{plan.name}</h3>
                </div>
                {isCurrentPlan ? (
                  <span className="shrink-0 rounded-full bg-gradient-to-r from-primary to-primary-dark px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                    Current
                  </span>
                ) : isScheduledPlan ? (
                  <span className="shrink-0 rounded-full border border-primary/15 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
                    Next
                  </span>
                ) : plan.popular ? (
                  <span className="shrink-0 rounded-full bg-gradient-to-r from-primary to-primary-dark px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                    Popular
                  </span>
                ) : null}
              </div>

              <p className="relative z-10 mb-3 min-h-[3rem] text-sm leading-5 text-text-body">
                {plan.description}
              </p>

              <div className={`relative z-10 mb-3 rounded-2xl border p-3 ${
                isCurrentPlan
                  ? 'border-primary/25 bg-white shadow-inner shadow-primary/5'
                  : 'border-border/80 bg-gradient-to-br from-white to-background-light/45'
              }`}>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black tracking-tight text-primary">{plan.price}</span>
                  <span className="mb-1.5 text-sm font-semibold text-text-muted">{plan.period}</span>
                </div>
                <p className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-text-muted">
                  <CreditCard size={13} className="text-primary" />
                  Recurring monthly billing
                </p>
              </div>

              <ul className="relative z-10 mb-3 flex-1 space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 rounded-xl bg-background-light/50 px-3 py-1.5 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check size={12} strokeWidth={2.6} />
                    </span>
                    <span className="text-sm font-medium leading-5 text-text-body">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <div className="relative z-10 mt-auto w-full rounded-2xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-center text-sm font-semibold text-primary">
                  {subscription?.cancel_at_period_end
                    ? "Current subscribed plan (cancellation scheduled)"
                    : "Current subscribed plan"}
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (isActive) {
                      setPlanSwitchTarget(plan);
                    } else {
                      handleSubscribe(plan.tier);
                    }
                  }}
                  disabled={loading || isScheduledPlan}
                  className={`group/cta relative z-10 mt-auto w-full overflow-hidden rounded-2xl px-4 py-2.5 text-sm font-bold transition-all disabled:opacity-50 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg'
                      : 'border border-border bg-white text-text-heading hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background-light hover:text-primary hover:shadow-md'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : isScheduledPlan ? (
                    'Scheduled'
                  ) : isActive ? (
                    isSubscriptionPage ? switchLabel : "Upgrade"
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Subscribe
                      <ArrowRight size={17} className="transition-transform duration-300 group-hover/cta:translate-x-1" />
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-muted">
          You are already on the highest available plan.
        </div>
      )
      ) : null}

      {isSubscriptionPage && isActive ? (
        subscription?.cancel_at_period_end ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-900">
              Access ends <span className="font-bold text-amber-950">{renewalLabel || 'at period end'}</span>.
              Continue subscription anytime before then.
            </p>
            <button
              type="button"
              onClick={handleResume}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Continue subscription
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Cancel anytime. Access continues until the end of your billing period.
            </p>
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-background-light/60 px-4 py-2 text-sm font-medium text-text-muted transition hover:border-border/90 hover:bg-background-light hover:text-text-body disabled:opacity-60"
            >
              Cancel subscription
            </button>
          </div>
        )
      ) : null}

      {isActive ? (
        <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-[0_14px_38px_rgba(15,23,42,0.04)]">
          <div className="border-b border-border/60 px-5 py-4 sm:px-6">
            <h3 className="text-base font-black text-text-heading">
              {isSubscriptionPage ? "Billing history" : "Payment activity"}
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              {isSubscriptionPage
                ? "Paid invoices from your subscription."
                : "Invoice records and payment receipts for your current plan."}
            </p>
          </div>
          <div className="px-5 py-4 sm:px-6">
            {invoicesLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-text-muted">
                <Loader2 size={16} className="animate-spin text-primary" />
                Loading invoices...
              </div>
            ) : null}
            {!invoicesLoading && invoices.length === 0 ? (
              <p className="py-4 text-sm text-text-muted">No paid invoices yet.</p>
            ) : null}
            {invoices.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-[0.12em] text-text-muted">
                      <th className="pb-3 pr-4 font-bold">Date</th>
                      <th className="pb-3 pr-4 font-bold">Invoice</th>
                      <th className="pb-3 pr-4 font-bold">Description</th>
                      <th className="pb-3 pr-4 text-right font-bold">Amount</th>
                      <th className="pb-3 text-right font-bold">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border/40 last:border-0 hover:bg-background-light/50">
                        <td className="whitespace-nowrap py-3.5 pr-4 text-text-body">
                          {formatDate(invoice.createdAt) || "—"}
                        </td>
                        <td className="whitespace-nowrap py-3.5 pr-4 font-mono text-xs text-text-muted">
                          {invoice.number || invoice.id}
                        </td>
                        <td className="py-3.5 pr-4 text-text-body">
                          <span className="line-clamp-1">{invoice.description || `${invoice.number || "Invoice"} payment`}</span>
                        </td>
                        <td className="whitespace-nowrap py-3.5 pr-4 text-right font-bold text-primary">
                          {invoice.displayAmount || "-"}
                        </td>
                        <td className="whitespace-nowrap py-3.5 text-right">
                          {invoice.hostedInvoiceUrl || invoice.invoicePdf ? (
                            <a
                              href={invoice.hostedInvoiceUrl || invoice.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                            >
                              View
                              <ExternalLink size={13} />
                            </a>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <ClientPlanSwitchConfirmModal
        isOpen={Boolean(planSwitchTarget)}
        currentTier={currentTier}
        targetPlan={planSwitchTarget}
        effectiveAt={subscription?.current_period_end}
        isPending={loading}
        onClose={() => setPlanSwitchTarget(null)}
        onConfirm={handleChangePlan}
      />
      <ClientCancelSubscriptionModal
        isOpen={showCancelModal}
        renewDate={subscription?.current_period_end ? formatDate(subscription.current_period_end) : ""}
        planName={currentPlan?.name || currentTier}
        isPending={loading}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
      />
    </div>
  );
}

const modalOverlayStyle = {
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
};

function ClientCancelSubscriptionModal({
  isOpen,
  renewDate,
  planName,
  isPending,
  onClose,
  onConfirm,
}) {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const scrollTarget = document.getElementById("workspace-main") || document.body;
    const previousOverflow = scrollTarget.style.overflow;
    scrollTarget.style.overflow = "hidden";
    return () => {
      scrollTarget.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          style={modalOverlayStyle}
        >
          <button
            type="button"
            aria-label="Close cancel subscription modal"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/10"
            style={modalOverlayStyle}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
            style={modalOverlayStyle}
          >
            <div className="h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />
            <div className="flex items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-text-heading">Cancel subscription?</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                  You will keep full access until{" "}
                  <span className="font-semibold text-primary">
                    {renewDate || "the end of your billing period"}
                  </span>
                  . No further charges after that.
                </p>
                <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-950">
                  <p className="font-semibold">We&apos;re sorry to see you go.</p>
                  <p className="mt-1 text-amber-900">
                    If you cancel your <span className="font-medium">{planName || "current"}</span> plan, you
                    will lose access to paid client subscription features after your current period ends.
                  </p>
                </div>
                <div className="mt-3">
                  <label
                    htmlFor="client-cancel-reason"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-text-muted"
                  >
                    Reason for cancellation
                  </label>
                  <textarea
                    id="client-cancel-reason"
                    rows={3}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Please tell us why you want to cancel..."
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    disabled={isPending}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-md p-1 text-text-muted transition hover:bg-background-light hover:text-text-heading disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-heading transition hover:bg-background-light disabled:opacity-60"
              >
                Keep subscription
              </button>
              <button
                type="button"
                onClick={() => onConfirm(reason.trim())}
                disabled={isPending || !reason.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                {isPending ? "Canceling..." : "Cancel subscription"}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

function ClientPlanSwitchConfirmModal({
  isOpen,
  currentTier,
  targetPlan,
  effectiveAt,
  isPending,
  onClose,
  onConfirm,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const scrollTarget = document.getElementById("workspace-main") || document.body;
    const previousOverflow = scrollTarget.style.overflow;
    scrollTarget.style.overflow = "hidden";
    return () => {
      scrollTarget.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!mounted || !targetPlan) return null;

  const actionLabel = getPlanSwitchLabel(currentTier, targetPlan.tier);
  const isUpgrade = getTierRank(targetPlan.tier) > getTierRank(currentTier);
  const currentPlan = PLANS.find((plan) => plan.tier === currentTier);
  const effectiveDate = effectiveAt ? formatDate(effectiveAt) : "";

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          style={modalOverlayStyle}
        >
          <button
            type="button"
            aria-label="Close plan switch modal"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/10"
            style={modalOverlayStyle}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
            style={modalOverlayStyle}
          >
            <div className="h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />
            <div className="flex items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-text-heading">
                  {actionLabel} to {targetPlan.name}?
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                  You are currently on the{" "}
                  <span className="font-semibold text-text-heading">
                    {currentPlan?.name || currentTier}
                  </span>{" "}
                  plan.
                  {isUpgrade
                    ? " Stripe bills only the prorated difference for the rest of this billing cycle, then the full price on your next renewal."
                    : ` You will keep your current plan until ${effectiveDate || "the next renewal date"}, then the lower plan starts.`}
                </p>
                <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-sm text-text-body">
                  <p className="font-semibold text-text-heading">Plan change summary</p>
                  {currentPlan ? (
                    <p className="mt-1 text-text-muted">
                      Current: <span className="font-semibold text-text-heading">{currentPlan.name}</span>{" "}
                      at <span className="font-semibold text-text-heading">{currentPlan.price}</span>
                      <span className="text-text-muted">{currentPlan.period}</span>
                    </p>
                  ) : null}
                  <p className="mt-1 text-text-muted">
                    {isUpgrade ? "Starts now" : `Starts ${effectiveDate || "next renewal"}`}:{" "}
                    <span className="font-semibold text-primary">{targetPlan.name}</span>{" "}
                    at <span className="font-semibold text-primary">{targetPlan.price}</span>
                    <span className="text-text-muted">{targetPlan.period}</span>
                  </p>
                  <p className="mt-2 text-xs font-medium text-text-muted">
                    {isUpgrade
                      ? "Your renewal date stays the same; Stripe applies unused time from the old plan as credit."
                      : "No immediate charge. Your current plan remains active until the renewal date."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-md p-1 text-text-muted transition hover:bg-background-light hover:text-text-heading disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-heading transition hover:bg-background-light disabled:opacity-60"
              >
                Keep current plan
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                {isPending ? "Updating..." : isUpgrade ? `Pay and ${actionLabel}` : `Schedule ${actionLabel}`}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
