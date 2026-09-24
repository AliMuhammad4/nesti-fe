"use client";

import {
  CalendarClock,
  CreditCard,
  ExternalLink,
  FileText,
  LayoutTemplate,
} from "lucide-react";
import { formatAdminLabel } from "@/components/admin/AdminUi";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function money(cents, fallback = "$0") {
  const value = Number(cents);
  if (!Number.isFinite(value)) return fallback;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 100 === 0 ? 0 : 2,
  }).format(value / 100);
}

function StatusPill({ item }) {
  if (item.status === "expired") {
    return (
      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
        Expired
      </span>
    );
  }
  if (item.cancel_at_period_end) {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
        Ends {formatDate(item.expires_at || item.renews_at)}
      </span>
    );
  }
  if (item.will_renew) {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
        Renewing
      </span>
    );
  }
  if (item.is_trial) {
    return (
      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-200">
        Trial
      </span>
    );
  }
  if (item.is_free) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
        Included
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
      {formatAdminLabel(item.status) || "Inactive"}
    </span>
  );
}

function cycleLabel(item) {
  const date = formatDate(item.expires_at || item.renews_at);
  if (!item.expires_at && !item.renews_at) {
    return item.is_free ? "Included with this role" : "No billing date on file";
  }
  if (item.status === "expired") return `Expired ${date}`;
  if (item.cancel_at_period_end) return `Access through ${date}`;
  if (item.will_renew) {
    const renewsAt = item.renews_at || item.expires_at;
    const renewDate = renewsAt ? new Date(renewsAt) : null;
    const today = new Date();
    const renewsToday = Boolean(
      renewDate
      && !Number.isNaN(renewDate.getTime())
      && renewDate.getFullYear() === today.getFullYear()
      && renewDate.getMonth() === today.getMonth()
      && renewDate.getDate() === today.getDate(),
    );
    return renewsToday ? "Renews today" : `Renews ${date}`;
  }
  return `Expires ${date}`;
}

export default function AdminProfessionalBilling({ billing }) {
  const items = billing?.items || [];
  const nextAt = formatDate(billing?.next_expected_at);
  const platform = items.filter((item) => item.kind === "platform");
  const templates = items
    .filter((item) => item.kind === "template")
    .slice()
    .sort((a, b) => Number(Boolean(b.is_published)) - Number(Boolean(a.is_published))
      || Number(Boolean(b.will_renew)) - Number(Boolean(a.will_renew)));
  const renewingTemplates = templates.filter((item) => item.will_renew).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Total spent
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">
                {billing?.total_spent || money(billing?.total_spent_cents)}
              </p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white shadow-sm">
              <CreditCard size={18} />
            </span>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-xs leading-5 text-slate-500">
              Plan plus storefront templates billed so far
            </p>
          </div>
        </article>

        <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-emerald-200 hover:shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Next expected earning
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">
                {billing?.next_expected || money(billing?.next_expected_cents)}
              </p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <CalendarClock size={18} />
            </span>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-xs leading-5 text-slate-500">
              {billing?.next_expected_cents
                ? `Renews ${nextAt}`
                : "No paid renewals this cycle"}
            </p>
          </div>
        </article>
      </div>

      <section className="w-full overflow-hidden bg-transparent">
        {platform.map((item) => (
          <div key={item.id} className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/70 bg-transparent px-0 py-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-11 w-11 place-items-center bg-slate-900 text-white">
                <CreditCard size={18} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Platform plan</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">{item.name}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <StatusPill item={item} />
                  {item.renews_at ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <CalendarClock size={12} />
                      {cycleLabel(item)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold tabular-nums text-slate-950">
                {item.display_amount}
                <span className="ml-1 text-sm font-medium text-slate-500">/{item.interval}</span>
              </p>
            </div>
          </div>
        ))}

        <div className="flex items-end justify-between gap-3 px-5 pt-4 pb-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Storefront templates</p>
            <p className="mt-0.5 text-sm text-slate-500">Monthly access through period end</p>
          </div>
          <p className="text-xs font-medium text-slate-500">{renewingTemplates} renewing</p>
        </div>

        {templates.length ? (
          <ul>
            {templates.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ${
                    item.is_published
                      ? "bg-slate-900 text-white ring-slate-900"
                      : "bg-slate-50 text-slate-600 ring-slate-200"
                  }`}>
                    <LayoutTemplate size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="truncate font-semibold text-slate-950">{item.name}</h4>
                      <StatusPill item={item} />
                      {item.is_published ? (
                        <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                          Live page
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Storefront template · {cycleLabel(item)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold tabular-nums text-slate-950">
                    {item.display_amount}
                    {item.amount_cents > 0 ? (
                      <span className="ml-1 text-xs font-medium text-slate-500">/{item.interval}</span>
                    ) : null}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-500">
            No storefront templates on this account.
          </div>
        )}
      </section>
    </div>
  );
}

export function AdminProfessionalInvoices({ billing }) {
  const invoices = billing?.invoices || [];
  return (
    <section className="w-full overflow-hidden bg-transparent">
      <div className="flex items-end justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Paid invoices</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">Platform plan and storefront templates</h3>
        </div>
        <p className="text-xs font-medium text-slate-500">
          {invoices.length} receipt{invoices.length === 1 ? "" : "s"}
        </p>
      </div>
      {invoices.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-[0.12em] text-slate-400">
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-3 py-3 font-semibold">Product</th>
                <th className="px-3 py-3 font-semibold">Invoice</th>
                <th className="px-3 py-3 font-semibold text-right">Amount</th>
                <th className="px-5 py-3 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-50 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {formatDate(invoice.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-950">{invoice.product || invoice.description || "Subscription"}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      {invoice.kind === "template" ? "Storefront template" : "Platform plan"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-slate-500">
                    {invoice.number}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums text-slate-950">
                    {invoice.displayAmount || money(invoice.amountPaid || invoice.amount_paid)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {invoice.hostedInvoiceUrl || invoice.invoicePdf ? (
                      <a
                        href={invoice.hostedInvoiceUrl || invoice.invoicePdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        {invoice.hostedInvoiceUrl ? "View" : "PDF"}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <FileText size={12} />
                        Paid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-slate-500">No paid invoices on this account yet.</p>
      )}
    </section>
  );
}
