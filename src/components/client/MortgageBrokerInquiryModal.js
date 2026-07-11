"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2, X } from "lucide-react";

const MORTGAGE_TIMELINE_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "1_2_months", label: "1-2 months" },
  { value: "3_6_months", label: "3-6 months" },
  { value: "6_12_months", label: "6-12 months" },
  { value: "just_researching", label: "Just researching" },
];

const PRE_APPROVAL_OPTIONS = [
  { value: "need_now", label: "Need pre-approval now" },
  { value: "in_progress", label: "Pre-approval in progress" },
  { value: "already_approved", label: "Already pre-approved" },
  { value: "expired", label: "Pre-approval expired" },
  { value: "just_researching", label: "Just researching" },
];

const PURPOSE_OPTIONS = [
  { value: "primary_residence", label: "Primary residence" },
  { value: "investment", label: "Investment property" },
  { value: "refinance", label: "Refinance" },
  { value: "vacation_home", label: "Vacation / second home" },
];

const CREDIT_OPTIONS = [
  { value: "", label: "Not sure / prefer not to say" },
  { value: "750_plus", label: "750+" },
  { value: "700_749", label: "700-749" },
  { value: "650_699", label: "650-699" },
  { value: "600_649", label: "600-649" },
  { value: "under_600", label: "Under 600" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "full_time", label: "Full-time employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "contract", label: "Contract / temporary" },
  { value: "new_job", label: "New job" },
  { value: "unemployed", label: "Unemployed" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-text-heading shadow-sm shadow-slate-900/[0.02] placeholder:text-text-muted/60 transition focus:border-primary/35 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10";

function SelectField({ label, value, onChange, options, required = false }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return undefined;

    const updatePosition = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 0;
      const spaceBelow = viewportHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const preferredMax = Math.min(220, Math.max(spaceBelow, spaceAbove, 120));
      const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;

      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        zIndex: 12050,
        maxHeight: preferredMax,
        ...(openUp
          ? { bottom: viewportHeight - rect.top + 6 }
          : { top: rect.bottom + 6 }),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      const target = event.target;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
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

      {open && menuStyle && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              style={menuStyle}
              className="overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/[0.03]"
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export default function MortgageBrokerInquiryModal({
  open,
  submitting = false,
  professionalName = "Mortgage broker",
  onClose,
  onSubmit,
}) {
  const [message, setMessage] = useState("");
  const [mortgageTimeline, setMortgageTimeline] = useState("1_2_months");
  const [preApprovalStatus, setPreApprovalStatus] = useState("need_now");
  const [purchasePurpose, setPurchasePurpose] = useState("primary_residence");
  const [creditScoreRange, setCreditScoreRange] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setMortgageTimeline("1_2_months");
    setPreApprovalStatus("need_now");
    setPurchasePurpose("primary_residence");
    setCreditScoreRange("");
    setEmploymentStatus("");
    setPropertyAddress("");
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
    () => Boolean(message.trim() && mortgageTimeline && preApprovalStatus && purchasePurpose && !submitting),
    [message, mortgageTimeline, preApprovalStatus, purchasePurpose, submitting],
  );

  const handleSubmit = async () => {
    setError("");
    if (!message.trim()) {
      setError("Please add your question.");
      return;
    }
    if (!mortgageTimeline || !preApprovalStatus || !purchasePurpose) {
      setError("Please complete the required fields.");
      return;
    }

    await onSubmit?.({
      message: message.trim(),
      mortgage_timeline: mortgageTimeline,
      pre_approval_status: preApprovalStatus,
      purchase_purpose: purchasePurpose,
      credit_score_range: creditScoreRange,
      employment_status: employmentStatus,
      property_address: propertyAddress.trim(),
    });
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex h-[100dvh] w-screen items-center justify-center bg-slate-950/40 p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close inquiry modal"
        onClick={onClose}
        disabled={submitting}
      />

      <div className="relative flex max-h-[min(90dvh,44rem)] w-full max-w-[34rem] flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-slate-950/20 ring-1 ring-slate-900/[0.03]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-5 py-4">
          <div>
            <h3 className="text-base font-bold tracking-tight text-text-heading">Ask {professionalName}</h3>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Submit a mortgage inquiry. The broker will review it from their leads.
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
              Your question <span className="text-red-500">*</span>
            </span>
            <textarea
              className={`${inputClass} min-h-24 resize-y leading-5`}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe your mortgage, pre-approval, or refinance question..."
              maxLength={1200}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Mortgage timeline"
              value={mortgageTimeline}
              onChange={setMortgageTimeline}
              options={MORTGAGE_TIMELINE_OPTIONS}
              required
            />
            <SelectField
              label="Pre-approval status"
              value={preApprovalStatus}
              onChange={setPreApprovalStatus}
              options={PRE_APPROVAL_OPTIONS}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Financing purpose"
              value={purchasePurpose}
              onChange={setPurchasePurpose}
              options={PURPOSE_OPTIONS}
              required
            />
            <SelectField
              label="Credit score range"
              value={creditScoreRange}
              onChange={setCreditScoreRange}
              options={CREDIT_OPTIONS}
            />
          </div>

          <SelectField
            label="Employment status"
            value={employmentStatus}
            onChange={setEmploymentStatus}
            options={EMPLOYMENT_OPTIONS}
          />

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
              Property address / location
            </span>
            <input
              className={inputClass}
              value={propertyAddress}
              onChange={(event) => setPropertyAddress(event.target.value)}
              placeholder="e.g. Toronto, Mississauga, Downtown"
              maxLength={180}
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-text-heading shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            {submitting ? "Submitting..." : "Send inquiry"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
