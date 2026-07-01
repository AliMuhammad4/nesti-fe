"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ChevronRight,
  ClipboardList,
  Loader2,
  MessageSquare,
  UserRound,
} from "lucide-react";
import { useAppSelector } from "@/store";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchClientInquiries } from "@/lib/clientInquiriesClient";

const FILTER_TABS = [
  { id: "", label: "All" },
  { id: "property", label: "Properties" },
  { id: "professional", label: "Professionals" },
];

function formatRole(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatPrice(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const numeric = Number(raw.replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numeric);
  }
  return raw;
}

function InquiryRow({ item, onOpenChat, onViewProperty, onViewProfile }) {
  const professional = item.professional || {};
  const property = item.property || null;
  const isProperty = item.inquiry_type === "property";

  return (
    <article className="flex flex-col gap-3 border-b border-gray-200/70 py-3 last:border-b-0 transition hover:bg-white/40 sm:flex-row sm:items-center sm:gap-4 sm:py-2.5">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        {professional.profile_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={professional.profile_image}
            alt={professional.full_name || "Professional"}
            className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
          />
        ) : (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
            {isProperty ? <Building2 size={15} /> : <UserRound size={15} />}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {isProperty && property?.title ? property.title : professional.full_name || "Inquiry"}
            {isProperty && property?.price ? (
              <span className="ml-2 text-xs font-semibold text-primary">{formatPrice(property.price)}</span>
            ) : null}
          </p>

          <p className="truncate text-xs text-gray-500">
            {professional.full_name ? (
              <>
                {formatRole(professional.professional_type)}
                {professional.company_name ? ` · ${professional.company_name}` : ""}
              </>
            ) : null}
            {professional.full_name && item.message ? " · " : null}
            {item.message ? <span className="text-gray-400">{item.message}</span> : null}
          </p>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-end gap-3 sm:ml-auto sm:w-auto">
        <span className="text-[11px] text-gray-400">{formatDate(item.updated_at || item.created_at)}</span>
        {item.thread_id ? (
          <button
            type="button"
            onClick={() => onOpenChat(item.thread_id)}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-primary-dark"
          >
            <MessageSquare size={13} />
            Chat
          </button>
        ) : null}
        {property?.id ? (
          <button
            type="button"
            onClick={() => onViewProperty(property.id)}
            className="inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-primary/30 hover:text-primary"
          >
            Property
            <ChevronRight size={13} />
          </button>
        ) : null}
        {professional?.id && !isProperty ? (
          <button
            type="button"
            onClick={() => onViewProfile(professional.id)}
            className="inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-primary/30 hover:text-primary"
          >
            Profile
            <ChevronRight size={13} />
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default function ClientInquiriesPage() {
  const { isAuthenticated } = useAuthGuard();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [activeFilter, setActiveFilter] = useState("");

  const query = useQuery({
    queryKey: ["client-inquiries", token, activeFilter],
    enabled: Boolean(token),
    queryFn: () => fetchClientInquiries({ token, type: activeFilter, limit: 50 }),
    staleTime: 30_000,
  });

  const items = useMemo(
    () => (Array.isArray(query.data?.items) ? query.data.items : []),
    [query.data?.items],
  );

  const counts = useMemo(() => {
    const apiCounts = query.data?.counts;
    if (apiCounts && typeof apiCounts.total === "number") {
      return {
        total: apiCounts.total,
        property: apiCounts.property ?? 0,
        professional: apiCounts.professional ?? 0,
      };
    }
    return {
      total: query.data?.pagination?.total ?? items.length,
      property: items.filter((item) => item.inquiry_type === "property").length,
      professional: items.filter((item) => item.inquiry_type === "professional").length,
    };
  }, [items, query.data?.counts, query.data?.pagination?.total]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen w-full px-4 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 ring-1 ring-primary/20">
            <ClipboardList size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">My Inquiries</h1>
            <p className="truncate text-xs text-gray-600">Property and professional conversations</p>
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id || "all"}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                  active ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {!query.isLoading && !query.isError ? (
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: counts.total },
            { label: "Property", value: counts.property },
            { label: "Professional", value: counts.professional },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{stat.label}</p>
              <p className="text-lg font-bold tabular-nums text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {query.isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gray-200 bg-white py-8 shadow-sm">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="mt-2 text-xs text-gray-500">Loading inquiries...</p>
          </div>
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-red-600 shadow-sm">
          {query.error?.message || "Failed to load inquiries."}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center shadow-sm">
          <ClipboardList size={32} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-900">No inquiries yet</p>
          <p className="mt-1 text-xs text-gray-500">Inquire on a property or message a professional to get started.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/client-dashboard/properties")}
              className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary-dark"
            >
              Browse properties
            </button>
            <button
              type="button"
              onClick={() => router.push("/professionals?recommended=1")}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:text-primary"
            >
              Recommendations
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {items.map((item) => (
            <InquiryRow
              key={item.id}
              item={item}
              onOpenChat={(threadId) => router.push(`/messages/${encodeURIComponent(threadId)}`)}
              onViewProperty={(propertyId) => router.push(`/client-dashboard/properties/${encodeURIComponent(propertyId)}`)}
              onViewProfile={(professionalId) => router.push(`/professionals/${encodeURIComponent(professionalId)}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
