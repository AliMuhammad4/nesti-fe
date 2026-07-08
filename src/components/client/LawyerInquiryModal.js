"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2, X } from "lucide-react";

const TRANSACTION_TYPE_OPTIONS = [
  { value: "home_purchase", label: "Home purchase" },
  { value: "home_sale", label: "Home sale" },
  { value: "refinance", label: "Refinance" },
  { value: "title_transfer", label: "Title transfer" },
  { value: "unspecified", label: "Not sure yet" },
];

const CLOSING_TIMELINE_OPTIONS = [
  { value: "within_30_days", label: "Within 30 days" },
  { value: "30_60_days", label: "30-60 days" },
  { value: "60_90_days", label: "60-90 days" },
  { value: "unknown", label: "Not sure yet" },
];

const LEGAL_SERVICE_OPTIONS = [
  { value: "full_closing", label: "Full closing services" },
  { value: "purchase_closing", label: "Purchase closing" },
  { value: "sale_closing", label: "Sale closing" },
  { value: "refinance_legal_work", label: "Refinance legal work" },
  { value: "agreement_review", label: "Agreement / contract review" },
  { value: "title_transfer", label: "Title transfer" },
  { value: "document_review", label: "Document review" },
  { value: "mortgage_document_review", label: "Mortgage document review" },
  { value: "property_dispute_advice", label: "Property dispute / legal advice" },
  { value: "other", label: "Other legal service" },
];

const PROPERTY_VALUE_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "under_400k", label: "Under $400K" },
  { value: "400k_700k", label: "$400K-$700K" },
  { value: "700k_1m", label: "$700K-$1M" },
  { value: "1m_plus", label: "$1M+" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-text-heading shadow-sm shadow-slate-900/[0.02] placeholder:text-text-muted/60 transition focus:border-primary/35 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10";

function SelectField({ label, value, onChange, options, required = false }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) || options[0];

  return (
    <div className="relative space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          className={`${inputClass} flex items-center justify-between gap-3 pr-3 text-left`}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate">{selected?.label || "Select"}</span>
          <ChevronDown
            size={16}
            strokeWidth={2.25}
            className={`shrink-0 text-slate-400 transition ${open ? "rotate-180 text-primary" : ""}`}
          />
        </button>

        {open ? (
          <div
            className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[12050] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/[0.03]"
            role="listbox"
          >
            {options.map((option) => {
              const active = option.value === value && option.label === selected?.label;
              return (
                <button
                  key={`${label}-${option.label}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-text-heading hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ModalShell({ children }) {
  return createPortal(children, document.body);
}

export default function LawyerInquiryModal({
  open,
  submitting = false,
  professionalName = "Lawyer",
  onClose,
  onSubmit,
}) {
  const [message, setMessage] = useState("");
  const [transactionType, setTransactionType] = useState("home_purchase");
  const [closingTimeline, setClosingTimeline] = useState("30_60_days");
  const [legalService, setLegalService] = useState("full_closing");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setTransactionType("home_purchase");
    setClosingTimeline("30_60_days");
    setLegalService("full_closing");
    setPropertyAddress("");
    setPropertyValue("");
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open || !mounted) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, mounted]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        message.trim() &&
          transactionType.trim() &&
          closingTimeline.trim() &&
          legalService.trim() &&
          !submitting,
      ),
    [message, transactionType, closingTimeline, legalService, submitting],
  );

  const handleSubmit = async () => {
    setError("");
    if (!message.trim()) {
      setError("Please add your question.");
      return;
    }
    if (!transactionType || !closingTimeline || !legalService) {
      setError("Please complete the required fields.");
      return;
    }

    await onSubmit?.({
      message: message.trim(),
      transaction_type: transactionType,
      closing_timeline: closingTimeline,
      legal_services_needed: legalService,
      property_address: propertyAddress.trim(),
      property_value: propertyValue,
    });
  };

  if (!open || !mounted) return null;

  return (
    <ModalShell>
    <div className="fixed inset-0 z-[11000] flex h-[100dvh] w-screen items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
      <div className="relative w-full max-w-[34rem] rounded-[1.35rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/20 ring-1 ring-slate-900/[0.03]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-5 py-4">
          <div>
            <h3 className="text-base font-bold tracking-tight text-text-heading">Ask {professionalName}</h3>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Submit a quick legal inquiry. The lawyer will review it from their leads.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-slate-200 bg-white p-2 text-text-muted shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-text-heading disabled:opacity-60"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
              Your question <span className="text-red-500">*</span>
            </span>
            <textarea
              className={`${inputClass} min-h-24 resize-y leading-5`}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe your legal question or concern..."
              maxLength={1200}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Transaction type"
              value={transactionType}
              onChange={setTransactionType}
              options={TRANSACTION_TYPE_OPTIONS}
              required
            />
            <SelectField
              label="Closing timeline"
              value={closingTimeline}
              onChange={setClosingTimeline}
              options={CLOSING_TIMELINE_OPTIONS}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Legal service needed"
              value={legalService}
              onChange={setLegalService}
              options={LEGAL_SERVICE_OPTIONS}
              required
            />
            <SelectField
              label="Property value range"
              value={propertyValue}
              onChange={setPropertyValue}
              options={PROPERTY_VALUE_OPTIONS}
            />
          </div>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
              Property address / location
            </span>
            <input
              className={inputClass}
              value={propertyAddress}
              onChange={(event) => setPropertyAddress(event.target.value)}
              placeholder="e.g. Downtown, Lahore"
              maxLength={180}
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-text-heading shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            {submitting ? "Submitting..." : "Send inquiry"}
          </button>
        </div>
      </div>
    </div>
    </ModalShell>
  );
}
