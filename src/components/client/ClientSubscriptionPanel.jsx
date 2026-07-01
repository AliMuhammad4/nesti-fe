"use client";

import { useState } from "react";
import { ArrowRight, Check, CreditCard, Crown, Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";
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

export default function ClientSubscriptionPanel({ subscription, onSubscriptionChange, token }) {
  const [loading, setLoading] = useState(false);
  const [processingTier, setProcessingTier] = useState(null);

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

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/subscription/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Subscription will be canceled at the end of the billing period');
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

  const currentTier = subscription?.tier;
  const isActive = subscription?.status === 'active';

  return (
    <div className="w-full space-y-5">
      {subscription && isActive ? (
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.055)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <ShieldCheck size={19} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">Current plan</p>
                <h3 className="mt-1 text-lg font-black capitalize text-text-heading">{currentTier}</h3>
                {subscription.cancel_at_period_end ? (
                  <p className="mt-1 text-xs font-semibold text-red-600">Cancels at period end</p>
                ) : (
                  <p className="mt-1 text-sm text-text-muted">Your client subscription is active.</p>
                )}
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-primary to-primary-dark px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
              <Check size={13} />
              Active
            </span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentTier === plan.tier && isActive;
          const isProcessing = processingTier === plan.tier;

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
                <button
                  onClick={handleCancel}
                  disabled={loading || subscription?.cancel_at_period_end}
                  className="relative z-10 mt-auto w-full rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md disabled:opacity-50"
                >
                  {subscription?.cancel_at_period_end ? 'Canceling' : 'Cancel Plan'}
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loading || (isActive && !isCurrentPlan)}
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
                  ) : isActive && !isCurrentPlan ? (
                    'Contact Support to Upgrade'
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
    </div>
  );
}
