"use client";

import Link from "next/link";
import { Loader2, Lock, RefreshCw } from "lucide-react";
import {
  useCancelStorefrontTemplateSubscription,
  useResumeStorefrontTemplateSubscription,
  useStorefrontTemplateEntitlements,
} from "@/hooks/useBillingApi";

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function statusLabel(subscription) {
  if (!subscription) return "";
  if (subscription.legacy_lifetime) return "Lifetime unlock";
  if (subscription.cancel_at_period_end) return "Cancels at period end";
  const status = String(subscription.status || "").toLowerCase();
  if (status === "active" || status === "trialing") return "Active monthly";
  if (status === "past_due") return "Past due";
  return status || "Inactive";
}

export default function StorefrontTemplateSubscriptionsPanel() {
  const entitlementsQuery = useStorefrontTemplateEntitlements();
  const cancelMutation = useCancelStorefrontTemplateSubscription();
  const resumeMutation = useResumeStorefrontTemplateSubscription();

  const templates = (entitlementsQuery.data?.templates || []).filter((template) => (
    template.amount > 0
    && template.unlocked
    && template.subscription
  ));

  if (entitlementsQuery.isLoading) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={14} className="animate-spin" />
          Loading template subscriptions…
        </div>
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Storefront templates
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-900">No paid template subscriptions</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Unlock a paid lawyer or agent template from the public page builder. Free templates stay available without a subscription.
        </p>
        <Link
          href="/dashboard/public-profile"
          className="mt-3 inline-flex text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Open page builder
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Storefront templates
          </p>
          <h3 className="mt-1 text-sm font-bold text-slate-950">Monthly template subscriptions</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Cancel anytime. Access stays until the period ends, then the live page using that template is unpublished.
          </p>
        </div>
        <Link
          href="/dashboard/public-profile"
          className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          Manage pages
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {templates.map((template) => {
          const subscription = template.subscription;
          const pending = (
            (cancelMutation.isPending && cancelMutation.variables?.templateId === template.template_id)
            || (resumeMutation.isPending && resumeMutation.variables === template.template_id)
          );
          return (
            <div
              key={template.template_id}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">{template.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {String(template.tier || "").replace(/^\w/, (c) => c.toUpperCase())}
                    {" · "}
                    {template.display_amount}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${
                      subscription.cancel_at_period_end
                        ? "bg-amber-50 text-amber-700"
                        : subscription.legacy_lifetime
                          ? "bg-slate-200 text-slate-700"
                          : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {statusLabel(subscription)}
                    </span>
                    {subscription.current_period_end ? (
                      <span className="text-slate-500">
                        {subscription.cancel_at_period_end ? "Ends" : "Renews"}{" "}
                        {formatDate(subscription.current_period_end)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {subscription.legacy_lifetime ? (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-500">
                      <Lock size={12} />
                      Lifetime
                    </span>
                  ) : null}
                  {subscription.manageable && !subscription.cancel_at_period_end ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => cancelMutation.mutate({
                        templateId: template.template_id,
                        reason: "Canceled from settings",
                      })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                      {pending ? <Loader2 size={12} className="animate-spin" /> : null}
                      Cancel at period end
                    </button>
                  ) : null}
                  {subscription.manageable && subscription.cancel_at_period_end ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => resumeMutation.mutate(template.template_id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {pending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      Keep subscription
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
